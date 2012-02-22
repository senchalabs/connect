
require 'optparse'

module Commander
  class Runner
    
    #--
    # Exceptions
    #++

    class CommandError < StandardError; end
    class InvalidCommandError < CommandError; end
    
    ##
    # Array of commands.
    
    attr_reader :commands
    
    ##
    # Global options.
    
    attr_reader :options
    
    ##
    # Hash of help formatter aliases.
    
    attr_reader :help_formatter_aliases

    ##
    # Initialize a new command runner. Optionally
    # supplying _args_ for mocking, or arbitrary usage.
    
    def initialize args = ARGV
      @args, @commands, @aliases, @options = args, {}, {}, []
      @help_formatter_aliases = help_formatter_alias_defaults
      @program = program_defaults
      create_default_commands
    end
    
    ##
    # Return singleton Runner instance.
    
    def self.instance
      @singleton ||= new
    end
    
    ##
    # Run command parsing and execution process.
    
    def run!
      trace = false
      require_program :version, :description
      trap('INT') { abort program(:int_message) } if program(:int_message)
      trap('INT') { program(:int_block).call } if program(:int_block)
      global_option('-h', '--help', 'Display help documentation') { command(:help).run *@args[1..-1]; return }
      global_option('-v', '--version', 'Display version information') { say version; return } 
      global_option('-t', '--trace', 'Display backtrace when an error occurs') { trace = true }
      parse_global_options
      remove_global_options options, @args
      unless trace
        begin
          run_active_command
        rescue InvalidCommandError => e
          abort "#{e}. Use --help for more information"
        rescue \
          OptionParser::InvalidOption, 
          OptionParser::InvalidArgument,
          OptionParser::MissingArgument => e
          abort e
        rescue => e
          abort "error: #{e}. Use --trace to view backtrace"
        end
      else
        run_active_command
      end
    end
    
    ##
    # Return program version.
    
    def version
      '%s %s' % [program(:name), program(:version)]
    end
    
    ##
    # Assign program information.
    #
    # === Examples
    #    
    #   # Set data
    #   program :name, 'Commander'
    #   program :version, Commander::VERSION
    #   program :description, 'Commander utility program.'
    #   program :help, 'Copyright', '2008 TJ Holowaychuk'
    #   program :help, 'Anything', 'You want'
    #   program :int_message 'Bye bye!'
    #   program :help_formatter, :compact
    #   program :help_formatter, Commander::HelpFormatter::TerminalCompact
    #   
    #   # Get data
    #   program :name # => 'Commander'
    #
    # === Keys
    #
    #   :version         (required) Program version triple, ex: '0.0.1'
    #   :description     (required) Program description
    #   :name            Program name, defaults to basename of executable
    #   :help_formatter  Defaults to Commander::HelpFormatter::Terminal
    #   :help            Allows addition of arbitrary global help blocks
    #   :int_message     Message to display when interrupted (CTRL + C)
    #
    
    def program key, *args, &block
      if key == :help and !args.empty?
        @program[:help] ||= {}
        @program[:help][args.first] = args.at(1)
      elsif key == :help_formatter && !args.empty?
        @program[key] = (@help_formatter_aliases[args.first] || args.first)
      elsif block
        @program[key] = block
      else
        @program[key] = *args unless args.empty?
        @program[key]
      end
    end
    
    ##
    # Creates and yields a command instance when a block is passed.
    # Otherwise attempts to return the command, raising InvalidCommandError when
    # it does not exist.
    #
    # === Examples
    #    
    #   command :my_command do |c|
    #     c.when_called do |args|
    #       # Code
    #     end
    #   end
    #
    
    def command name, &block
      yield add_command(Commander::Command.new(name)) if block
      @commands[name.to_s]
    end
    
    ##
    # Add a global option; follows the same syntax as Command#option
    # This would be used for switches such as --version, --trace, etc.
    
    def global_option *args, &block
      switches, description = Runner.separate_switches_from_description *args
      @options << {
        :args => args,
        :proc => block,
        :switches => switches,
        :description => description,
      }
    end
    
    ##
    # Alias command _name_ with _alias_name_. Optionally _args_ may be passed
    # as if they were being passed straight to the original command via the command-line.
    
    def alias_command alias_name, name, *args
      @commands[alias_name.to_s] = command name
      @aliases[alias_name.to_s] = args
    end
    
    ##
    # Default command _name_ to be used when no other
    # command is found in the arguments.
    
    def default_command name
      @default_command = name
    end
    
    ##
    # Add a command object to this runner.
    
    def add_command command
      @commands[command.name] = command
    end
    
    ##
    # Check if command _name_ is an alias.
    
    def alias? name
      @aliases.include? name.to_s
    end
    
    ##
    # Check if a command _name_ exists.
    
    def command_exists? name
      @commands[name.to_s]
    end
    
    #:stopdoc:
    
    ##
    # Get active command within arguments passed to this runner.
    
    def active_command
      @__active_command ||= command(command_name_from_args)
    end
    
    ##
    # Attempts to locate a command name from within the arguments.
    # Supports multi-word commands, using the largest possible match.
    
    def command_name_from_args
      @__command_name_from_args ||= (valid_command_names_from(*@args.dup).sort.last || @default_command)
    end
    
    ##
    # Returns array of valid command names found within _args_.
    
    def valid_command_names_from *args
      arg_string = args.delete_if { |value| value =~ /^-/ }.join ' '
      commands.keys.find_all { |name| name if /^#{name}/.match arg_string }
    end
    
    ##
    # Help formatter instance.
    
    def help_formatter
      @__help_formatter ||= program(:help_formatter).new self
    end
    
    ##
    # Return arguments without the command name.
    
    def args_without_command_name
      removed = []
      parts = command_name_from_args.split rescue []
      @args.dup.delete_if do |arg|
        removed << arg if parts.include?(arg) and not removed.include?(arg)
      end
    end
    
    ##
    # Returns hash of help formatter alias defaults.
    
    def help_formatter_alias_defaults
      return :compact => HelpFormatter::TerminalCompact
    end
    
    ##
    # Returns hash of program defaults.
    
    def program_defaults
      return :help_formatter => HelpFormatter::Terminal, 
             :name => File.basename($0)
    end
    
    ##
    # Creates default commands such as 'help' which is 
    # essentially the same as using the --help switch.
    
    def create_default_commands
      command :help do |c|
        c.syntax = 'commander help [command]'
        c.description = 'Display global or [command] help documentation.'
        c.example 'Display global help', 'command help'
        c.example "Display help for 'foo'", 'command help foo'
        c.when_called do |args, options|
          enable_paging
          if args.empty?
            say help_formatter.render 
          else
            command = command args.join(' ')
            require_valid_command command
            say help_formatter.render_command(command)
          end
        end
      end
    end
    
    ##
    # Raises InvalidCommandError when a _command_ is not found.
    
    def require_valid_command command = active_command
      raise InvalidCommandError, 'invalid command', caller if command.nil?
    end
    
    ##
    # Removes global _options_ from _args_. This prevents an invalid
    # option error from occurring when options are parsed
    # again for the command.
    
    def remove_global_options options, args
      # TODO: refactor with flipflop, please TJ ! have time to refactor me !
      options.each do |option|
        switches = option[:switches]
        past_switch, arg_removed = false, false
        args.delete_if do |arg|
          # TODO: clean this up, no rescuing ;)
          if switches.any? { |switch| switch.match(/^#{arg}/) rescue false }
            past_switch, arg_removed = true, false
            true
          elsif past_switch && !arg_removed && arg !~ /^-/ 
            arg_removed = true
          else
            arg_removed = true
            false
          end
        end
      end
    end
            
    ##
    # Parse global command options.
    
    def parse_global_options
      options.inject OptionParser.new do |options, option|
        options.on *option[:args], &global_option_proc(option[:switches], &option[:proc])
      end.parse! @args.dup
    rescue OptionParser::InvalidOption
      # Ignore invalid options since options will be further 
      # parsed by our sub commands.
    end
    
    ##
    # Returns a proc allowing for commands to inherit global options.
    # This functionality works whether a block is present for the global
    # option or not, so simple switches such as --verbose can be used
    # without a block, and used throughout all commands.
    
    def global_option_proc switches, &block
      lambda do |value|
        unless active_command.nil?
          active_command.proxy_options << [Runner.switch_to_sym(switches.last), value]
        end
        yield value if block and !value.nil?
      end
    end
    
    ##
    # Raises a CommandError when the program any of the _keys_ are not present, or empty.
        
    def require_program *keys
      keys.each do |key|
        raise CommandError, "program #{key} required" if program(key).nil? or program(key).empty?
      end
    end
    
    ##
    # Return switches and description separated from the _args_ passed.

    def self.separate_switches_from_description *args
      switches = args.find_all { |arg| arg.to_s =~ /^-/ } 
      description = args.last unless !args.last.is_a? String or args.last.match(/^-/)
      return switches, description
    end
    
    ##
    # Attempts to generate a method name symbol from +switch+.
    # For example:
    # 
    #   -h                 # => :h
    #   --trace            # => :trace
    #   --some-switch      # => :some_switch
    #   --[no-]feature     # => :feature
    #   --file FILE        # => :file
    #   --list of,things   # => :list
    #
    
    def self.switch_to_sym switch
      switch.scan(/[\-\]](\w+)/).join('_').to_sym rescue nil
    end
    
    ##
    # Run the active command.
    
    def run_active_command
      require_valid_command
      if alias? command_name_from_args
        active_command.run *(@aliases[command_name_from_args.to_s] + args_without_command_name)
      else
        active_command.run *args_without_command_name
      end      
    end
     
    def say *args #:nodoc: 
      $terminal.say *args
    end

  end
end

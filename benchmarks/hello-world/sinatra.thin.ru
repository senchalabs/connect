
require 'rubygems'
require 'sinatra'

get '/' do
  'Hello World'
end

disable :logging
set :environment, :production
run Sinatra::Application


require 'rubygems'
require 'sinatra'

get '/' do
  'Hello World'
end

disable :logging
run Sinatra::Application

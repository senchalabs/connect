
require 'rubygems'
require 'sinatra'

get '/jquery.js' do
  send_file File.dirname(__FILE__) + '/../public/jquery.js'
end

disable :logging
set :environment, :production
run Sinatra::Application

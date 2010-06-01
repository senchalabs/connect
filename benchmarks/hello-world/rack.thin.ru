
body = 'Hello World'

run lambda {
  [200, {
    'Content-Type' => 'text/plain',
    'Content-Length' => body.length.to_s
  }, body]
}
'use strict'

var assert = require('assert')
var http = require('http')

module.exports = createRawAgent

function createRawAgent (app) {
  return new RawAgent(app)
}

function RawAgent (app) {
  this.app = app

  this._open = 0
  this._port = null
  this._server = null
}

RawAgent.prototype.get = function get (path) {
  return new RawRequest(this, 'GET', path)
}

RawAgent.prototype._close = function _close (cb) {
  if (--this._open) {
    return process.nextTick(cb)
  }

  this._server.close(cb)
}

RawAgent.prototype._start = function _start (cb) {
  this._open++

  if (this._port) {
    return process.nextTick(cb)
  }

  if (!this._server) {
    this._server = http.createServer(this.app).listen()
  }

  var agent = this
  this._server.on('listening', function onListening () {
    agent._port = this.address().port
    cb()
  })
}

function RawRequest (agent, method, path) {
  this.agent = agent
  this.method = method
  this.path = path
}

RawRequest.prototype.expect = function expect (status, body, callback) {
  var request = this
  this.agent._start(function onStart () {
    var req = http.request({
      host: '127.0.0.1',
      method: request.method,
      path: request.path,
      port: request.agent._port
    })

    req.on('response', function (res) {
      var buf = ''

      res.setEncoding('utf8')
      res.on('data', function onData (s) { buf += s })
      res.on('end', function onEnd () {
        var err = null

        try {
          assert.equal(res.statusCode, status, 'expected ' + status + ' status, got ' + res.statusCode)

          if (body instanceof RegExp) {
            assert.ok(body.test(buf), 'expected body ' + buf + ' to match ' + body)
          } else {
            assert.equal(buf, body, 'expected ' + body + ' response body, got ' + buf)
          }
        } catch (e) {
          err = e
        }

        request.agent._close(function onClose () {
          callback(err)
        })
      })
    })

    req.end()
  })
}

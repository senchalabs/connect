/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert');

var validators = {};
validators["^\/user"] = {
	messages: {
		f: "This data is just wrong."
	},
	fieldException: function() { throw "This is bad... Very bad."; },
	name:"required",
	field1:function(val) { return true;},
	custom:function(val) { return false;}
};

var app = connect.createServer(
  connect.bodyParser(),
  connect.validator(validators),
  function(req, res){
  	res.writeHead(200);
  	res.end(JSON.stringify(req.body));
});

function getReq(type) {
	return { 
 	url: '/'+type, 
	method:'POST',
	headers: { 'Content-Type': 'application/json' }
	}
}

var notype  = '{"user":{"name":"jt"}}'; 
var account = '{"__type":"account","user":{"name":"jt"}}'; 

module.exports = {

  'test POST with no data/no validator': function(){
	 var req = getReq("user");

	 var app = connect.createServer(
  		connect.bodyParser(),
  		connect.validator({}),
  			function(req, res){
  			res.writeHead(200);
  			res.end(JSON.stringify(req.body));
		});

	 req.data = ''; 

    assert.response(app,
     req,{
			body: '{}',
			status: 200
	 });
  },

  'test validate user': function(){
	 var json    = '{"name":"jt"}'; 
	 var req = getReq('user');
  	 req.data = json;
	 var res = {
	 	status:200,
		body: JSON.stringify({
			name: "jt",
			"errors":{
				"fieldException":"Not valid.",
				"custom":"Not valid."
			}
		})
	 };
    assert.response(app,req,res);
  },
  'validate custom': function() {
		validators["^\/someurl"] = {
			messages: {
				f: "This is not f."
			},
			f: function(val) {
				return val === 'f';
			}

		};
	 	var req = getReq("someurl");

	 	var app = connect.createServer(
  		connect.bodyParser(),
  		connect.validator(validators),
  			function(req, res){
  			res.writeHead(200);
  			res.end(JSON.stringify(req.body));
		});

 		req.data = '{"f":1}';
    	assert.response(app,
     		req,{
				body: '{"f":1,"errors":{"f":"This is not f."}}',
				status: 200
	 		});

  }

};

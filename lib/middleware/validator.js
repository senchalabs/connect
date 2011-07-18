
/*!
 * Connect - Validator 
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var bodyParser = require('./bodyParser')();

var defaultValidator = {
	messages : {
		required: "This field is required.",
		email:    "Enter a valid emails address.",
		url:      "Enter a valid URL."
	},
	required: function(v) {
		return v !== undefined && v !== null && v !== ''; 
	}, 
	email: function(v) {
		return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v);
	},
	url: function(v) {
		return /^(http|https|ftp):\/\//.test(v);
	}
};

exports = module.exports = function validator(validators) {
	
	return function validator(req, res, next) {
		var body = req.body;
		if(!validators ||	!body || !body.__type) {
			return next();
		} else if(!validators[body.__type]) {
			req.body.errors = {"no type": "No type field on object."};
			// XXX Break the chain?
			return next();	
		}

		var validator = validators[body.__type];
		req.body.errors = errors = {};
		for( var field in validator ) {
			if(validator.hasOwnProperty(field)) {
				var value = body[field];	
				var validatorFn = validator[field];
				var isDefault = false;
				var typeofValidation;
				if(typeof validatorFn === "string") {
					isDefault = true;	
					typeofValidation = validatorFn;
					validatorFn = defaultValidator[validatorFn];
				}
				
				if(typeof validatorFn === "function") {
					var isValid = false;
					try { 
						isValid = validatorFn(value);
					} catch(e) {
						console.error('An exception was thrown from your validator: ' + e);	
					}
					if(!isValid) {
						if(isDefault) {
							errors[field] = defaultValidator.messages[typeofValidation];
						} else {
							if(validator.messages) {
								errors[field] = validator.messages[field];
							}
							if(!errors[field]) {
								errors[field] = 'Not valid.';
							}
						}
					}
				}

			}
		}

		next();
	}
};


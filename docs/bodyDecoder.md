## Body Decoder

The _bodyDecoder_ middleware sniffs the _Content-Type_ header, and decodes the request body appropriately. Supported by default are the _application/x-www-form-urlencoded_, and _application/json_ content types. To extend simply:

    require('connect/filters/body-decoder').decode['some-mime/type'] = function(str){
	    return 'whatever';
    };

### See Also

  * methodOverride
## Flash

The _flash_ middleware provides persistent messaging. This middleware requires _session_ to function. 

    req.flash('info', 'email sent');
    req.flash('error', 'email delivery failed');
    req.flash('info', 'email re-sent');
    // => 2
    
    req.flash('info');
    // => ['email sent', 'email re-sent']
    
    req.flash('info');
    // => []
    
    req.flash();
    // => { error: ['email delivery failed'], info: [] }

## See Also

  * cookie
  * session
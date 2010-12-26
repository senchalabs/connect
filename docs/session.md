## Session

The _session_ middleware provides persistence between requests. If we wish to supply a custom `Store` subclass, or pass options to the store itself, we can configure it like so:

    var MemoryStore = connect.session.MemoryStore;
    connect.createServer(
		  connect.cookieDecoder(),
		  connect.session({ store: new MemoryStore({ reapInterval: 60000 * 10 }) }),
    );

**NOTE:** _cookieDecoder_ must be above _session_ within the stack

### Options

    store        Custom Store subclass
    fingerprint  Function passed the request which computes a fingerprint of the user.
                 Defaults to an md5 hash of the session.id, remoteAddress and User-Agent strings.

### Store

Abstract store which can be subclassed. To comply with `Store` you should define:

    #get(hash, callback)         Fetch session data via the session fingerprint and callback(err, data)
    #set(hash, data, callback)   Commit the session for the fingerprint and callback(err)

Your store may also want to comply with the default `MemoryStore`, by providing:

    #clear(callback)            Clear all sessions and callback(err)
    #all(callback)              Fetches all active sessions and callback(err, sessions)
    #length(callback)           Fetches the total number of sessions and callback(err, len)

Inherited methods defined by Store:

    #destroy(hash, callback)    Calls #set(hash, null, callback)
    #regenerate(req, callback)  Destroys the session, creates a new one, and callback(err)

### MemoryStore

Stores session data in memory, options are as follows:

    reapInterval    Interval in milliseconds used to reap stale sessions. Defaults to 10 minutes
    maxAage         Maximum session age in milliseconds. Defaults to 4 hours
    cookie          Session cookie options. Defaults to { path: '/', httpOnly: true }

### Session

Your store interacts with instances of `Session`. The following methods are available:

    #touch()                 Updates the lastAccess property
    #destroy(callback)       Destroy this session and callback(err, destroyedBoolean)
    #regenerate(callback)    Destroy this session, creates a new one and callback(err)

### See Also

  * cookieDecoder
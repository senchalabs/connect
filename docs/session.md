## Session

The _session_ middleware provides persistence between requests. If we wish to supply a custom `Store` subclass, or pass options to the store itself, we can configure it like so:

    var MemoryStore = require('connect/middleware/session/memory').MemoryStore;
    connect.createServer(
		connect.cookieDecoder(),
		connect.session({ store: new MemoryStore({ reapInterval: 60000 * 10 }) }),
	);

**NOTE:** _cookieDecoder_ must be above _session_ within the stack

### Options

    store        Custom Store subclass
    fingerprint  Function passed sid and the request which computes a fingerprint of the user.
                 Defaults to remoteAddress and User-Agent strings.

### Store

Abstract store which can be subclassed. To comply with `Store` you should define:

    #fetch(req, callback)       Fetch session for the given request
    #commit(req, callback)      Commit the session for the given request
    #clear(callback)            Clear all sessions
    #destroy(req, callback)     Destroy session for the given request
    #length(callback)           Fetches the total number of sessions

Complimentary methods:

    #regenerate(req, callback)  Destroys the session, and creates a new one
    #createSession()            Returns a new Session instance with generated id

### MemoryStore

Stores session data in memory, options are as follows:

    key             Cookie key used to store session ids. Defaults to "connect.sid"
    reapInterval    Interval in milliseconds used to reap stale sessions. Defaults to 10 minutes
    maxAage         Maximum session age in milliseconds. Defaults to 4 hours
    cookie          Session cookie options. Defaults to { path: '/', httpOnly: true }

### Session

Your store interacts with instances of `Session`, however when committing / fetching sessions you may have to convert an intermediate representation back to a `Session`. The following methods are available:

    #touch()        Updates the lastAccess property

### See Also

  * cookieDecoder
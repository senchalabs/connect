var message;

// Always returns 404, default end of chain handler.
module.exports = {
    
    setup: function (env, customMessage) {
        message = customMessage || "Resource not found";
    },

    handle: function (req, res, next) {
        res.writeHead(404, {
            "Content-Type": "text/plain",
            "Content-Length": message.length
        });
        res.end(message);
    }

};
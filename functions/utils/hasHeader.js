// Currently unable to create a middleware from this due to having difficulties accessing functions.config() from a middleware
module.exports = function hasHeader(req, header) {
    try {
        const contentType = req.get("content-type").toString().trim()
        console.log("Valid header: " + (contentType === header))
        if (contentType !== header.toString().trim()) {
            return false
        }
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

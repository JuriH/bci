module.exports = function getToken(req) {
    // Remove "Basic" from the header value
    const token = req.headers.authorization
        .substring(
            req.headers.authorization.indexOf(" "),
            req.headers.authorization.length
        )
        .trim()
    return token
}

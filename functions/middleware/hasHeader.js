module.exports = hasHeader = (header) => {
    return (req, res, next) => {
        try {
            const contentType = req.get("content-type").toString().trim()
            console.log(contentType)
            if (contentType !== header.toString().trim()) {
                res.status(400).send({ message: "Missing header" })
                return
            } else {
                next()
            }
        } catch (err) {
            res.status(400).send({ message: "Missing header" })
            return
        }
    }
}

module.exports = jsonValidator = (minFiles) => {
    return (req, res, next) => {
        if (req.files.length < minFiles) {
            res.status(400).send({
                message: "Not enough files provided",
            })
            return
        }
        next()
    }
}

const Ajv = require("ajv")
const ajv = new Ajv({ strict: false })

module.exports = isValidJson = (schema) => {
    return (req, res, next) => {
        console.log(schema.schema)
        const validate = ajv.compile(schema)
        const valid = validate(req.body)
        if (!valid) {
            res.status(400).send({
                message: "JSON doesn't match API's requirements",
            })
            return
        }
        next()
    }
}

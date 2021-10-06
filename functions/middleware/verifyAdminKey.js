require("module-alias/register")
const { functions } = require("@init")

module.exports = verifyAdminKey = () => {
    return (req, res, next) => {
        console.log(functions.config().bci.admin.key)
        console.log(req.get("key"))
        if (
            req.get("key").toString().trim() === undefined ||
            req.get("key").toString().trim() !==
                `${functions.config().bci.admin.key.toString().trim()}`
        ) {
            console.log("Invalid admin key")
            res.sendStatus(401)
            return
        }
        next()
    }
}

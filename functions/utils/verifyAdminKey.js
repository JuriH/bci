require("module-alias/register")
const { functions } = require("@init")

// Currently unable to create a middleware from this due to having difficulties accessing functions.config() from a middleware
module.exports = function verifyAdminKey(req) {
    try {
        if (
            req.get("key").toString().trim() === undefined ||
            req.get("key").toString().trim() !==
                `${functions.config().bci.admin.key.toString().trim()}`
        ) {
            console.log("Invalid admin key")
            return false
        }
    } catch (err) {
        console.log(err)
        return false
    }
    return true
}

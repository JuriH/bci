require("module-alias/register")
const { admin } = require("@init")

module.exports = async function setUserRole(role) {
    try {
        // Make user an admin
        await admin.auth().setCustomUserCredentials(userCredentials.uid, {
            roles: `${role}`,
        })
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

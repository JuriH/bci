// https://firebase.google.com/docs/auth/admin/custom-claims

require("module-alias/register")
const { admin } = require("@init")

// Get email and password from BASIC Auth
module.exports = async function getUserCredentialsFromToken(uid) {
    try {
        const userCredentials = await admin.auth().getUser(uid)
        return userCredentials
    } catch (err) {
        console.log(err)
        return null
    }
}

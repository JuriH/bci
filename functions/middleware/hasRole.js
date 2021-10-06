require("module-alias/register")
const getUserCredentialsFromToken = require("@utils/getUserCredentialsFromToken")
const { admin } = require("@init")

module.exports = hasRole = async (roles) => {
    return async (req, res, next) => {
        const userCredentials = getUserCredentialsFromToken(req)

        const userRecord = await admin.auth().getUser(userCredentials.uid)

        let authorized = false
        roles.some((role) => {
            if (
                userRecord.customClaims[`${role}`] !== undefined &&
                userRecord.customClaims[`${role}`]
            ) {
                authorized = true
                return true
            }
        })

        if (!authorized) {
            res.sendStatus(401)
            return
        }
        next()
    }
}

require("module-alias/register")
const getToken = require("@utils/getToken")
const { admin } = require("@init")

// Middleware to check if given login details match an existing user
//
// To use REST API with emulator:
// https://stackoverflow.com/a/66343248
module.exports = async function verifyToken(req, res, next) {
    try {
        const token = getToken(req)

        try {
            // Get user's Firebase ID (UID) from an ID token:
            // https://firebase.google.com/docs/auth/admin/verify-id-tokens
            const decodedToken = await admin.auth().verifyIdToken(token)
            // Store UID in local variable:
            // https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js
            res.locals.uid = decodedToken.uid
            next()
        } catch (err) {
            // Exchange refresh token for a new ID token while also refreshing the refresh token
            console.log(err)
            res.status(401).send({
                message: "Unauthorized",
            })
            return // Early exit
        }
    } catch (err) {
        console.log(err)
        res.status(409).send({
            message: "Something went wrong, try again later",
        })
        return // Early exit
    }
}

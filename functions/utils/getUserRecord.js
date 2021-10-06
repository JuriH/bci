const { admin } = require("@init")

module.exports = async function getUserRecord(res, email) {
    try {
        // Get user-JSON from Firebase
        let userRecord = await admin.auth().getUserByEmail(email)
        userRecord = userRecord.toJSON()

        return userRecord
    } catch (err) {
        console.log(err)
        res.status(400).send({
            message: "Unable to retrieve UserRecord for given email address",
        })
    }
}

const { admin } = require("@init")

// Get UserRecord with UID:
// https://firebase.google.com/docs/reference/admin/node/admin.auth.UserRecord
module.exports = async function getUserRecordFromUid(res, uid) {
    try {
        // Get user-JSON from Firebase
        let userRecord = await admin.auth().getUser(uid)
        userRecord = await userRecord.toJSON()
        return userRecord
    } catch (err) {
        console.log(err)
        res.status(400).send({
            message: "Unable to retrieve UserRecord for given UID: " + uid,
        })
    }
}

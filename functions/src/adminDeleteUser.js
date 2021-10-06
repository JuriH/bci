require("module-alias/register")
const verifyToken = require("@middleware/verifyToken")
const hasRole = require("@middleware/hasRole")
// const verifyAdminKey = require("@middleware/verifyAdminKey")
const verifyAdminKey = require("@utils/verifyAdminKey")
const getUserCredentialsFromToken = require("@utils/getUserCredentialsFromToken")
const { admin } = require("@init")

module.exports = (app) => {
    app.delete("/admin/users/:id", async (req, res) => {
        console.log("adminDeleteUser")
        const valid = verifyAdminKey(req)
        if (!valid) {
            res.sendStatus(401)
            return
        }
        try {
            // Delete user from Firebase
            console.log(req.params.id)
            await admin.auth().deleteUser(req.params.id)
            // Delete user's user-document in Firestore
            await admin
                .firestore()
                .collection("users")
                .doc(req.params.id)
                .delete()
            res.status(200).send({ message: "User successfully deleted" })
        } catch (err) {
            console.log(err)
            res.status(409).send({
                message: "Error occurred when deleting user",
            })
        }
    })
}

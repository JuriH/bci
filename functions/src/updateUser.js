require("module-alias/register")
const verifyToken = require("@middleware/verifyToken")
const getToken = require("@utils/getToken")
const regex = require("@utils/regex")
const { admin, firestore } = require("@init")

// Update user
module.exports = (app) => {
    app.put("/users", verifyToken, async (req, res) => {
        try {
            // Check what information user wants to update, adding them dynamically to an object
            const toUpdate = {}

            if (req.body.name !== undefined) {
                if (regex("name", req.body.name)) {
                    toUpdate.name = req.body.name
                } else {
                    res.status(409).send({
                        message: "Invalid name given",
                    })
                }
            }

            if (req.body.email !== undefined) {
                if (regex("email", req.body.email)) {
                    toUpdate.email = req.body.email
                } else {
                    res.status(409).send({
                        message: "Invalid email address given",
                    })
                }
            }
            if (req.body.password !== undefined)
                if (regex("password", req.body.password)) {
                    toUpdate.password = req.body.password
                } else {
                    res.status(409).send({
                        message: "Invalid password given",
                    })
                }
            if (req.body.phone !== undefined) {
                if (regex("phone", req.body.phone)) {
                    toUpdate.phone = req.body.phone
                } else {
                    res.status(409).send({
                        message: "Invalid phone number given",
                    })
                }
            }

            const decodedIdToken = admin.auth().verifyIdToken(getToken(req))
            console.log(JSON.stringify(decodedIdToken))

            // Update Firebase user-object with admin SDK
            await admin.auth().updateUser(decodedIdToken.uid, toUpdate)

            // Update user's document
            await firestore
                .collection(userCollection)
                .doc(decodedIdToken.uid)
                .set(toUpdate, { merge: true })

            res.status(200)
        } catch (err) {
            console.log(err)
            res.status(400).send({
                message: "Error occurred when updating user",
            })
        }
    })
}

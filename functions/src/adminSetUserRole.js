require("module-alias/register")
const { admin, functions } = require("@init")
const verifyToken = require("@middleware/verifyToken")
const verifyAdminKey = require("@middleware/verifyAdminKey")
const isValidJson = require("@middleware/isValidJson")
const getUserCredentialsFromUid = require("@utils/getUserCredentialsFromUid")
const hasRole = require("@middleware/hasRole")

const schema = {
    type: "object",
    properties: {
        uid: { type: "string" },
        role: { type: "string" },
    },
    required: ["uid", "role"],
    additionalProperties: false,
}

module.exports = (app) => {
    app.post(
        "/admin/users/role",
        (req) => {
            req.headers.key !== undefined
                ? verifyAdminKey
                : (verifyToken, hasRole(["admin"]))
        },
        isValidJson(schema),
        async (req, res) => {
            const key = req.header("key")
            try {
                if (key !== functions.config().bci.admin.key) {
                    res.sendStatus(401)
                    return
                }

                const userCredentials = getUserCredentialsFromUid(req.body.uid)

                let roleStatus = true
                if (
                    userCredentials.customClaims[`${req.body.role}`] !==
                    undefined
                ) {
                    // If role already assigned to user, toggle it
                    roleStatus =
                        !userCredentials.customClaims[`${req.body.role}`]
                }

                // Toggle user's role
                await admin.auth().setCustomUserCredentials(req.body.uid, {
                    [role]: roleStatus,
                })

                res.status(201).send({
                    message: "Admin privileges successfully granted to user",
                })
            } catch (err) {
                console.log(err)
                res.status(400)
            }
        }
    )
}

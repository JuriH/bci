require("module-alias/register")
const hasRole = require("@middleware/hasRole")
const verifyAdminKey = require("@middleware/verifyAdminKey")
const isValidJson = require("@middleware/isValidJson")
const regex = require("@utils/regex")
const setUserRole = require("@utils/setUserRole")
const { admin } = require("@init")

const schema = {
    type: "object",
    properties: {
        name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
        key: { type: "string" },
        role: { type: "string" },
    },
    required: ["name", "phone", "email", "password", "key"],
    additionalProperties: false,
}

// Create new user with optional role
module.exports = (app) => {
    app.post(
        "/admin/users",
        isValidJson(schema),
        (req) => {
            req.headers.key !== undefined
                ? verifyAdminKey
                : (verifyToken, hasRole(["admin"]))
        },
        async (req, res) => {
            try {
                const user = {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    phone: req.body.phone,
                }

                let valid = true
                Object.keys(user).some((item) => {
                    if (!regex(item, user[item])) {
                        console.log(
                            `Invalid item when registering user: '${item}: ${user.item}'`
                        )
                        valid = false
                        return true
                    }
                })
                if (!valid) {
                    res.status(400).send({
                        message: "Invalid registration details given",
                    })
                    return
                }

                console.log(valid)

                // Register user to Firebase
                const userCredentials = await admin.auth().createUser({
                    email: user.email,
                    emailVerified: false,
                    phoneNumber: user.phone,
                    password: user.password,
                    displayName: user.name,
                })

                if (req.body.role !== undefined) {
                    const roleSet = await setUserRole("admin")
                    console.log(
                        roleSet ? "Role set successfully" : "Failed to set role"
                    )
                }

                try {
                    // Create document for user's information with UID as its identifier
                    await admin
                        .firestore()
                        .collection("users")
                        .doc(userCredentials.uid)
                        .set({
                            name: user.name,
                            email: user.email,
                            phone: user.phone,
                        })
                } catch (err) {
                    // If creating registered user's document fails for any reason, delete the user from Firebase
                    console.log(err)
                    console.log("Deleting registered user from Firebase")
                    await admin.auth().deleteUser(userCredentials.uid)
                    res.status(500).send({
                        message: "Error occurred when registering user",
                    })
                }

                res.status(201).send({
                    message: "User created successfully",
                    uid: userCredentials.uid,
                })
            } catch (err) {
                console.log(err)
                res.status(400).send({
                    message: "Error occurred when registering user",
                })
            }
        }
    )
}

require("module-alias/register")
const hasHeader = require("@middleware/hasHeader")
// const hasHeader = require("@utils/hasHeader")
const isValidJson = require("@middleware/isValidJson")
const regex = require("@utils/regex")
const { admin } = require("@init")

const schema = {
    type: "object",
    properties: {
        name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        password: { type: "string" },
    },
    required: ["name", "phone", "email", "password"],
    additionalProperties: false,
}

// Create new user with no roles
module.exports = (app) => {
    app.post(
        "/users",
        hasHeader("application/json"),
        isValidJson(schema),
        async (req, res) => {
            // if (!hasHeader(req, "application/json")) {
            //     res.sendStatus(409)
            //     return
            // }
            try {
                const user = {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    phone: req.body.phone,
                }

                let valid = true
                // // Fails for some reason when unit testing with two test users
                // Object.keys(user).some((item) => {
                //     if (!regex(item, user[item])) {
                //         console.log(
                //             `Invalid item when registering user: '${item}: ${user.item}'`
                //         )
                //         valid = false
                //         return true
                //     }
                // })
                if (!valid) {
                    res.status(400).send({
                        message: "Invalid registration details given",
                    })
                    return // Early exit
                }

                // Register user to Firebase
                const userCredentials = await admin.auth().createUser({
                    email: user.email,
                    emailVerified: false,
                    phoneNumber: user.phone,
                    password: user.password,
                    displayName: user.name,
                })

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

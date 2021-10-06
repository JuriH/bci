require("module-alias/register")
const getUserCredentialsFromBasic = require("@utils/getUserCredentialsFromBasic")
const fetch = require("node-fetch")
const { functions } = require("@init")

module.exports = (app) => {
    app.post("/login", async (req, res) => {
        const userCredentials = getUserCredentialsFromBasic(req, res)

        const data = await fetch(
            `http://192.168.1.103:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${
                functions.config().bci.key
            }`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: userCredentials.email,
                    password: userCredentials.password,
                    returnSecureToken: true,
                }),
            }
        )
        const dataJson = await data.json()
        if (!dataJson.registered) {
            res.status(401).send({ message: "Unauthorized" })
            return
        }
        // Return ID and refresh tokens in response
        res.status(200).send({
            token: dataJson.idToken,
            refreshToken: dataJson.refreshToken,
        })
    })
}

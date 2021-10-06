require("module-alias/register")
const fetch = require("node-fetch")
const { functions } = require("@init")

// Get email and password from BASIC Auth
module.exports = async function getUserCredentialsFromToken(req) {
    if (req.headers.authorization === undefined) return null
    const token = req.headers.authorization
        .substring(
            req.headers.authorization.indexOf(" "),
            req.headers.authorization.length
        )
        .trim()

    const data = await fetch(
        `http://192.168.1.103:9099/identitytoolkit.googleapis.com/v1/accounts:lookup?key=
        ${functions.config().bci.key}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                idToken: token,
            }),
        }
    )
    let userCredentials = await data.json()
    userCredentials = userCredentials.users[0]
    return userCredentials
}

require("module-alias/register")
const fetch = require("node-fetch")
const getMachineIp = require("@utils/getMachineIp")
const { functions } = require("@init")

// Get email and password from BASIC Auth
module.exports = async function getUserCredentialsFromToken(req) {
    if (req.get("authorization") === undefined) return null
    const token = req
        .get("authorization")
        .substring(
            req.get("authorization").indexOf(" "),
            req.get("authorization").length
        )
        .trim()

    console.log("token: " + token)

    const data = await fetch(
        `http://${
            process.env.FUNCTIONS_EMULATOR
                ? `${getMachineIp()}:${functions.config().bci.auth.port}/`
                : ""
        }identitytoolkit.googleapis.com/v1/accounts:lookup?key=
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
    console.log("getUserCreds: " + userCredentials)
    userCredentials = userCredentials.users[0]
    return userCredentials
}

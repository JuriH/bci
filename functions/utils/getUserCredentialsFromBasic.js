// Get email and password from BASIC Auth
module.exports = function getUserCredentialsFromBasic(req, res) {
    if (req.headers.authorization === undefined) {
        res.status(400).send({ message: "Missing BASIC authentication header" })
        return
    }
    const auth = req.headers.authorization
    const loginDetails = auth.substring(auth.indexOf(" "), auth.length).trim()
    const userCredentialsArr = Buffer.from(loginDetails, "base64")
        .toString()
        .split(":")
    let userCredentialsObj = {}
    userCredentialsObj.email = userCredentialsArr[0]
    userCredentialsObj.password = userCredentialsArr[1]
    return userCredentialsObj
}

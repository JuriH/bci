const fetch = require("node-fetch")
const { functions } = require("@init")

module.exports = (app) => {
    app.post("/tokens", async (req, res) => {
        try {
            const fetchData = await fetch(
                `http://192.168.1.103:9099/securetoken.googleapis.com/v1/token?key=
                ${functions.config().bci.key}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: `grant_type=refresh_token&refresh_token=${req.params.refreshToken}`,
                }
            )

            res.status(200).send({
                message: "Tokens successfully refreshed",
                token: fetchData.id_token,
                refreshToken: fetchData.refresh_token,
            })
        } catch (err) {
            console.log(err)
            res.status(400).send({
                message: "Bad request",
            })
        }
    })
}

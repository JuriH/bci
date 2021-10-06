require("module-alias/register")
const { testSend } = require("@utils/testSend")

module.exports = (app) => {
    app.post("/test", async (req, res) => {
        res.status(200).send({ message: testSend(req.body.text) })
    })
}

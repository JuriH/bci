require("module-alias/register")
const { app, functions } = require("./init")

// Dynamically import all api-functions

const normalizedPath = require("path").join(__dirname, "src")

require("fs")
    .readdirSync(normalizedPath)
    .forEach((file) => {
        // console.log(file)
        require("./src/" + file.replace(".js", ""))(app)
    })

exports.bci = functions.https.onRequest(app)

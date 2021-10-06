require("module-alias/register")
const getMachineIp = require("@utils/getMachineIp")
const admin = require("firebase-admin")
const functions = require("firebase-functions")

// Initialize app once
if (!admin.apps.length) {
    const serviceAccount = require("./building-cloud-integration-a9feb99c7120.json")
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: functions.config().bci.storage.bucket.default.url,
    })
}

const auth = admin.auth()

const firestore = admin.firestore()
firestore.settings({
    host: process.env.FUNCTIONS_EMULATOR
        ? `${getMachineIp()}:${functions.config().bci.firestore.port}`
        : `localhost:${functions.config().bci.firestore.port}`,
    ssl: false,
})

// Initialize express server
const express = require("express")
const app = express()
const cors = require("cors")({ origin: true })
app.use(cors)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(function (err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        res.status(400).send({ message: "Invalid request" })
        return
    }
    next()
})

module.exports = {
    admin,
    auth,
    functions,
    firestore,
    app,
}

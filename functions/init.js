const admin = require("firebase-admin")
const ip = "192.168.1.103" // Localhost testing IP

const functions = require("firebase-functions")

// Initialize app once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(
            "building-cloud-integration-a9feb99c7120.json"
        ),
        storageBucket: functions.config().bci.storage.bucket.default.url,
    })
}

const auth = admin.auth()

const firestore = admin.firestore()
firestore.settings({
    host: process.env.FUNCTIONS_EMULATOR
        ? `${ip}:${functions.config().bci.firestore.port}`
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
    ip,
}

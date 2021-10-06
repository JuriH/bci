const { admin } = require("@init")

module.exports = async function updateListingFirestore(req, id, res) {
    // Create listing-document to Firestore
    let updatedListing = {}

    const data = req.body
    Object.keys(data).forEach((key) => {
        console.log(key + ": " + data[key])
        updatedListing[key] = data[key]
    })

    updatedListing["updatedAt"] = admin.firestore.FieldValue.serverTimestamp()

    try {
        await admin
            .firestore()
            .collection("listings")
            .doc(id)
            .update(updatedListing)
    } catch (err) {
        console.log(err)
        res.status(400).send({ message: "Listing doesn't exist" })
        return
    }
}

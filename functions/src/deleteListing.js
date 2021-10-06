require("module-alias/register")
const verifyToken = require("@middleware/verifyToken")
const getUserCredentialsFromToken = require("@utils/getUserCredentialsFromToken")
const { admin, functions } = require("@init")

async function deleteFromListings(listingId) {
    try {
        // Delete listing from listings-collection
        await admin.firestore().collection("listings").doc(listingId).delete()
    } catch (err) {
        // Was unable to delete user's listing from listings-collection
        console.log(err)
    }
}

async function deleteFromUser(uid, listingId) {
    const docRef = admin.firestore().collection("users").doc(uid)
    await docRef.update({
        listings: admin.firestore.FieldValue.arrayRemove(listingId),
    })
}

function deleteFromStorage(uid, listingId) {
    const bucket = admin
        .storage()
        .bucket(functions.config().bci.storage.bucket.default.name)

    bucket.deleteFiles(
        {
            prefix: `listings/${uid}/${listingId}`,
        },
        function (err) {
            if (err) {
                console.log(err)
            }
        }
    )
}

module.exports = (app) => {
    app.delete("/listings/:id", verifyToken, async (req, res) => {
        console.log("Delete listing")
        // https://firebase.google.com/docs/reference/rest/auth#section-get-account-info
        const userCredentials = await getUserCredentialsFromToken(req)

        const listingId = req.params.id

        const userRef = admin
            .firestore()
            .collection("users")
            .doc(userCredentials.localId)
        const userDoc = await userRef.get()
        // Check if document found for given user ID
        if (!userDoc.exists) {
            res.status(404).send({
                message: "No matching listing found for user",
            })
            return
        }
        // Check if given listing ID is found in user's document
        const userData = userDoc.data()
        if (!userData.listings.includes(listingId)) {
            res.status(404).send({
                message: "No matching listing found for user",
            })
            return
        }

        await deleteFromListings(listingId)
        deleteFromStorage(userCredentials.localId, listingId)
        await deleteFromUser(userCredentials.localId, listingId)
        res.status(200).send({ message: "Listing deleted" })
        return
    })
}

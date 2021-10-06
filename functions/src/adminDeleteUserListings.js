require("module-alias/register")
const verifyToken = require("@middleware/verifyToken")
const hasRole = require("@middleware/hasRole")
const isValidJson = require("@middleware/isValidJson")
const verifyAdminKey = require("@utils/verifyAdminKey")
const deleteImagesInStorage = require("@utils/deleteImagesInStorage")
const { admin } = require("@init")

module.exports = (app) => {
    app.delete(
        "/admin/users/:id/listings",
        // verifyAdminKey,
        async (req, res) => {
            try {
                console.log("adminDeleteUserListings")
                console.log("id: " + req.params.id)

                // Create reference to user's user-document
                const docRef = admin
                    .firestore()
                    .collection("users")
                    .doc(req.params.id)

                // Get all user's listing IDs
                const userDoc = await docRef.get()
                const usersListingsIds = userDoc.data().listings

                console.log("User's listings: " + usersListingsIds)

                // Delete references to user's listings in their user-document
                await docRef.update({
                    listings: [],
                })

                // Get all user's listings in listings-collection
                let userListingsQuery = admin
                    .firestore()
                    .collection("listings")
                    .where("creatorId", "==", `${req.params.id}`)

                // Get all paths to user's listings' media
                const mediaPathsArray = await userListingsQuery
                    .get()
                    .then((querySnapshot) => {
                        let mediaPathsArray = []
                        querySnapshot.forEach((documentSnapshot) => {
                            const docData = documentSnapshot.data()
                            console.log(docData.images)
                            mediaPathsArray.push(docData.images)
                        })
                        return mediaPathsArray
                    })

                console.log(mediaPathsArray)

                // Delete all media for user's listings
                mediaPathsArray.forEach((path) => {
                    console.log(path)
                    deleteImagesInStorage(path)
                })

                // Delete all user's listings from listings-collection
                usersListingsIds.forEach((listing) => {
                    admin
                        .firestore()
                        .collection("listings")
                        .doc(listing)
                        .delete()
                })

                res.status(200).send({
                    message: "User's listings successfully deleted",
                })
            } catch (err) {
                console.log(err)
                res.status(409).send({
                    message: "Error occurred when deleting user's listings",
                })
                return
            }
        }
    )
}

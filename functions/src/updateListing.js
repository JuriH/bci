require("module-alias/register")
const { admin, functions } = require("@init")
const verifyToken = require("@middleware/verifyToken")
const getToken = require("@utils/getToken")
const busboyMiddleware = require("@middleware/busboyMiddleware")
const isValidJson = require("@middleware/isValidJson")
const uploadImagesToStorage = require("@utils/uploadImagesToStorage")
const updateListingToFirestore = require("@utils/updateListingToFirestore")
const getUserCredentialsFromToken = require("@utils/getUserCredentialsFromToken")

const schema = {
    type: "object",
    properties: {
        title: { type: "string" },
        description: { type: "string" },
        category: { type: "string" },
        location: { type: "string" },
        askingPrice: { type: "string" },
        shipping: { type: "boolean" },
        pickup: { type: "boolean" },
        manufacturer: { type: "string" },
        image1: { isFileType: true },
        image2: { isFileType: true },
        image3: { isFileType: true },
        image4: { isFileType: true },
    },
    required: ["listingId"],
    anyOf: [
        "title",
        "description",
        "category",
        "location",
        "askingPrice",
        "shipping",
        "pickup",
        "manufacturer",
        "image1",
        "image2",
        "image3",
        "image4",
    ],
    additionalProperties: false,
}

//
// Update user's listing
//
module.exports = (app) => {
    app.put(
        "/listings/:id",
        verifyToken,
        isValidJson({ schema }),
        busboyMiddleware({
            files: 4, // Set maximum files to receive via request
            filetypes: ["image/jpeg", "image/jpg", "image/png"],
        }),
        async (req, res) => {
            console.log("updateListing")

            // To choose which user's listing to update
            const listingId = req.params.id

            // Verify that user is updating their own listing
            const token = getToken(req)
            const userCredentials = await getUserCredentialsFromToken(req)

            // Get the document to check it's creatorId
            try {
                const docRef = admin
                    .firestore()
                    .collection("listings")
                    .doc(listingId)
                const doc = await docRef.get()
                const docData = doc.data()
                if (userCredentials.localId !== docData.creatorId) {
                    res.status(401).send({ message: "Unauthorized" })
                    return
                }
            } catch (err) {
                console.log("Trying to update non-existing listing")
                res.status(400).send({ message: "No such listing exists" })
                return
            }

            // Create listing path
            const storagePath = `listings/${token.uid}/${listingId}/`

            // Get image(s) that will be updated to the listing. Use .fieldname to get file's index.
            const images = req.files
            console.log("Images count to be uploaded: " + req.files.length)

            // If there are any images, upload them to Storage
            if (images !== undefined && images.length > 0) {
                uploadImagesToStorage(
                    images,
                    functions.config().bci.bucket.default.name,
                    storagePath
                )
            }

            // Create listing first and then add its generated document ID to user-document
            await updateListingToFirestore(req, listingId, res)

            res.status(200).send({
                message: "Listing updated",
            })
            return
        }
    )
}

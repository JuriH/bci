require("module-alias/register")
const verifyToken = require("@middleware/verifyToken")
const getUserCredentialsFromToken = require("@utils/getUserCredentialsFromToken")
const busboyMiddleware = require("@middleware/busboyMiddleware")
const isValidJson = require("@middleware/isValidJson")
const minFilesMiddleware = require("@middleware/minFilesMiddleware")
const uploadImagesToStorage = require("@utils/uploadImagesToStorage")
const addListingToFirestore = require("@utils/addListingToFirestore")
const { admin } = require("@init")
const { v4: uuidv4 } = require("uuid")

async function addListingToUser(res, uid, listingId) {
    const userRef = await admin.firestore().collection("users").doc(uid)
    const doc = await userRef.get()

    try {
        if (!doc.exists) {
            console.log("No such document!")
        } else {
            let listings = []
            if (doc.get("listings") != null) {
                console.log("Updating user's listings-array")
                let updatedListings = doc.get("listings")
                updatedListings.push(listingId)
                listings = updatedListings
            } else {
                console.log("Creating user's listings-array")
                const newListings = [listingId]
                listings = newListings
            }
            // Merge the created/updated listings-array to user's document
            admin.firestore().collection("users").doc(uid).set(
                {
                    listings: listings,
                },
                { merge: true }
            )
        }
    } catch (err) {
        console.log("Error getting document", err)
        res.status(400).send({
            message: "Error occurred when creating listing",
        })
        return // Early exit
    }
}

const schema = {
    type: "object",
    properties: {
        title: { type: "string" },
        description: { type: "string" },
        manufacturer: { type: "string" },
        category: { type: "string" },
        location: { type: "string" },
        askingPrice: { type: "string" },
        shipping: { type: "string" },
        pickup: { type: "string" },
        image1: { isFileType: true },
        image2: { isFileType: true },
        image3: { isFileType: true },
        image4: { isFileType: true },
    },
    required: [
        "title",
        "description",
        "manufacturer",
        "category",
        "location",
        "askingPrice",
        "shipping",
        "pickup",
        "image1",
        "shipping",
        "pickup",
    ],
    additionalProperties: false,
}

//
// Create a new listing
//
module.exports = (app) => {
    app.post(
        "/listings/",
        verifyToken,
        isValidJson({ schema }),
        busboyMiddleware({
            files: 4, // Set maximum files to receive via request
            filetypes: ["image/jpeg", "image/jpg", "image/png"],
        }),
        minFilesMiddleware(1),
        async (req, res) => {
            // Get images from request via Busboy-middleware
            const images = req.files

            const userCredentials = await getUserCredentialsFromToken(req)

            // Check that all given files are either JPEG, JPG, or PNG
            images.some((image) => {
                if (
                    !(
                        image.mimetype !== "image/jpeg" ||
                        image.mimetype !== "image/png" ||
                        image.mimetype !== "image/jpg"
                    )
                ) {
                    console.log(
                        "Only JPEG, JPG and PNG are supported photo formats"
                    )
                    res.status(400).send({
                        message:
                            "Only JPEG, JPG and PNG are supported photo formats",
                    })
                }
            })

            const listingId = uuidv4()

            // Storage path to store listing's images
            const storagePath = `listings/${userCredentials.localId}/${listingId}/`

            uploadImagesToStorage(images, "default-bucket", storagePath)

            // Create listing first and then add its generated document ID to user-document
            await addListingToFirestore(
                req,
                userCredentials.localId,
                listingId,
                storagePath
            )

            await addListingToUser(res, userCredentials.localId, listingId)

            res.status(201).send({
                message: "Created listing",
                listingId: listingId,
            })
        }
    )
}

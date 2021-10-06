require("module-alias/register")
const { admin, functions } = require("@init")

const maxListings = 10

function booleanify(value) {
    let lower = value.toLowerCase()
    if (lower === "true") {
        return true
    } else if (lower === "false") {
        return false
    } else {
        return value
    }
}
// Filter listings
module.exports = (app) => {
    app.get("/listings?", async (req, res) => {
        const listingAttributes = [
            "title",
            "description",
            "category",
            "location",
            "askingPrice",
            "shipping",
            "pickup",
            "creatorId",
        ]

        try {
            let query = admin.firestore().collection("listings")

            // Build query
            listingAttributes.forEach((attribute) => {
                const queryAttribute = req.query[attribute]
                if (queryAttribute !== undefined) {
                    console.log(
                        attribute + " : " + queryAttribute.toLowerCase()
                    )
                    const value = booleanify(queryAttribute)
                    console.log("Value: " + value)
                    query = query.where(attribute, "==", value)
                }
            })

            // Get all documents that matches the query into an array
            const documents = await query
                .limit(maxListings)
                .get()
                .then((querySnapshot) => {
                    let docArr = []
                    querySnapshot.forEach((documentSnapshot) => {
                        const docData = documentSnapshot.data()

                        // console.log(docData)

                        // const bucket = admin.storage().bucket("default-bucket")

                        // let listingImages = []

                        // for (let i = 0; i < 3; i++) {
                        //     const listingImage = bucket.file(
                        //         `${docData.mediaPath}/image${i}`
                        //     )

                        //     async function getFileFromBucket(path) {
                        //         return await bucket.file(path).download()
                        //     }

                        //     let imageFile = null
                        //     try {
                        //         getFileFromBucket(listingImage).then((data) => {
                        //             const bufferToBase64 =
                        //                 data[0].toString("base64")
                        //             imageFile = bufferToBase64
                        //         })
                        //     } catch (err) {
                        //         console.log(err)
                        //     }

                        //     if (imageFile !== null) console.log(imageFile)
                        // }
                        //     listingImage
                        //         .download({
                        //             // Don't set destination here
                        //         })
                        //         .then((data) => {
                        //             let bufferToBase64 =
                        //                 data[0].toString("base64")

                        //             console.log("Buffer: " + bufferToBase64)

                        //             if (bufferToBase64 !== "")
                        //                 listingImages.push(bufferToBase64)
                        //         })
                        // }
                        // console.log(listingImages.length)

                        // // Remove mediaPath-field from listing
                        // delete docData.mediaPath

                        // // Add images as base64 to "images"-array in listing
                        // docData.images = listingImages

                        docArr.push(docData)
                    })
                    return docArr
                })

            console.log(documents)

            res.status(200).send({ listings: documents })
        } catch (err) {
            console.log(err)
            res.status(400).send({
                message: "Something went wrong fetching the listings",
            })
        }
    })
}

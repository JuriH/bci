require("module-alias/register")
const getFileExtension = require("@utils/getFileExtension")
const { admin } = require("@init")
module.exports = function uploadImagesToStorage(
    images,
    bucketName,
    storagePath
) {
    // Upload image(s) to Storage
    const bucket = admin.storage().bucket("default-bucket")

    images.forEach(async (image, index) => {
        // Create a file from buffer, using loop index as its name
        const file = bucket.file(`${storagePath}/image${index}`)
        file.save(image.buffer, { resumable: false }, (err) => {
            if (err) {
                res.status(400).send({
                    message: "Error occurred preparing image(s) for uploading",
                })
            }
        })
    })
}

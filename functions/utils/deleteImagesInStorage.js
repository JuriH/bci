require("module-alias/register")
const { admin } = require("@init")

module.exports = function deleteImagesInStorage(storagePath) {
    // const storageRef = admin.storage().bucket().ref(storagePath)
    // console.log("Path: " + storagePath)
    // storageRef.listAll().then((listResults) => {
    //     const promises = listResults.items.map((item) => {
    //         return item.delete()
    //     })
    //     Promise.all(promises)
    // })

    const bucket = admin.storage().bucket("default-bucket")

    bucket.deleteFiles(
        {
            // prefix: `listings/${uid}/${listingId}`,
            prefix: `${storagePath}`,
        },
        function (err) {
            if (err) {
                console.log(err)
            }
        }
    )
}

const { admin } = require("@init")

module.exports = async function addListingToFirestore(
    req,
    uid,
    listingId,
    storagePath
) {
    // Create listing-document to Firestore
    let listing = {
        listingId: listingId,
        creatorId: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        title: req.body.title,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
        location: req.body.location,
        category: req.body.category,
        askingPrice: req.body.askingPrice,
        shipping: req.body.shipping ? true : false,
        pickup: req.body.pickup ? true : false,
        images: storagePath,
    }

    console.log(listing)

    await admin.firestore().collection("listings").doc(listingId).set(listing)
}

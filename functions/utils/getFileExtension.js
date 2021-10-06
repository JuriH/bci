module.exports = function getFileExtension(file) {
    if (file.mimetype === "image/jpeg") return ".jpeg"
    if (file.mimetype === "image/png") return ".png"
}

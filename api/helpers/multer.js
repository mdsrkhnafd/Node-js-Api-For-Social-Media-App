const multer = require('multer');

const uploader = multer({
    limits: {
        fileSize: 100000000
    },
    storage: multer.memoryStorage()
});

module.exports = uploader;
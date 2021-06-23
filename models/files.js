const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const FILE_PATH = path.join('/assets/uploads')

const fileSchema = new mongoose.Schema({
    partitions: {
        type: Number,
        default: 2
    },
    partitionNames: [String],
    folder: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', FILE_PATH));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

fileSchema.statics.uploadedFile = multer({ storage: storage }).single('file');

const File = mongoose.model('file', fileSchema);
module.exports = File;

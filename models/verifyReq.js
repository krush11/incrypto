const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    reqType: String,
    dateCreated: {
        type: Date,
        default: Date.now(),
        expires: 600,
    }
});

const Verify = mongoose.model('verification', verificationSchema);
module.exports = Verify;

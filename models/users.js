const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    tier: {
        type: String,
        default: 'free'
    },
    expires_at: Date,
    maxFileSplit: {
        type: Number,
        default: 3
    },
    maxStorage: {
        type: Number,
        default: 256 * 1000 * 1000
    },
    storageLeft: {
        type: Number,
        default: 256 * 1000 * 1000
    },
    masterFolderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'storage'
    },
    defaultPartitions: {
        type: Number,
        default: 2
    }
}, {
    timestamps: true
});

const Users = mongoose.model('user', userSchema);
module.exports = Users;

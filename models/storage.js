const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema({
    storage_type: {
        type: String,
        required: true,
        default: 'folder'
    },
    storage_name: {
        type: String,
        required: true
    },
    parent: mongoose.Schema.Types.ObjectId,
    children: [mongoose.Schema.Types.ObjectId],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    file: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'file'
    }]
}, {
    timestamps: true
});

const Storage = mongoose.model('storage', storageSchema);
module.exports = Storage;

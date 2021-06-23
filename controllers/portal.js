const Verify = require('../models/verifyReq');
const User = require('../models/users');
const Storage = require('../models/storage');
const File = require('../models/files');
const azure = require('azure-storage');
const splitFile = require('split-file');
const fs = require('fs');
const path = require('path');

module.exports.portal = function (req, res) {
    if (req.isAuthenticated())
        res.status(202).redirect(`/portal/${req.user.username}/${req.user.masterFolderId}`)
};

module.exports.profile = function (req, res) {
    res.status(200).render('profile');
}

module.exports.upgrade_account = function (req, res) {
    res.status(200).render('upgrade');
}

module.exports.portal_home = async function (req, res) {
    const populatedStorage = await Storage.findById(req.params._folderId).populate('children').populate('file');

    // Merge partitioned files
    const files = populatedStorage.file;
    var blobService = azure.createBlobService();
    const mergedFiles = [];
    files.forEach(async function (file) {
        file.partitionNames.forEach(async function (partition) {
            var location = path.join(__dirname + '/../assets/uploads/' + partition);
            blobService.getBlobToStream(`${req.user.username}`, partition, fs.createWriteStream(location), (err, res) => { });
        });
        const locations = [];
        file.partitionNames.forEach(async function (partition) {
            locations.push(path.join(__dirname + '/../assets/uploads/' + partition));
        });
        var fileName = file.partitionNames[0].split('.');
        fileName = fileName.slice(0, fileName.length - 1).join('.');
        mergedFiles.push(fileName);
        await splitFile.mergeFiles(locations, path.join(__dirname + `/../assets/uploads/${fileName}`));
    });

    // Check for email verification
    const verified = req.user.verified;
    var flashMsg = false;
    var msg = '';
    if (!verified)
        await Verify.findOne({ email: req.user.email }, function (err, data) {
            if (data) {
                flashMsg = true;
                msg = 'Verification mail sent. Please check your email'
            }
        });

    if (flashMsg)
        res.status(200).render('portal', {
            verified: true,
            flashMsg: true,
            msg: msg,
            populatedStorage: populatedStorage,
            files: mergedFiles
        });
    else
        res.status(200).render('portal', {
            verified: verified,
            flashMsg: false,
            msg: msg,
            populatedStorage: populatedStorage,
            files: mergedFiles
        });
};

module.exports.create_folder = async function (req, res) {
    // Creating new folder
    const new_folder = new Storage();
    new_folder.storage_type = 'folder';
    new_folder.storage_name = req.body.folder_name;
    new_folder.parent = req.params._parentFolderId;
    new_folder.owner = req.user._id;
    await new_folder.save();

    // Pushing new folder ID to parent.children array
    const parentFolder = await Storage.findById(req.params._parentFolderId);
    parentFolder.children.push(new_folder._id);
    await parentFolder.save();

    res.redirect(`/portal/${req.user.username}/${parentFolder._id}`);
};

module.exports.upload_file = function (req, res) {
    File.uploadedFile(req, res, async function (err) {
        // Splitting files and getting part names
        var partitions = req.user.defaultPartitions;
        if (req.body.partitions <= req.user.maxFileSplit)
            partitions = req.body.partitions;
        var locations = await splitFile.splitFile(path.join(__dirname + '/../assets/uploads/' + req.file.filename), partitions);
        var names = [...locations];
        for (i in names) {
            names[i] = names[i].split('/');
            names[i] = names[i][names[i].length - 1];
        }

        // Uploading partitions to Azure
        var blobService = azure.createBlobService();
        for (i in names)
            blobService.createBlockBlobFromLocalFile(`${req.user.username}`, names[i], locations[i], function (err, result, response) { });

        // Reducing available storage size
        const user = await User.findById(req.user._id);
        user.storageLeft -= req.file.size;
        await user.save();

        // Adding file to DB
        var file = new File();
        file.partitions = partitions;
        file.folder = req.params._parentFolderId;
        file.partitionNames = names;
        await file.save();

        // Adding file to folder DB
        const folder = await Storage.findById(req.params._parentFolderId);
        folder.file.push(file._id);
        folder.save();

        res.redirect(`/portal/${req.user.username}/${req.params._parentFolderId}`);
    });
};

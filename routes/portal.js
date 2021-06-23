const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portal');

router.get('/', portalController.portal);
router.get('/profile/:username', portalController.profile);
router.get('/upgrade/:username', portalController.upgrade_account);
router.get('/:user/:_folderId', portalController.portal_home);

router.post('/create-folder/:user/:_parentFolderId', portalController.create_folder);
router.post('/upload-file/:user/:_parentFolderId', portalController.upload_file);

module.exports = router;

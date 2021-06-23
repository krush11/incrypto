const express = require('express');
const passport = require('passport');
const router = express.Router();
const homeController = require('../controllers/home');

router.get('/', homeController.home);
router.get('/terms', homeController.terms);
router.get('/contact', homeController.contact);
router.post('/contact/submit', homeController.submit_contact);
router.get('/contact/:option', homeController.contact);

router.use('/auth', require('./authenticate'));
router.use('/portal', passport.checkAuthentication, require('./portal'));

module.exports = router;
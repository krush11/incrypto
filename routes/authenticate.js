const express = require('express');
const router = express.Router();
const authController = require('../controllers/authenticate');
const passport = require('passport');

router.get('/signin', authController.signin);
router.get('/signup', authController.signup);
router.get('/verify/:user/:code', authController.verify);
router.get('/verification_req', passport.checkAuthentication, authController.verification_req);
router.get('/forgot', authController.forgot);
router.get('/reset-password/:user/:code', authController.resetPassword);
router.get('/logout', async function (req, res) {
    await req.logout();
    res.status(200).redirect('/');
});

router.post('/signin', passport.authenticate('local', {
    successRedirect: '/portal',
    failureRedirect: '/auth/signin'
}));
router.post('/signup', authController.create_user);
router.post('/forgot', authController.reset_req);
router.post('/update-credentials/:user', authController.update_password)
module.exports = router;

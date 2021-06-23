const User = require('../models/users');
const Verify = require('../models/verifyReq');
const Storage = require('../models/storage');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const secretKey = require('secret-key');
var azure = require('azure-storage');

module.exports.signin = function (req, res) {
    if (req.isAuthenticated())
        res.status(208).redirect('/portal');
    else res.status(200).render('signin');
};

module.exports.signup = async function (req, res) {
    if (req.isAuthenticated())
        res.status(208).redirect('/');
    else {
        var users = await User.find({});
        var emails = [];
        var usernames = [];
        for (i in users) {
            emails[i] = users[i].email;
            usernames[i] = users[i].username;
        }
        res.status(200).render('signup', {
            send_message: false,
            emails: emails,
            usernames: usernames
        });
    }
};

module.exports.verify = function (req, res) {
    const { user, code } = req.params;
    User.findOne({ username: user }, function (err, user) {
        if (user) {
            Verify.findOne({ email: user.email }, async function (err, verify) {
                if (verify && verify.code == code) {
                    user.verified = true;
                    await user.save();
                    await verify.delete();
                    res.status(202).redirect('/portal');
                }
                else res.status(404).redirect('/portal')
            });
        }
        else
            res.status(400).redirect('/portal')
    });
};

module.exports.verification_req = function (req, res) {
    Verify.findOne({ email: req.user.email }, function (err, data) {
        if (!(data || req.user.verified)) {
            const verify = new Verify();
            verify.email = `${req.user.email}`;
            verify.code = secretKey.create(Date.now.toString()).secret;
            verify.reqType = 'email verification';
            verify.save();
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'krushnalpatel11@gmail.com',
                    pass: process.env.GMAIL_KEY
                }
            });
            var mailOptions = {
                from: 'krushnalpatel11@gmail.com',
                to: `${req.user.email}`,
                subject: 'Incrypto account verification',
                html: `<h3>Hello ${req.user.name},</h3>
            <p>You have recently requested verification of your incrypto account. If this was not you please ignore the mail<br>
            Please click on the link to verify your account.</p>
            <a href=http://localhost:3000/auth/verify/${req.user.username}/${verify.code}>Verify account</a>
            <p>Thank you,<br>Team Incrypto</p>`
            };
            transporter.sendMail(mailOptions, (error, info) => { });
            res.status(201).redirect('/portal');
        }
        else res.status(208).redirect('/portal');
    });
};

module.exports.forgot = async function (req, res) {
    const users = await User.find({});
    var emails = [];
    for (i in users)
        emails.push(users[i].email);
    res.status(200).render('resetPassword', {
        req_status: 'get_email',
        emails: emails
    });
}

module.exports.resetPassword = function (req, res) {
    const { user, code } = req.params;
    User.findOne({ username: user }, function (err, user) {
        if (user) {
            Verify.findOne({ email: user.email }, function (err, verify) {
                if (verify.code == code) {
                    res.status(202).render('resetPassword', {
                        req_status: 'reset_password',
                        user: user
                    });
                }
                else res.status(202).redirect('/');
            });
        }
    });
}

module.exports.create_user = function (req, res) {
    User.exists({ username: req.body.username }, async function (err, result) {
        if (!result) {
            // Create azure container
            var blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);
            blobService.createContainerIfNotExists(`${req.body.username}`, {
                publicAccessLevel: 'blob'
            }, function (error, result, response) { });

            // Create user master folder document
            var masterFolder = new Storage();
            var user = new User();
            masterFolder.storage_type = 'folder';
            masterFolder.storage_name = 'master folder';
            masterFolder.owner = user._id;
            await masterFolder.save();

            // Create user document
            var password = await bcrypt.hash(req.body.password, 10);
            user.masterFolderId = masterFolder._id;
            user.username = req.body.username;
            user.email = req.body.email;
            user.password = password;
            user.name = req.body.name;
            await user.save();
            req.login(user, function (user) { });
            res.status(201).redirect(`/portal`);
        }
        else res.status(400).render('signup', {
            send_message: true,
            message: "User already exists"
        });
    });
};

module.exports.reset_req = function (req, res) {
    Verify.findOne({ email: req.body.email }, function (err, data) {
        if (!data) {
            const verify = new Verify();
            verify.email = `${req.body.email}`;
            verify.code = secretKey.create(Date.now.toString()).secret;
            verify.reqType = 'password reset';
            verify.save();
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'krushnalpatel11@gmail.com',
                    pass: process.env.GMAIL_KEY
                }
            });
            User.findOne({ email: req.body.email }, function (err, user) {
                if (user) {
                    var mailOptions = {
                        from: 'krushnalpatel11@gmail.com',
                        to: `${user.email}`,
                        subject: 'Incrypto password reset',
                        html: `<h3>Hello ${user.name},</h3>
                                <p>You have recently requested to reset password of your incrypto account. If this was not you please ignore the mail<br>
                                Please click on the link to verify your account.</p>
                                <a href=http://localhost:3000/auth/reset-password/${user.username}/${verify.code}>Reset Password</a>
                                <p>Thank you,<br>Team Incrypto</p>`
                    };
                    transporter.sendMail(mailOptions, (error, info) => { });
                    res.status(201).render('resetPassword', {
                        req_status: 'email_sent'
                    });
                }
            })

        }
        else res.status(208).redirect('/');
    });
};

module.exports.update_password = async function (req, res) {
    const username = req.params.user;
    const new_password = await bcrypt.hash(req.body.new_password, 10);
    var user = await User.findOneAndUpdate({ username: username }, { password: new_password }, { new: true });
    Verify.findOneAndDelete({ email: user.email });
    res.status(200).redirect('/');
};

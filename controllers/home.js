const Contact = require('../models/contact');

module.exports.home = function (req, res) {
    res.status(200).render('home');
}

module.exports.terms = function (req, res) {
    res.status(200).render('terms');
}

module.exports.contact = function (req, res) {
    res.status(200).render('contact', { option: req.params.option });
}

module.exports.submit_contact = function (req, res) {
    const contact = Contact();
    contact.name = req.body.name;
    contact.email = req.body.email;
    contact.phoneNo = req.body.phoneNo;
    contact.subject = req.body.subject;
    contact.message = req.body.message;
    contact.save();
    res.status(200).redirect('/');
}

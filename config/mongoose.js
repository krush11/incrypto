const mongoose = require('mongoose');
const process = require('process');
require('dotenv').config();

const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
const db = mongoose.connection;
mongoose.set('useFindAndModify', false);

db.on('error', console.error.bind(console, "Error connecting to MongoDB"));

module.exports = db;

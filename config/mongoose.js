const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/hospital');

const db = mongoose.connection;

db.on('error',console.error.bind(console,"Error connecting to Mongodb"));

db.once('open',function(){
    console.log('Connected to database :: MongoDB');
});

module.exports = db;
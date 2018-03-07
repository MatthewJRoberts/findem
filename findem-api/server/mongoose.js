const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/findem').then(() => {
    
}, (e) => {
    console.log(`Failed to connect to MongoDB: ${e}`);
});

module.exports = { mongoose };
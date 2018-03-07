const mongoose = require('mongoose');

let PlayerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    game: {
        type: String,
        reqired: true
    },
    accounts: {
        steam: {
            type:Object
        },
        origin: {
            type:Object
        },
        battlenet: {
            type:Object
        }
    },
    region: {
        type:String
    }
});

let Player = mongoose.model('Player', PlayerSchema, 'players');

module.exports = { Player };
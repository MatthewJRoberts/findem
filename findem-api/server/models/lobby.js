const mongoose = require('mongoose');

let LobbySchema = new mongoose.Schema({
    players: {
        type: [{
            type: String
        }]
    },
    game: {
        type:String
    },
    settings: {
        maxplayers: {
            type:Number,
            default:5
        }
    }
});

let Lobby = mongoose.model('Lobby', LobbySchema, 'lobbies');

module.exports = { Lobby };
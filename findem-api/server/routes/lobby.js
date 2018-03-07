const router = require('express').Router();
const _ = require('lodash');
const { mongoose } = require('./../mongoose');

let { Lobby } = require('./../models/lobby');
let { Player } = require('./../models/player');

router.get('/', ( req, res ) => {
    Lobby.find().then(lobbies => {
        if(!lobbies) {
            return res.status(404).send();
        }
        return res.status(200).json(lobbies);
    }).catch(e => res.status(500).send());
});

router.get('/:id', ( req, res ) => {
    let id = req.params.id;
    Lobby.findById(id).then(lobby => {
        if(!lobby) {
            return res.status(404).send();
        }
        return res.status(200).json(lobby);
    }).catch(e => res.status(500).send());
});

router.get('/game/:game', ( req, res ) => {
    let game = req.params.game;
    Lobby.find({game}).where({$where: "this.players.length < 5"}).then(lobbies => {
        if(!lobbies) {
            return res.status(404).send();
        }
        return res.status(200).json(lobbies);
    }).catch(e => res.status(500).send());
});

router.post('/', ( req, res ) => {
    let body = _.pick(req.body, ['game', 'players']);
    let newLobby = new Lobby({...body});
    newLobby.save().then(lobby => {
        if(!lobby) {
            return res.status(404).send();
        }
        return res.status(200).json(lobby);
    }).catch(e => res.status(500).send());
});

router.post('/push/:id', ( req, res ) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['player']);
    Lobby.findByIdAndUpdate(id, {$push: {players: body.player}}, {new: true}).then(lobby => {
        if(!lobby) {
            return res.status(404).send();
        }
        return res.status(200).json(lobby);
    }).catch(e => res.status(500).send());
});

router.post('/pull/:id', ( req, res ) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['player']);
    Lobby.findByIdAndUpdate(id, {$pull: {players: body.player}}, {new: true}).then(lobby => {
        if(!lobby) {
            return res.status(404).send();
        }
        return res.status(200).json(lobby);
    }).catch(e => res.status(500).send());
});

router.put('/:id', ( req, res ) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['game', 'players']);
    Lobby.findByIdAndUpdate(id, {$set: body}, {new: true}).then(lobby => {
        if(!lobby) {
            return res.status(404).send();
        }
        return res.status(200).json(lobby);
    }).catch(e => res.status(500).send());
});

router.delete('/:id', ( req, res ) => {
    let id = req.params.id;
    Lobby.findByIdAndRemove(id).then(lobby => {
        if(!lobby) {
            return res.status(404).send();
        }
        return res.status(200).json(lobby);
    }).catch(e => res.status(500).send());
});

module.exports = router;
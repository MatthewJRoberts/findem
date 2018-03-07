const router = require('express').Router();
const { mongoose } = require('./../mongoose');
const _ = require('lodash');
const axios = require('axios');

let { Player } = require('./../models/player');

router.get('/', ( req, res ) => {
    Player.find().then(players => {
        if(!players) {
            return res.status(404).send();
        }
        return res.status(200).json(players);
    }).catch(e => res.status(500).send());
});

router.get('/:id', ( req, res ) => {
    let id = req.params.id;
    Player.findById(id).then(player => {
        if(!player) {
            return res.status(404).send();
        }
        return res.status(200).json(player);
    }).catch(e => res.status(500).send());
});

router.post('/', ( req, res ) => {
    let body = _.pick(req.body, ['name', 'accounts', 'region', 'game']);
    let newPlayer = new Player({...body});
    newPlayer.save().then(player => {
        if(!player) {
            return res.status(404).send();
        }
        return res.status(200).json(player);
    }).catch(e => {console.log(e); res.status(500).send()});
});

router.put('/:id', ( req, res ) => {
    let body = _.pick(req.body, ['name', 'accounts', 'region', 'game']);
    let id = req.params.id;
    Player.findByIdAndUpdate(id, {$set: body}, {new: true}).then(player => {
        if(!player) {
            return res.status(404).send();
        }
        return res.status(200).json(player);
    }).catch(e => res.status(500).send());
});

router.delete('/:id', ( req, res ) => {
    let id = req.params.id;
    Player.findByIdAndRemove(id).then(player => {
        if(!player) {
            return res.status(404).send();
        }
        return res.status(200).json(player);
    }).catch(e => res.status(500).send());
});

router.get('/account/:acc/:name', ( req, res ) => {
    switch(req.params.acc) {
        case 'steam':
            axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v1?key=8DCF3355458FAFAFE74A0ECB4CF8DA45&vanityurl=${req.params.name}`).then(response => {
                if(response.data.response.success !== 1) {
                    return res.status(404).send();
                }
                axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=8DCF3355458FAFAFE74A0ECB4CF8DA45&steamids=${response.data.response.steamid}`).then(response => {
                    return res.status(200).json(response.data.response.players[0]);
                }).catch(e => res.status(500).send());
            }).catch(e => res.status(500).send());
            break;
        default:
            return res.status(404).send();
            break;
    }
})

module.exports = router;
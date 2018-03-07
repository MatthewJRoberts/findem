const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./../config/config');
const route_lobby = require('./routes/lobby');
const route_player = require('./routes/player');

let app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/lobby', route_lobby);
app.use('/player', route_player);

app.listen(config.port, () => {
    console.log(`Server is listening to port: ${ config.port }`);
});


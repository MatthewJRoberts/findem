
let sections = document.querySelector('#sections').children;
let gamesElement = document.querySelector('#allgames');
let players_containers = document.querySelector('#players');
let error = document.querySelector('#error');
let preview_image = document.querySelector('#preview_image');
let preview_name = document.querySelector('#preview_name');
let progress = 0;

window.addEventListener('beforeunload', function(event) {
    if(lobbyID !== "" && playerID !== "") { 

        httpGet(`http://localhost:4000/lobby/${lobbyID}`, lobby => {
            window.open(`${playerID} -- ${lobby.value.players.length}`);
            if(lobby.value.players.length === 1) {
                httpDelete(`http://localhost:4000/lobby/${lobbyID}`, quitplayer_response => {});
            } else {
                httpPost(`http://localhost:4000/lobby/pull/${lobbyID}`, {player: playerID}, quitlobby_response => {});
            }
            httpDelete(`http://localhost:4000/player/${playerID}`, quitplayer_response => {});
        });

    }
}, false);

let games = [
    {
        name: 'PUBG',
        imgpath: '//'
    },
    {
        name: 'CS:GO',
        imgpath: '//'
    },
    {
        name: 'Fortnite',
        imgpath: '//'
    }
]

let data = {
    name: '',
    game: '',
    region: 'EU',
    accounts: {
        steam: {},
        origin: {},
        battlenet: {}
    }
}
let lobbyID = "";
let playerID = "";
let players = [];
let searchBool = false;

window.onload = () => 
{
    let gameStr = "";
    for(let i = 0; i < games.length; i++) {
        gameStr += `<div class="game_container"><div class="game" onclick="modData('game','${games[i].name}'); progressBack()"></div><p>${games[i].name}</p></div>`;
    }
    gamesElement.innerHTML = gameStr;
    sections[progress].className = "active";
}

function modData(attr,val) {
    
    switch(attr) {
        case 'game':
            data = {
                ...data,
                game: val
            }
            break;
        case 'region':
            data = {
                ...data,
                region: val
            }
            break;
        default:
            data = {
                ...data,
                game: val
            }
            break;
    }
}

function CancelSearch() {
    searchBool = true;
    window.location = document.URL;
}

function UpdatePlayers() {
    httpGet(`http://localhost:4000/lobby/${lobbyID}`, lobby => {

        let same = false;
        if(lobby.value.players.length >= players.length) {
            for(let i = 0; i < lobby.value.players.length; i++) {
                let tick = false;
                for(let x = 0; x < players.length; x++) {
                    if(lobby.value.players[i] === players[x]) {
                        tick = true;
                    }
                }
                if(!tick) {
                    same = true;
                }
            }
        } else {
            for(let i = 0; i < players.length; i++) {
                let tick = false;
                for(let x = 0; x < lobby.value.players.length; x++) {
                    if(players[i] === lobby.value.players[x]) {
                        tick = true;
                    }
                }
                if(!tick) {
                    same = true;
                }
            }
        }

        if(same) {
            players = lobby.value.players;
            players_containers.innerHTML = "";
            for(let i = 0; i < players.length; i++) {
                httpGet(`http://localhost:4000/player/${players[i]}`, player => {
                    players_containers.innerHTML += `<div class="inner"><div class="image"><img src="${player.value.accounts.steam.avatarmedium}" /></div><div class="text"><a href="${player.value.accounts.steam.profileurl}" target="_blank">${player.value.accounts.steam.personaname}</a></div></div>`;
                });
            }
        } 

        if(!searchBool) {
            setTimeout(() => {
                UpdatePlayers();
            }, 5000);
        }
        if(players.length >= 5) {
            searchBool = true;
        }
        console.log('Searched!');
    });
    
}

function progressBack(bool = false) {
    if(!document.querySelector('#name').value) {
        error.innerHTML = "Nickname required.";
        return; 
    }
    if(Object.keys(data.accounts.steam).length === 0) {
        error.innerHTML = "Steam Account required.";
        return;
    }

    sections[progress].className = "";
    if(!bool) {
        progress++;
    } else {
        progress--;
    }
    sections[progress].className = "active";

    if(progress == (sections.length-1)) {
        // Search Now & Set Data
        data.name = document.querySelector('#name').value;
        httpPost('http://localhost:4000/player/', data, player_response => {
            playerID = player_response.value._id;
            httpGet(`http://localhost:4000/lobby/game/${player_response.value.game}`, lobbies_response => {
                if(lobbies_response.value.length === 0) {
                    let _players = [];
                    _players.push(playerID);
                    httpPost('http://localhost:4000/lobby/', {
                        players: _players,
                        game: player_response.value.game,
                        settings: {}
                    }, lobby_response => {
                        players = lobby_response.value.players;
                        lobbyID = lobby_response.value._id;
                        for(let i = 0; i < players.length; i++) {
                            httpGet(`http://localhost:4000/player/${players[i]}`, player => {
                                players_containers.innerHTML += `<div class="inner"><div class="image"><img src="${player.value.accounts.steam.avatarmedium}" /></div><div class="text"><a href="${player.value.accounts.steam.profileurl}" target="_blank">${player.value.accounts.steam.personaname}</a></div></div>`;
                            });
                        }
                        UpdatePlayers();
                    });
                } else {
                    lobbyID = lobbies_response.value[0]._id;
                    httpPost(`http://localhost:4000/lobby/push/${lobbyID}`, {player: player_response.value._id}, lobby_response => {
                        players = lobby_response.value.players;
                        for(let i = 0; i < players.length; i++) {
                            httpGet(`http://localhost:4000/player/${players[i]}`, player => {
                                players_containers.innerHTML += `<div class="inner"><div class="image"><img src="${player.value.accounts.steam.avatarmedium}" /></div><div class="text"><a href="${player.value.accounts.steam.profileurl}" target="_blank">${player.value.accounts.steam.personaname}</a></div></div>`;
                            });
                        }
                        UpdatePlayers();
                    });
                }
            });
        });
    }
    error.innerHTML = "";
}

function httpGet(theUrl, callback, error)
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback({err: null, value: JSON.parse(xmlHttp.responseText)});
        } else if (xmlHttp.readyState == 4 && xmlHttp.status !== 200) {
            callback({err: `Request Failed: ${xmlHttp.status}`, value: null});
        }
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.setRequestHeader('Content-type', 'application/json');
    xmlHttp.send(null);
}

function httpPost(theUrl, data, callback)
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback({err: null, value: JSON.parse(xmlHttp.responseText)});
        } else if (xmlHttp.readyState == 4 && xmlHttp.status !== 200) {
            callback({err: `Request Failed: ${xmlHttp.status}`, value: null});
        }
    }
    xmlHttp.open("POST", theUrl, true);
    xmlHttp.setRequestHeader('Content-type', 'application/json');
    xmlHttp.send(JSON.stringify(data));
}

function httpDelete(theUrl, callback)
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback({err: null, value: JSON.parse(xmlHttp.responseText)});
        } else if (xmlHttp.readyState == 4 && xmlHttp.status !== 200) {
            callback({err: `Request Failed: ${xmlHttp.status}`, value: null});
        }
    }
    xmlHttp.open("DELETE", theUrl, true);
    xmlHttp.setRequestHeader('Content-type', 'application/json');
    xmlHttp.send(null);
}

function AddAccount(acc, value) {
    switch(acc) {
        case 'steam':
            if(document.querySelector('#steamaction').innerHTML !== '') {

                httpGet(`http://localhost:4000/player/account/${ acc }/${ value }`, response => {
                    if(response.err) {
                        preview_name.innerHTML = "No Steam Account Found.";
                        preview_name.style.display = "block";
                        return;
                    }
                    data.accounts.steam = response.value;
                    preview_image.setAttribute('src', response.value.avatar);
                    preview_image.style.display = "block";
                    preview_name.innerHTML = response.value.personaname;
                    preview_name.style.display = "block";
                });
            }
            break;
        default:
            break;
    }
}

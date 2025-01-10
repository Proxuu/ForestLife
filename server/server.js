const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const {v4: uuidv4} = require('uuid');
const {addPlayer, updatePlayerPosition, players} = require('./gameLogic');

const app = express();
app.use(express.static(path.join(__dirname, '../client')));

const server = http.createServer(app);
const wss = new WebSocket.Server({server});

wss.on('connection', (ws) => {
    let playerID = null;

    ws.on('message', (message) => {
        let data;
        try{
            data = JSON.parse(message);
        }catch(error){
            console.error('Failed to parse message:', error);
            return;
        }



        if(data.type === 'login'){

            playerID = uuidv4();

            

            addPlayer(playerID, data.name);
            
            ws.send(JSON.stringify({type: 'init', id: playerID, name: data.name}));
            console.log('Player login');
            ws.send(JSON.stringify({type: 'update', players}))

        }else if (data.type === 'move'){
            updatePlayerPosition(data.id, data.name, data.x, data.y, data.angle);
            wss.clients.forEach(client =>{
                if (client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({type: 'update', players}))
                }
            });   
        }
    });

    ws.on('close', () => {
        console.log('Player disconnected');
        if(playerID && players[playerID]){
            delete players[playerID];
            
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({type: 'remove', id: playerID}));
                }
            })


        }
    });
});




server.listen(8080, () => {
    console.log('Server nasłuchuje na porcie 8080');
});
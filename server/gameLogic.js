const players = {};

function addPlayer(id, name){
    players[id] = {id, name, x: 100, y: 100, angle: 0};
}

function updatePlayerPosition(id, name, x, y, angle){
    if(players[id]) {
        
        players[id].x = x;
        players[id].y = y;
        players[id].angle = angle;
        }
}

// W przyszłości więcej logiki w tym miejscu

module.exports = {addPlayer, updatePlayerPosition, players};
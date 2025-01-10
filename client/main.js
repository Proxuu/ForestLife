const canvas = document.getElementById('gameCanvas');
const bgcanvas = document.getElementById('bgCanvas');
const olcanvas = document.getElementById('overlayCanvas');

const ctx = canvas.getContext('2d');
const bgctx = bgcanvas.getContext('2d');
const olctx = olcanvas.getContext('2d');

import { bushes } from "./bushlocation.js";

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';


// ścieżki zdjęć
const imageSources = {
    playerimg: 'images/player.svg',
    playerAnimation1: 'images/playerAnimation1.svg',
    playerAnimation2: 'images/playerAnimation2.svg',
    bush: 'images/bush.png',
    patch: 'images/elipsa1.png',
    patch2: 'images/elipsa2.png',
    patch3: 'images/elipsa3.png',
    patch4: 'images/elipsa4.png',
    patch5: 'images/elipsa5.png',
    patch6: 'images/elipsa6.png',
};

// ładowanie obrazów

let loadedImages = {};

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

Promise.all(
    Object.entries(imageSources).map(([key, src]) =>
        loadImage(src).then(img => {
            loadedImages[key] = img;
        })
    )
).then(() => {
    
}).catch(error => {
    console.error('Error loading images:', error);
});

let isGameRunning = false;


// Ustawienia gracza
const playerConfig = { size: 90, speed: 5 };


// Pojawienie się gracza w losowych miescu blisko środka mapy
let randomx = 5000 + Math.random() * 1000;
let randomy = 5000 + Math.random() * 1000;


// Reszta ustawień gracza
let player = {
    x: randomx,
    y: randomy,
    angle: 0,
    id: null,
    name: null,
    ...playerConfig,
};

// Wiekość mapy
const mapWidth = 10000;
const mapHeight = 10000;


const otherPlayers = {};



// ustawienia plam (tekstur)
const patches = [
    {"x": 7515, "y": 2208, "rotate": 5.574062402602593},
    {"x": 6664, "y": 6594, "rotate": 2.757768001200467},
    {"x": 5814, "y": 3301, "rotate": 5.241055299816895},
    {"x": 847, "y": 1615, "rotate": 1.103401645154373},
    {"x": 564, "y": 471, "rotate": 5.9134408793020965},
    {"x": 4542, "y": 4032, "rotate": 2.069936620720152}
];

const patches2 = [
    {"x": 294, "y": 4644, "rotate": 4.805042062713904},
    {"x": 66, "y": 6750, "rotate": 5.29022077725738},
    {"x": 5120, "y": 713, "rotate": 2.1706863081275753},
    {"x": 1318, "y": 8280, "rotate": 1.7923924696644924},
    {"x": 2361, "y": 4633, "rotate": 4.756702572541256},
    {"x": 3825, "y": 859, "rotate": 4.901355074282633}
];

const patches3 = [
    {"x": 4504, "y": 2706, "rotate": 4.109974435265538},
    {"x": 6050, "y": 5181, "rotate": 5.109525436721322},
    {"x": 1755, "y": 6692, "rotate": 1.0464361887447517},
    {"x": 2369, "y": 1456, "rotate": 3.9385149357979126},
    {"x": 7215, "y": 4737, "rotate": 1.3112240695588508},
    {"x": 306, "y": 2882, "rotate": 5.42672833171209}
];

const patches4 = [
    {"x": 3271, "y": 5775, "rotate": 1.3763782143905126},
    {"x": 2960, "y": 3339, "rotate": 1.2547295035267338},
    {"x": 7873, "y": 6629, "rotate": 2.6511437255894212},
    {"x": 5507, "y": 7935, "rotate": 4.906410641182245},
    {"x": 38, "y": 8470, "rotate": 4.971092229234535},
    {"x": 3185, "y": 8238, "rotate": 5.61304265048224}
];

const patches5 = [
    {"x": 4908, "y": 6981, "rotate": 5.747877536576243},
    {"x": 1693, "y": 2993, "rotate": 4.488680635824806},
    {"x": 6844, "y": 3114, "rotate": 4.635167577101753},
    {"x": 6723, "y": 7630, "rotate": 5.234398583669715},
    {"x": 4238, "y": 5123, "rotate": 5.102580081598084},
    {"x": 7991, "y": 645, "rotate": 3.580855730913738}
];

const patches6 = [
    {"x": 3425, "y": 7218, "rotate": 3.551924728034891},
    {"x": 7758, "y": 8485, "rotate": 1.3706199043591774},
    {"x": 1703, "y": 113, "rotate": 5.840089548273697},
    {"x": 5409, "y": 2000, "rotate": 5.703132170515419},
    {"x": 6887, "y": 229, "rotate": 4.229275003084764},
    {"x": 2208, "y": 5664, "rotate": 5.883502167849295}
];










let socket = null;

// Ustawienie canvasa na szerokosc okna

function resizeCanvas() {
    bgcanvas.width = window.innerWidth;
    bgcanvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    olcanvas.width = window.innerWidth;
    olcanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Utworzenie obiektu obslugi wciśnietych klawiszy
const pressedKeys = new Set();

function handleKeyDown(event) {
    pressedKeys.add(event.key);
}

function handleKeyUp(event) {
    pressedKeys.delete(event.key);
}

function updateLocalPlayerPosition() {
    let moved = true;

    

// Logika poruszania sie gracza

    if (pressedKeys.has('w') || pressedKeys.has('W')) {
        player.y -= player.speed;
        moved = true;
    }
    if (pressedKeys.has('s') || pressedKeys.has('S')) {
        player.y += player.speed;
        moved = true;
    }
    if (pressedKeys.has('a') || pressedKeys.has('A')) {
        player.x -= player.speed;
        moved = true;
    }
    if (pressedKeys.has('d') || pressedKeys.has('D')) {
        player.x += player.speed;
        moved = true;
    }

    // Border mapy

    if (player.x < player.size / 2) {
        player.x = player.size / 2;
    }
    if (player.x > mapWidth - player.size / 2) {
        player.x = mapWidth - player.size / 2;
    }
    if (player.y < player.size / 2) {
        player.y = player.size / 2;
    }
    if (player.y > mapHeight - player.size / 2) {
        player.y = mapHeight - player.size / 2;
    }
    

// wysylanie danych gracza na serwer
    if (moved && socket && player.id) {
        socket.send(JSON.stringify({
            type: 'move',
            id: player.id,
            x: player.x,
            y: player.y,
            angle: player.angle
        }));
    }
}


// rysowanie mapy względem gracza
function drawMap() {
    const offsetX = player.x - canvas.width / 2;
    const offsetY = player.y - canvas.height / 2;

    bgctx.clearRect(0, 0, bgcanvas.width, bgcanvas.height);
    bgctx.fillStyle = 'rgb(18, 75, 27)';
    bgctx.fillRect(-offsetX, -offsetY, mapWidth, mapHeight);



// Rysowanie plam 
    patches.forEach(patch => {
        if (
            patch.x - offsetX + 2000 > 0 &&
            patch.x - offsetX < canvas.width + 2000 &&
            patch.y - offsetY + 2000 > 0 &&
            patch.y - offsetY < canvas.height + 2000
        ) {

        bgctx.save();
        bgctx.translate(patch.x - offsetX + 500, patch.y - offsetY + 500);
        bgctx.rotate(patch.rotate);
        bgctx.drawImage(loadedImages.patch, -500, -500, 1000, 1000);
        bgctx.restore();

        }    
    });

    patches2.forEach(patch2 => {
        if(
            patch2.x - offsetX + 2000 > 0 &&
            patch2.x - offsetX < canvas.width + 2000 &&
            patch2.y - offsetY + 2000 > 0 &&
            patch2.y - offsetY < canvas.width + 2000

        ){

            bgctx.save();
            bgctx.translate(patch2.x - offsetX + 500, patch2.y - offsetY + 500);
            bgctx.rotate(patch2.rotate);
            bgctx.drawImage(loadedImages.patch2, -500, -500, 1000, 1000);
            bgctx.restore();
        
        }

        
    });


    patches3.forEach(patch3 => {
        if(
            patch3.x - offsetX + 2000 > 0 &&
            patch3.x - offsetX < canvas.width + 2000 &&
            patch3.y - offsetY + 2000 > 0 &&
            patch3.y - offsetY < canvas.width + 2000

        ){

            bgctx.save();
            bgctx.translate(patch3.x - offsetX + 500, patch3.y - offsetY + 500);
            bgctx.rotate(patch3.rotate);
            bgctx.drawImage(loadedImages.patch3, -500, -500, 1000, 1000);
            bgctx.restore();
        
        }

        
    });


    patches4.forEach(patch4 => {
        if(
            patch4.x - offsetX + 2000 > 0 &&
            patch4.x - offsetX < canvas.width + 2000 &&
            patch4.y - offsetY + 2000 > 0 &&
            patch4.y - offsetY < canvas.width + 2000

        ){

            bgctx.save();
            bgctx.translate(patch4.x - offsetX + 500, patch4.y - offsetY + 500);
            bgctx.rotate(patch4.rotate);
            bgctx.drawImage(loadedImages.patch4, -500, -500, 1000, 1000);
            bgctx.restore();
        
        }

        
    });

    patches5.forEach(patch5 => {
        if(
            patch5.x - offsetX + 2000 > 0 &&
            patch5.x - offsetX < canvas.width + 2000 &&
            patch5.y - offsetY + 2000 > 0 &&
            patch5.y - offsetY < canvas.width + 2000

        ){

            bgctx.save();
            bgctx.translate(patch5.x - offsetX + 500, patch5.y - offsetY + 500);
            bgctx.rotate(patch5.rotate);
            bgctx.drawImage(loadedImages.patch5, -500, -500, 1000, 1000);
            bgctx.restore();
        
        }

        
    });

    patches6.forEach(patch6 => {
        if(
            patch6.x - offsetX + 2000 > 0 &&
            patch6.x - offsetX < canvas.width + 2000 &&
            patch6.y - offsetY + 2000 > 0 &&
            patch6.y - offsetY < canvas.width + 2000

        ){

            bgctx.save();
            bgctx.translate(patch6.x - offsetX + 500, patch6.y - offsetY + 500);
            bgctx.rotate(patch6.rotate);
            bgctx.drawImage(loadedImages.patch6, -500, -500, 1000, 1000);
            bgctx.restore();
        
        }

        
    });


    
}



// Rysowanie objektów
function drawObjects(){

    const offsetX = player.x - canvas.width / 2;
    const offsetY = player.y - canvas.height / 2;

    bushes.forEach(bush => {
        if (
            bush.x - offsetX + 200 > 0 &&
            bush.x - offsetX < canvas.width &&
            bush.y - offsetY + 200 > 0 &&
            bush.y - offsetY < canvas.height
        ) {
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 1)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetY = 10;
            ctx.drawImage(loadedImages.bush, bush.x - offsetX, bush.y - offsetY, bush.width, bush.height);
            ctx.restore();

            
        }
    });
}

// sprawdzanie kolizjii z krzakiem w kształcie elipsy
function isPointInEllipse(px, py, ellipse) {
    const dx = px - ellipse.cx;
    const dy = py - ellipse.cy;
    return (dx * dx) / (ellipse.a * ellipse.a) + (dy * dy) / (ellipse.b * ellipse.b) <= 1;
}

function checkCollisionRectWithEllipse(player, bushes) {
    for (let bush of bushes) {
        
        const rectCorners = [
            { x: player.x, y: player.y },
            { x: player.x + player.size, y: player.y },
            { x: player.x, y: player.y + player.size },
            { x: player.x + player.size, y: player.y + player.size },
        ];

        // Sprawdź, czy jakikolwiek wierzchołek znajduje się w elipsie
        for (let corner of rectCorners) {
            if (isPointInEllipse(corner.x, corner.y, bush)) {
                return true;
            }
        }

        // Sprawdź, czy środek elipsy znajduje się w prostokącie (graczu)
        if (
            bush.cx >= player.x &&
            bush.cx <= player.x + player.size &&
            bush.cy >= player.y &&
            bush.cy <= player.y + player.size
        ) {
            return true;
        }

        // Opcjonalnie: sprawdź, czy jakakolwiek krawędź prostokąta przecina elipsę
        const edges = [
            { x1: player.x, y1: player.y, x2: player.x + player.size, y2: player.y }, // górna
            { x1: player.x + player.size, y1: player.y, x2: player.x + player.size, y2: player.y + player.size }, // prawa
            { x1: player.x + player.size, y1: player.y + player.size, x2: player.x, y2: player.y + player.size }, // dolna
            { x1: player.x, y1: player.y + player.size, x2: player.x, y2: player.y }, // lewa
        ];

        for (let edge of edges) {
            if (isLineIntersectingEllipse(edge.x1, edge.y1, edge.x2, edge.y2, bush)) {
                return true;
            }
        }
    }

    return false; // Brak kolizji
}


function isLineIntersectingEllipse(x1, y1, x2, y2, ellipse) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const A = (dx * dx) / (ellipse.a * ellipse.a) + (dy * dy) / (ellipse.b * ellipse.b);
    const B = 2 * ((x1 - ellipse.cx) * dx / (ellipse.a * ellipse.a) + (y1 - ellipse.cy) * dy / (ellipse.b * ellipse.b));
    const C =
        (x1 - ellipse.cx) ** 2 / (ellipse.a * ellipse.a) +
        (y1 - ellipse.cy) ** 2 / (ellipse.b * ellipse.b) -
        1;

    const discriminant = B * B - 4 * A * C;

    return discriminant >= 0; // Jeśli >= 0, linia przecina elipsę
}


// Obsługa kolizji z krzakiem

function bushColision(){

    player.speed = 5;

    if (checkCollisionRectWithEllipse(player, bushes)) {
        for (let bush of bushes) {
            // Sprawdź kolizję z aktualnym krzakiem
            if (isPointInEllipse(player.x, player.y, bush) || isPointInEllipse(player.x + 30, player.y, bush)) {
                // Zablokuj ruch gracza - cofnięcie o poprzedni krok

                

                if (pressedKeys.has('w') || pressedKeys.has('W')) {
                    
                    
                    if(player.x > bush.cx){
                        player.speed = 3;
                        player.x += 3;
                    }else{
                        player.speed = 3;
                        player.x -= 3;
                    }

                }
                if (pressedKeys.has('d') || pressedKeys.has('D')) {
                     
                    
                    if(player.y > bush.cy){
                        player.speed = 3;
                        player.y += 3;
                    }else{
                        player.speed = 3;
                        player.y -= 3;
                    }
                }

                if (pressedKeys.has('s') || pressedKeys.has('S')) {
                    
                    
                    if(player.x > bush.cx){
                        player.speed = 3;
                        player.x += 3;
                    }else{
                        player.speed = 3;
                        player.x -= 3;
                    }
                }
                if (pressedKeys.has('a') || pressedKeys.has('A')) {
                                        
                    if(player.y > bush.cy){
                        player.speed = 3;
                        player.y += 3;
                    }else{
                        player.speed = 3;
                        player.y -= 3;
                        }
                }
                
                
                break;
                
            }
        }
    }

}

// Rysowanie elementów overlayu

function drawOverlay() {

    // ============= Rysowanie ekwipunku ===============

    const squareSize = 50; // Wielkość pojedynczego kwadratu
    const padding = 10;    // Odstęp między kwadratami
    const inventoryX = (olcanvas.width / 2) - (squareSize * 10 + padding * 9) /2; // Odległość od lewej krawędzi canvas
    const inventoryY = olcanvas.height - squareSize - 10; // Odległość od dolnej krawędzi canvas

    olctx.clearRect(0, 0, olcanvas.width, olcanvas.height); // Czyści overlay

    for (let i = 0; i < 10; i++) {

        

        let x = inventoryX + i * (squareSize + padding); // Pozycja X każdego kwadratu
        
        olctx.save();
        olctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Półprzezroczysty biały kolor
        olctx.fillRect(x, inventoryY, squareSize, squareSize); // Rysowanie kwadratu
        
        olctx.fillStyle = 'rgba(150, 150, 150, 1)'; // Kolor tekstu
        olctx.font = '10px Arial'; // Styl czcionki
        olctx.textAlign = 'left'; // Wyrównanie tekstu do lewej
        olctx.textBaseline = 'top'; // Wyrównanie do górnej linii
        olctx.fillText(i + 1, x + 2, inventoryY + 2); // Wyświetla numer w lewym górnym rogu
        olctx.restore();
    }

    // ==================================



    // ========= Rysowanie mapy ==========

    const x = 10;
    const y =  10;
    const mapSize = 150;

    olctx.save()
    olctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    olctx.fillRect(x, y, mapSize, mapSize);
    
    olctx.restore();


    // Rysowanie punktu pozycji gracza


    const scalX = (player.x / 66.5) + 10;
    const scalY = (player.y / 66.5) + 10;
    const radius = 3;

    olctx.save();
    
    olctx.fillStyle = "red"; // Kolor wypełnienia (np. półprzezroczysty niebieski)

    olctx.beginPath();
    olctx.arc(scalX, scalY, radius, 0, Math.PI * 2);
    olctx.fill();
    olctx.closePath();
    olctx.restore();

    // ===================================



    // ======== Rysowanie tabeli graczy ==========
    
    const tableHeigh = 200;
    const tableWidth = 160;
    const tableX = olcanvas.width - tableWidth - 10;
    const tableY = 10;
    const borderRadius = 20;

    olctx.save();
    olctx.fillStyle = "rgba(0, 0, 0, 0.3)";

    // Ścieżka prostokąta z zaokrąglonymi rogami
    olctx.beginPath();
    olctx.moveTo(tableX + borderRadius, tableY);
    olctx.lineTo(tableX + tableWidth - borderRadius, tableY);
    olctx.arcTo(tableX + tableWidth, tableY, tableX + tableWidth, tableY + borderRadius, borderRadius);
    olctx.lineTo(tableX + tableWidth, tableY + tableHeigh - borderRadius); 
    olctx.arcTo(tableX + tableWidth, tableY + tableHeigh, tableX + tableWidth - borderRadius, tableY + tableHeigh, borderRadius);
    olctx.lineTo(tableX + borderRadius, tableY + tableHeigh); 
    olctx.arcTo(tableX, tableY + tableHeigh, tableX, tableY + tableHeigh - borderRadius, borderRadius);
    olctx.lineTo(tableX, tableY + borderRadius); 
    olctx.arcTo(tableX, tableY, tableX + borderRadius, tableY, borderRadius); 
    olctx.closePath();

    olctx.fill(); 
    olctx.restore();
    // =================================================




    
    // ========= Wypełnianie tablicy graczy =============

let i = 1;

            olctx.save();
            olctx.fillStyle = 'white';
            olctx.textAlign = "center";
            olctx.font = 'bold 14px Arial';
            
            olctx.fillText("LEADERBOARD", tableX + tableWidth /2, tableY + 20);
            olctx.restore();


    for(const id in otherPlayers){
        
        const otherPlayer = otherPlayers[id];   

        olctx.save();


        olctx.fillStyle = 'white'; // Kolor tekstu
        olctx.font = '12px Arial'; // Styl czcionki
        olctx.fillText( i + ". " +otherPlayer.name, tableX + 10, tableY + 25 + i * 14);


        olctx.restore();


        i++;
    }

    // =======================================



}









// ===================== Gracze =======================


//  Animacja uderzenia


let mouseDown = false;
let playerActuallyImg = loadedImages.playerimg;
let animationInterval; // Zmienna do przechowywania interwału
let currentAnimationFrame = 0; // Indeks aktualnej klatki animacji

canvas.addEventListener("mousedown", () => {
    mouseDown = true;
    startAnimation();
});

canvas.addEventListener("mouseup", () => {
    mouseDown = false;
    stopAnimation();
});

canvas.addEventListener("mouseleave", () => {
    mouseDown = false;
    stopAnimation();
});

function startAnimation() {
    if (!animationInterval) { // Upewnij się, że interwał nie jest już aktywny
        animationInterval = setInterval(() => {
            if (currentAnimationFrame === 0) {
                playerActuallyImg = loadedImages.playerAnimation1;
                currentAnimationFrame = 1;
            } else if (currentAnimationFrame === 1){
                playerActuallyImg = loadedImages.playerimg;
                currentAnimationFrame = 2;
            }else if (currentAnimationFrame === 2){
                playerActuallyImg = loadedImages.playerAnimation2;
                currentAnimationFrame = 3;
            }else{
                playerActuallyImg = loadedImages.playerimg;
                currentAnimationFrame = 0;
                
            }
        }, 150); // Zmiana co sekundę
    }
}

function stopAnimation() {
    clearInterval(animationInterval); // Zatrzymaj interwał
    animationInterval = null; // Resetuj zmienną interwału
    playerActuallyImg = loadedImages.playerimg; // Powróć do oryginalnego obrazka
    currentAnimationFrame = 0; // Resetuj stan animacji
}



let firstStart = true;

// Rysowanie graczy

function drawPlayers() {    
        
    if(firstStart){
        playerActuallyImg = loadedImages.playerimg;
        firstStart = false;
    }
    
  

    
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(player.angle);  // Obrót gracza
    ctx.drawImage(
        playerActuallyImg,
        -player.size / 2,
        -player.size / 2,
        player.size,
        player.size
    );

    ctx.restore(); 
    ctx.save();  

    
    ctx.font = "15px Arial"; 
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom"; 
    ctx.fillText(player.name, canvas.width / 2, canvas.height / 2 - player.size / 2); 
    ctx.restore(); 

    
    
    for (const id in otherPlayers) {
        const otherPlayer = otherPlayers[id];
        const offsetX = player.x - canvas.width / 2;
        const offsetY = player.y - canvas.height / 2;
        
        const screenX = otherPlayer.x - offsetX;
        const screenY = otherPlayer.y - offsetY;

    
        ctx.save();
        ctx.translate(otherPlayer.x - offsetX, otherPlayer.y - offsetY); // Przesunięcie gracza na ekranie
        ctx.rotate(otherPlayer.angle); // Obrót gracza na podstawie kąta
        ctx.drawImage(loadedImages.playerimg, -player.size / 2, -player.size / 2, player.size, player.size);
        ctx.restore();

        ctx.save();
        ctx.font = "15px Arial";
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(otherPlayer.name, otherPlayer.x - offsetX, otherPlayer.y - offsetY - player.size /2);
        ctx.restore();
        
    }
}

// Obracanie gracza w stronę kursora
function calculateAngle(mouseX, mouseY) {
    const offsetX = player.x - canvas.width / 2;
    const offsetY = player.y - canvas.height / 2;

    const gameMouseX = mouseX + offsetX;
    const gameMouseY = mouseY + offsetY;

    const dx = gameMouseX - player.x;
    const dy = gameMouseY - player.y;

    return Math.atan2(dy, dx); // Kąt w radianach
}



canvas.addEventListener('mousemove', (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    player.angle = calculateAngle(mouseX, mouseY);
});



// Aktualizowanie danych graczy
function updatePlayers(playersData) {
    for (const id in playersData) {
        if (id !== player.id) {
            otherPlayers[id] = playersData[id];
            
            
        }
        
    }
    
}

function removePlayer(id) {
    delete otherPlayers[id];
}


// Obsługa logowania się do gry
document.getElementById('loginButton').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value.trim();

    if (playerName) {
        document.getElementById('loginScreen').style.display = 'none';
        canvas.style.display = 'block';
        bgcanvas.style.display = 'block';

        olcanvas.style.display = 'block';

        socket = new WebSocket('ws://localhost:8080');

        socket.addEventListener('open', () => {
            console.log('Połączono z serwerem');
            socket.send(JSON.stringify({ type: 'login', name: playerName }));
        });

        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'init') {
                player.id = data.id;
                player.name = data.name;

                

                if (!isGameRunning) {
                    isGameRunning = true;
                    gameLoop();
                }
            } else if (data.type === 'update') {
                updatePlayers(data.players);
                
            } else if (data.type === 'remove') {
                removePlayer(data.id);
            }
        });
    }
});

// Główna petla gry
function gameLoop() {
    if (!isGameRunning) return;
    updateLocalPlayerPosition();
    drawMap();
    drawPlayers();
    drawObjects();
    
    bushColision();
    drawOverlay();
    
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

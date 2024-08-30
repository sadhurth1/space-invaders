//board
let tilesize = 32; //32 x 32 pixels
let rows = 16;
let columns = 16;

let board;
let boardWidth = tilesize * columns;
let boardHeight = tilesize * rows;
let context; //rendering context for the canvas

//ship config
let shipwidth = tilesize * 2;
let shipheight = tilesize;
let shipx = tilesize * columns / 2 - tilesize * 2;
let shipy = tilesize * rows - tilesize * 2;

let ship = {
    x: shipx,
    y: shipy,
    width: shipwidth,
    height: shipheight,
}

let shipImg;
let shipvelocityx = tilesize;


//aliens 
let alienArray = [];
let alienWidth = tilesize * 2;
let alienHeight = tilesize;
let alienX = tilesize;
let alienY = tilesize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienvelocityx = 1;

//bullets
let bulletArray = [];
let bulletVelocityY = -10;

let score = 0;
let gameOver = false;

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");


    //load images
    shipImg = new Image(); //a builtin constructor in js
    shipImg.src = "./ship.png";
    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./alien.png";
    createAliens();

    requestAnimationFrame(update);//starts animation loop and upadate function has game logic
    document.addEventListener("keydown", moveship);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return 0;
    }
    context.clearRect(0, 0, board.width, board.height);

    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienvelocityx;

            //if alien touch the border
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienvelocityx *= -1;
                alien.x += alienvelocityx * 2;

                //move all aliens up by one rpw
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;

        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet collision with aliens

        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); //removes the first element element of the array
    }

    //next level
    if (alienCount == 0) {
        //increae the no of aliens in col and row ny 1
        score += alienColumns + alienRows * 100;
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);

        if (alienvelocityx > 0) {
            alienvelocityx += 0.2; //increase alien movement to right
        }
        else {
            alienvelocityx -= 0.2; // to left
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    //score
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}

function moveship(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "ArrowLeft" && ship.x - shipvelocityx >= 0) {
        ship.x -= shipvelocityx;
    }
    else if (e.code == "ArrowRight" && ship.x + shipvelocityx + ship.width <= board.width) {
        ship.x += shipvelocityx;
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,

                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "Space") {
        //shoot
        let bullet = {
            x: ship.x + shipwidth * 15 / 32,
            y: ship.y,
            width: tilesize / 8,
            height: tilesize / 2,
            used: false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && //a's top left corner didnt reach b right corner
        a.x + a.width > b.x && //a top right passes b top left corner
        a.y < b.y + b.height && //a top left corner doest reach b bottom left corner
        a.y + a.height > b.y; //a bottom left  coner passes b top left corner
}


const body = document.querySelector('body');
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.height = 550;
canvas.width = 1100;

let cellWidht = 25;
let cols = canvas.width / cellWidht;
let rows = canvas.height / cellWidht;
const cells = [];

class Cell {
    constructor(x, y) {
        this.x = x * cellWidht;
        this.y = y * cellWidht;
        this.width = cellWidht;

    }
    draw(backColor = 'lightSlateGray', borderColor = 'white') {
        c.beginPath();
        c.fillStyle = backColor;
        c.fillRect(this.x, this.y, this.width, this.width);
        c.fill();

        // c.beginPath();
        // c.strokeStyle = borderColor;
        // c.moveTo(this.x, this.y);
        // c.lineTo(this.x + this.width, this.y);
        // c.lineTo(this.x + this.width, this.y + this.width);
        // c.lineTo(this.x, this.y + this.width);
        // c.lineTo(this.x, this.y);
        // c.stroke();
    }
    neighbors() {
        this.up = cells.indexOf(this) < cols ? cells[cells.indexOf(this) + (rows - 1) * cols] : cells[cells.indexOf(this) - cols];
        this.down = cells.indexOf(this) >= cells.length - cols ? cells[cells.indexOf(this) - (rows - 1) * cols] : cells[cells.indexOf(this) + cols];
        this.right = rightWall.includes(this) ? cells[cells.indexOf(this) - (cols - 1)] : cells[cells.indexOf(this) + 1];
        this.left = cells.indexOf(this) / cols === Math.floor(cells.indexOf(this) / cols) ? cells[cells.indexOf(this) + cols - 1] : cells[cells.indexOf(this) - 1];
    }

}

for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
        cells.push(new Cell(x, y));
    }
}
cells.forEach(cell => cell.draw());

class Snake {
    constructor(head, body, direction, speed, potencionalTail) {
        this.head = head;
        this.body = body;
        this.direction = direction;
        this.speed = speed;
        this.started = false;
        this.potencionalTail = potencionalTail;
        this.score = 0;
        this.scoreShow = document.querySelector('#score');
        this.bestScore = localStorage.getItem('best-score') ? parseInt(localStorage.getItem('best-score')) : 0;
        this.bestScoreShow = document.querySelector('#best-score');
        this.bestScoreShow.innerHTML = `Best: ${this.bestScore}`;
        this.reset = document.querySelector('#reset');
        this.dead = false;
        this.fruitSound = document.querySelector('#friut-sound');
        this.dieSound = document.querySelector('#die-sound');
    }
    show() {
        this.body.forEach(cell => cell.draw('green'));
        this.head.draw('rgb(150, 255, 0)');
    }
    move() {
        if (this.dead) return;
        this.movingInterval = setInterval(() => {
            this.body[this.body.length - 1].draw();
            this.potencionalTail = this.body[this.body.length - 1];
            for (let i = this.body.length - 1; i > 0; i--) {
                this.body[i] = this.body[i - 1];
            }
            this.body[0] = this.head;
            switch (this.direction) {
                case 'up':
                    this.head = this.head.up;
                    break;
                case 'right':
                    this.head = this.head.right;
                    break;
                case 'down':
                    this.head = this.head.down;
                    break;
                case 'left':
                    this.head = this.head.left;
                    break;
            }
            this.show();
            if (this.body.includes(this.head) || blocks.includes(this.head)) this.die();
            if (this.head === this.fruit) {
                this.eatFtuit();
                this.generateFruit();
            }
        }, this.speed);
    }
    start() {
        if (this.started) return;
        this.generateFruit();
        this.move();
        this.started = true;
    }
    die() {
        this.dead = true;
        clearInterval(this.movingInterval);
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreShow.innerHTML = `Best: ${this.score}`;
        }
        this.dieSound.play();
        this.reset.style.opacity = '1';
        setInterval(() => {
            if (this.reset.innerHTML === '0') {
                this.reset.innerHTML = '0';
                location.reload();
            }
            else this.reset.innerHTML = parseInt(this.reset.innerHTML) - 1;
        }, 1000);
        localStorage.setItem('best-score', this.bestScore);
    }
    generateFruit() {
        this.random = Math.floor(Math.random() * cells.length);
        if (blocks.includes(cells[this.random]) || this.body.includes(cells[this.random]) || this.head === cells[this.random]) return this.generateFruit();
        this.fruit = cells[this.random];
        this.fruit.draw('red');
        this.fruitEatTime = 0;
        this.fruitEatTimeInterval = setInterval(() => {
            this.fruitEatTime++;
        }, 1000);
    }
    eatFtuit() {
        this.body.push(this.potencionalTail);
        this.speed *= 0.98;
        this.speedUp();
        this.fruitSound.play();
        if (this.fruitEatTime < 1) this.score += 180;
        else if (this.fruitEatTime < 2) this.score += 170;
        else if (this.fruitEatTime < 3) this.score += 160;
        else if (this.fruitEatTime < 4) this.score += 150;
        else if (this.fruitEatTime < 6) this.score += 140;
        else if (this.fruitEatTime < 8) this.score += 130;
        else if (this.fruitEatTime < 11) this.score += 120;
        else if (this.fruitEatTime < 15) this.score += 110;
        else if (this.fruitEatTime < 20) this.score += 100;
        else this.score += 90;
        clearInterval(this.fruitEatTimeInterval);
        this.scoreShow.innerHTML = `Score: ${this.score}`;
    }
    speedUp() {
        clearInterval(this.movingInterval);
        setTimeout(() => {
            this.move();
        }, this.speed / 2)
    }

}

class Block {
    constructor(x, y, width, height, block = true) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.convertor = undefined;
        if (block) this.convertCellsToBlocks();
    }
    convertCellsToBlocks() {
        this.convertor = cells.filter(cell => cell.x >= this.x && cell.x < this.x + this.width && cell.y >= this.y && cell.y < this.y + this.height);
        this.convertor.forEach(cell => blocks.push(cell));
    }
    convertingCellstoSnake(start, bodyType) {
        this.convertor = cells.filter(cell => cell.x >= this.x && cell.x < this.x + this.width && cell.y >= this.y && cell.y < this.y + this.height);
        this.tail = this.convertor[this.convertor.length - 1];
        if (bodyType === 'head') return start === 'start' ? this.convertor[0] : this.convertor[this.convertor.length - 1];
        else if (bodyType === 'body') {
            this.convertor.splice(0, 1);
            this.convertor.splice(this.convertor.length - 1, 1);
            return this.convertor;
        }
        else if (bodyType === 'tail') {
            return this.tail;
        }
    }
}

// const snake = new Snake(cells[742], [cells[786], cells[830], cells[874]], 'up', 150, cells[918]);
const snakeCreator = new Block(850, 400, 125, 25, false);
const snake = new Snake(snakeCreator.convertingCellstoSnake('start', 'head'), snakeCreator.convertingCellstoSnake('start', 'body'), 'left', 150, snakeCreator.convertingCellstoSnake('start', 'tail'));
snake.show();

const rightWall = [];
for (let i = cols - 1; i < cells.length; i += 44) {
    rightWall.push(cells[i]);
}

cells.forEach(cell => cell.neighbors());

const blocks = [];



// Edges
new Block(cols * 25 - 25, 0, 25, 150);
new Block(cols * 25 - 150, 0, 150, 25);
new Block(0, 0, 25, 150);
new Block(0, 0, 150, 25);
new Block(0, rows * 25 - 150, 25, 150);
new Block(0, rows * 25 - 25, 150, 25);
new Block(cols * 25 - 25, rows * 25 - 150, 25, 150);
new Block(cols * 25 - 150, rows * 25 - 25, 150, 25);

// // Center Cube
new Block(400, 150, 275, 250);

// Maze
// new Block(0, 0, 25, 425);
// new Block(100, 125, 25, 425);
// new Block(200, 0, 25, 425);
// new Block(300, 125, 25, 425);
// new Block(400, 0, 25, 425);
// new Block(500, 125, 25, 425);
// new Block(600, 0, 25, 425);
// new Block(700, 125, 25, 425);
// new Block(800, 0, 25, 425);
// new Block(900, 125, 25, 425);
// new Block(1000, 0, 25, 425);
// new Block(1100, 125, 25, 425);
// new Block(1200, 0, 25, 425);
// new Block(0, 0, 1225, 25);
// new Block(0, rows * 25 - 25, 1225, 25);

blocks.forEach(cell => cell.draw('rgb(177, 54, 177)'));


window.addEventListener('keydown', (e) => {
    if ((e.key === 'ArrowUp' || e.key === 'w') && snake.direction !== 'down') snake.direction = 'up';
    else if ((e.key === 'ArrowDown' || e.key === 's') && snake.direction !== 'up') snake.direction = 'down';
    else if ((e.key === 'ArrowRight' || e.key === 'd') && snake.direction !== 'left') snake.direction = 'right';
    else if ((e.key === 'ArrowLeft' || e.key === 'a') && snake.direction !== 'right') snake.direction = 'left';
    console.log(snake.direction);
    snake.start();
});


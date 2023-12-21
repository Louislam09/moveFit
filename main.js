const GAME_SCREEN = document.querySelector('.game_screen');
const CANVAS = document.querySelector('canvas');
const NOT_ALLOW_MOVES = {
    ONE:{x:25,y:375},
    TWO:{x:575,y:375}
}

class PlayerCircles {
  constructor(x, y, color,number) {
    this.number= number;
    this.x = x;
    this.y = y;
    this.radius = 25;
    this.color = color;
    this.canvas = CANVAS;
    this.ctx = CANVAS.getContext('2d');
  }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.strokeStyle = 'black';
        this.ctx.fill();
        // this.ctx.stroke();
        this.ctx.closePath();
    }

    connectCircles(empty) {
        if(this.checkNotAllowConnection(empty)) return;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(empty.x, empty.y);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 10;
        this.ctx.stroke();
        empty.connectedWith = this;
        empty.draw();
        this.draw()
    }

    checkNotAllowConnection(empty){
        if(NOT_ALLOW_MOVES.ONE.x === this.x && NOT_ALLOW_MOVES.ONE.y === this.y && 
            NOT_ALLOW_MOVES.TWO.x === empty.x && NOT_ALLOW_MOVES.TWO.y === empty.y){
            return true
        }
        if(NOT_ALLOW_MOVES.TWO.x === this.x && NOT_ALLOW_MOVES.TWO.y === this.y &&
            NOT_ALLOW_MOVES.ONE.x === empty.x && NOT_ALLOW_MOVES.ONE.y === empty.y){
            return true
        }
    }

    clearLine(empty) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(empty.x, empty.y);
        this.ctx.strokeStyle = '#6FB7BF';
        this.ctx.lineWidth = 10;
        this.ctx.stroke();
        this.draw();
    }

    onClick(event,emptySpot) {
        const x = event.offsetX;
        const y = event.offsetY;
        const distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));

        if (distance < this.radius) {
            this.connectCircles(emptySpot);
        }
    }

}

class Spot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isEmpty = true;
        this.connectedWith = null;
        this.canvas = CANVAS;
        this.ctx = CANVAS.getContext('2d');
        this.radius = 25;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.fill();
        // this.ctx.stroke();
        this.ctx.closePath();
    }

    swapSpot() {
        if(!this.connectedWith) return
        const temp = {x: this.x, y: this.y};
        this.x = this.connectedWith.x;
        this.y = this.connectedWith.y;
        this.connectedWith.x = temp.x;
        this.connectedWith.y = temp.y;
        this.connectedWith.clearLine(this);
        this.draw();
        this.connectedWith.draw();
        this.connectedWith = null;
        mygame.saveGameState()
    }

    toggleSpot() {
        this.isEmpty = false;
    }

    onClick(event) {
        const x = event.offsetX;
        const y = event.offsetY;
        const distance = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));

        if (distance < this.radius) {
            this.swapSpot()
        }
    }

}

class Game {
    constructor() {
        this.circles = [];
        this.spots = [];
        this.canvas = CANVAS;
        this.ctx = this.canvas.getContext('2d');
        this.GAME_WIDTH = GAME_SCREEN?.offsetWidth;
        this.GAME_HEIGHT = GAME_SCREEN?.offsetHeight;
        this.GAME_STATE = null;
        this.offSize = 15;
        this.DEFAULT_LINES_COORS = [
            {x1: this.offSize, y1: this.offSize, x2: this.GAME_WIDTH -this.offSize, y2: this.offSize},
            {x1: this.GAME_WIDTH-this.offSize, y1: this.offSize, x2: this.GAME_WIDTH-this.offSize,y2: this.GAME_HEIGHT-this.offSize},
            {x1: this.offSize, y1: this.GAME_HEIGHT-this.offSize, x2: this.offSize,y2: this.offSize},
            {x1: this.offSize, y1: this.offSize, x2: this.GAME_WIDTH - this.offSize,y2: this.GAME_HEIGHT-this.offSize},
            {x1: this.GAME_WIDTH-this.offSize, y1: this.offSize, x2: this.offSize,y2: this.GAME_HEIGHT-this.offSize},
        ]
        this.DEFAULT_LINE_COLOR = '#6FB7BF';
        this.PLAYERS_POS = [
            { x: 25, y: 25, color: 'yellow' },
            { x: this.GAME_WIDTH  - 25, y: 25,color: 'yellow' },
            { x: 25, y: this.GAME_HEIGHT  - 25 ,color: 'green'},
            { x: this.GAME_WIDTH -  25, y: this.GAME_HEIGHT - 25,color: 'green'  },
        ]
        this.init();
    }

    init() {
        this.canvas.width = this.GAME_WIDTH;
        this.canvas.height = this.GAME_HEIGHT;

        for(let i = 0; i < this.DEFAULT_LINES_COORS.length; i++) {
            const {x1,y1,x2,y2} = this.DEFAULT_LINES_COORS[i];
            this.ctx.strokeStyle = this.DEFAULT_LINE_COLOR;
            this.ctx.beginPath();
            this.ctx.moveTo(x1,y1);
            this.ctx.lineWidth = 10;
            this.ctx.lineTo(x2,y2);
            this.ctx.stroke();
        }

        this.addCircles();
        this.drawCircles();
        this.defineSpotState();
        this.canvas.addEventListener('click', this.onClick.bind(this));
        this.saveGameState()
    }
    
    addCircles() {
        for (let i = 0; i < this.PLAYERS_POS.length; i++) {
            const element = this.PLAYERS_POS[i];
            this.circles.push(new PlayerCircles(element.x, element.y, element.color));
            this.spots.push(new Spot(element.x, element.y));
        }
        this.spots.push(new Spot(this.GAME_WIDTH /2, this.GAME_HEIGHT /2));
    }

    defineSpotState() {
        this.circles.forEach(circle => {
            this.spots.forEach(spot => {
                if(circle.x === spot.x && circle.y === spot.y) {
                    spot.toggleSpot();
                }
            });
        })
    }

    checkIfSpotIsEmpty(x,y) {}
    
    drawCircles() {
        for (let i = 0; i < this.circles.length; i++) {
            this.circles[i].draw();
        }
    }

    getEmptySpot() {
        return this.spots.find(spot => spot.isEmpty);
    }

    getClickedCircle(event){
        const x = event.offsetX;
        const y = event.offsetY;
        let circle = null;
        this.circles.forEach(c => {
            const distance = Math.sqrt(Math.pow(x - c.x, 2) + Math.pow(y - c.y, 2));
            if (distance < c.radius) {
                circle =  c;
            }
        })
        return circle
    }

    restoreGameState() {
        this.ctx.putImageData(this.GAME_STATE,0,0)
    }

    saveGameState(){
        this.GAME_STATE = this.ctx.getImageData(0,0,this.GAME_WIDTH,this.GAME_HEIGHT);
    }

    onClick(event) {
        const emptySpot = this.getEmptySpot();
        const clickedCircle = this.getClickedCircle(event);
        // this.circles.forEach(circle => circle.clearLine(emptySpot));
        this.restoreGameState()
        if(emptySpot) emptySpot.onClick(event);
        if(clickedCircle) clickedCircle.onClick(event,emptySpot);
    }
}

const mygame = new Game();

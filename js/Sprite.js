
class Sprite{
    constructor({
        imgSrc,
        scale,
        framesMax,
        canvas,
        imgOffset,
        width,
        height,
        framesHold,
        center,
        row
    }){
        this.width = width
        this.height = height
        this.image = new Image()
        this.image.src = imgSrc
        this.framesMax = framesMax
        this.frameCurrent = 0
        this.framesElapsed = 0
        this.framesHold = framesHold
        this.canvas = canvas
        this.scale = scale
        this.imgOffset = imgOffset
        this.center = center
    }

    draw(){

        // hurtbox
        // this.canvas.fillStyle = 'green';
        // this.canvas.beginPath();
        // this.canvas.rect(this.center.x - this.width/2, this.center.y - this.height/1.5, this.width, this.height)
        // this.canvas.fill();
        // this.canvas.stroke();

        if(this.physics == 'fps'){
            
            this.canvas.beginPath();
            this.canvas.arc(window.innerWidth/2, window.innerHeight/2, 2, 0, 2*3.14);
            this.canvas.moveTo(window.innerWidth/2, this.temp);
            this.canvas.arc(window.innerWidth/2, this.temp, 2, 0, 2*3.14);
            this.canvas.fill();
            this.canvas.stroke();

        } else {
            // this.canvas.beginPath();
            // this.canvas.arc(this.center.x, this.center.y, this.width/4, 0, 2*3.14);
            // this.canvas.fill();
            // this.canvas.stroke();


            // console.log(this.image.row);
            // draw sprite
            // img, sx, sy, sw, sh, x, y, w, h
            this.canvas.drawImage(
                this.image,
                this.frameCurrent * (this.image.width / this.framesMax),
                0,
                this.image.width / this.framesMax,
                this.image.height,
                this.center.x - this.imgOffset.x,
                this.center.y - this.imgOffset.y,
                (this.image.width / this.framesMax) * this.scale,
                this.image.height * this.scale,
            );
        }
        

    }

    update(){
        this.draw();
        this.framesElapsed++;

        if(this.framesElapsed % this.framesHold === 0){
            if(this.frameCurrent < this.framesMax -1)
               this.frameCurrent++;
            else
                this.frameCurrent = 0;
        }
    }

    switchSprite(sprite){
        this.state = sprite;
        let dir = null;
        switch (sprite) {
            case 'idle':
                dir = (Math.cos(this.angle) < 0) ? 'idleL' : 'idle';
                break;
            case 'run':
                dir = (Math.cos(this.angle) < 0) ? 'runL' : 'run';
                break;
            case 'jump':
                dir = (Math.cos(this.angle) < 0) ? 'jumpL' : 'jump';
                this.position.z = this.position.y
                break;
            case 'fall':
                dir = (Math.cos(this.angle) < 0) ? 'fallL' : 'fall';
                break;
            case 'attack':
                dir = (Math.cos(this.angle) < 0) ? 'attackL' : 'attack';
                break;
            case 'death':
                dir = (Math.cos(this.angle) < 0) ? 'deathL' : 'death';
                break;
            default:
                break;
        }
        if(this.image !== this.sprites[dir].image){
            this.image = this.sprites[dir].image
            this.framesMax = this.sprites[dir].framesMax
            this.frameCurrent = 0
        }

    }

}


const knightSprites = {
    data: {
        offset: {x: 70, y: 67}
        , spriteHeight: 40
        , spriteWidth: 40
    },
    idle: {
        imgSrc: '../assets/char/knight/Idle.png'
        , framesMax: 11
    },
    run: {
        imgSrc: '../assets/char/knight/Run.png'
        , framesMax: 8
    },
    jump: {
        imgSrc: '../assets/char/knight/Jump.png'
        , framesMax: 4
    },
    fall: {
        imgSrc: '../assets/char/knight/Fall.png'
        , framesMax: 4
    },
    attack: {
        imgSrc: '../assets/char/knight/Attack.png'
        , framesMax: 6
    },
    death: {
        imgSrc: '../assets/char/knight/Death.png'
        , framesMax: 9
    },




    idleL: {
        imgSrc: '../assets/char/knight//L/Idle.png'
        , framesMax: 11
    },
    runL: {
        imgSrc: '../assets/char/knight/L/Run.png'
        , framesMax: 8
    },
    jumpL: {
        imgSrc: '../assets/char/knight/L/Jump.png'
        , framesMax: 4
    },
    fallL: {
        imgSrc: '../assets/char/knight/L/Fall.png'
        , framesMax: 4
    },
    attackL: {
        imgSrc: '../assets/char/knight/L/Attack.png'
        , framesMax: 6
    },
    deathL: {
        imgSrc: '../assets/char/knight/L/Death.png'
        , framesMax: 9
    },
}

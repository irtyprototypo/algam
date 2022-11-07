
class Husk extends Sprite{
    constructor({
        canvas
        , username
        , position
        , color = '#009933'
        , imgSrc
        , scale = 1
        , framesMax
        , imgOffset = knightSprites.data.offset
        , width
        , height
        , framesHold
        , spriteName
        , sessionId
        }){
            super({imgSrc, scale, framesMax, canvas, imgOffset, framesHold, center:position})  
            this.username = username
            this.spawnPoint = {x: position.x, y:position.y}
            this.position = position
            this.width = width
            this.height = height
            this.sessionId = 69
            this.canvas = canvas
            this.angle = Math.PI/3
            this.color = color
            this.state = 'idle'
            
            this.direction = 1
            this.frameCurrent = 0
            this.framesElapsed = 0
            this.imgOffset = imgOffset
            this.sessionId = sessionId
            this.sprites = knightSprites
            for(const s in this.sprites){
                if(s != 'data'){
                    this.sprites[s].image = new Image()
                    this.sprites[s].image.src = this.sprites[s].imgSrc
                    // this.sprites[s].image.row = this.sprites[s].row * knightSprites.data.spriteHeight
                }
            };
        }
    
    stopMoving(){
        this.velocity.x = 0;
        this.velocity.y = 0;
        // this.velocity.z = 0;
    }


    drawHitBox(){
        this.canvas.strokeStyle = '#000';
        this.canvas.fillStyle = '#fff';
        this.map.canvas.font = "15px Arial";
            // draw outer body
        this.canvas.beginPath();
        this.canvas.arc(this.position.x, this.position.y, 10, 0, 2*3.14);
        this.canvas.fill();
        this.canvas.stroke();
            
    }


    updateData({x, y, angle, state}){
        this.position.x = x;
        this.position.y = y;
        this.angle = angle;
        this.switchSprite(state)

        // this.drawHitBox();
        // super.update();

    }


    respawn(){
        this.position.x = this.spawnPoint.x;
        this.position.y = this.spawnPoint.y;
    }


}


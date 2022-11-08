let rays = [];
let huskImg = new Image();
huskImg.src = '../assets/static/ss.png';
huskImg.maxFrames = 4;


class Player extends Sprite{
    constructor({
        canvas
        , username
        , position
        , map
        , color = '#009933'
        , imgSrc
        , scale = 1
        , framesMax
        , imgOffset = knightSprites.data.offset
        , width
        , height
        , framesHold
        , spriteName
        , center
        , isOnline
        }){
            super({imgSrc, scale, framesMax, canvas, imgOffset, framesHold, center})  
            this.username = username
            this.spawnPoint = {x: position.x, y:position.y}
            this.center = {x: 0, y: 0}
            this.mapOffset = {x: 0, y: 0}
            this.position = position
            this.prevPos = {x: 0, y: 0, z: 0}
            this.velocity = {x: 0, y: 0, z: 0, terminal: 30}
            this.width = width
            this.height = height
            this.sessionId = 69
            this.isOnline = isOnline
            this.map = map
            this.room = null
            // this.hitBox = {
            //     position: {
            //         x: this.position.x,
            //         y: this.position.y,
            //     },
            //     offset:{
            //         x: 25,
            //         y: 35,
            //     },
            //     width: 50,
            //     height: 50
            // }
            this.canvas = canvas
            this.isFalling = false
            this.isJumping = false
            this.isGrounded = false
            this.lastAction = 'idle'
            this.runSpeed = {x: 0, y: 0}
            this.rotSpeed = .05
            this.tile = {x: 0, y: 0}
            this.tileType = 1
            this.tileIndex = 0
            this.port = 0
            this.angle = Math.PI/3
            this.color = color
            this.ecb = {top: 0, right: 0, bottom: 0, left: 0}
            this.applyGravity = false
            this.gravity = 0
            this.physics = 'rpg'
            this.availableJumps = 1
            this.fov = Math.PI/2
            this.rayNum = 256
            this.stepAngle = this.fov/this.rayNum
            this.temp = null
            this.temp2 = null
            this.state = 'idle'
            this.midDepth = 0
            this.midWallHeight = 0
            this.husk = {screen_x: 0, norm_dist: 0}
            this.targetBlockIndex = 0
            
            this.frameCurrent = 0
            this.framesElapsed = 0
            this.imgOffset = imgOffset
            this.sprites = knightSprites
            for(const s in this.sprites){
                if(s != 'data'){
                    this.sprites[s].image = new Image()
                    this.sprites[s].image.src = this.sprites[s].imgSrc
                    // this.sprites[s].image.row = this.sprites[s].row * knightSprites.data.spriteHeight
                }
            }
        

        }
    
    stopMoving(){
        this.velocity.x = 0;
        this.velocity.y = 0;
        // this.velocity.z = 0;
    }


    performRPGAction(action){
        // if(action != 'idle') console.log(action);
        if(this.tileType == 0) console.log(`Player ${this.port} is in a wall at index ${this.tileIndex}`);

            switch (action) {
                case 'run_right':
                    this.velocity.x = this.runSpeed.x;
                    this.angle = 1;
                    if(this.isGrounded) this.switchSprite('run');
                    break;
                case 'run_left':
                    this.velocity.x = -this.runSpeed.x;
                    this.angle = 3;
                    if(this.isGrounded) this.switchSprite('run');
                    break;
                case 'run_up':
                    this.velocity.y = -this.runSpeed.y;
                    if(this.isGrounded) this.switchSprite('run');
                    break;
                case 'run_down':
                    this.velocity.y = this.runSpeed.y;
                    if(this.isGrounded) this.switchSprite('run');
                    break;
                default:
                    this.stopMoving()
                    if(this.isGrounded) this.switchSprite('idle');
                    break;
            }
        this.lastAction = action
    }

    performFPSAction(action){
        // if(action != 'idle') console.log(action);
        if(this.tileType == 0) console.log(`Player ${this.port} is in a wall at index ${this.tileIndex}`);
            switch (action) {
                case 'run_right':
                        this.velocity.x -= Math.floor(this.runSpeed.x * Math.sin(this.angle));
                        this.velocity.y += Math.floor(this.runSpeed.y * Math.cos(this.angle));
                        this.state = 'run';
                    break;
                case 'run_left':
                        this.velocity.x += Math.floor(this.runSpeed.x * Math.sin(this.angle));
                        this.velocity.y -= Math.floor(this.runSpeed.y * Math.cos(this.angle));
                        this.state = 'run';
                    break;
                case 'run_forward':
                        this.velocity.x += Math.floor(this.runSpeed.x * Math.cos(this.angle));
                        this.velocity.y += Math.floor(this.runSpeed.y * Math.sin(this.angle));
                        this.state = 'run';
                    break;
                case 'run_back':
                        this.velocity.x -= Math.floor(this.runSpeed.x * Math.cos(this.angle));
                        this.velocity.y -= Math.floor(this.runSpeed.y * Math.sin(this.angle));
                        this.state = 'run';
                    break;
                case 'rot_cw':
                        this.angle += this.rotSpeed;
                        this.angle %= 6.28;
                        this.state = 'idle';
                    break;
                case 'rot_ccw':
                        this.angle -= this.rotSpeed;
                        this.angle %= 6.28;
                        this.state = 'idle';
                    break;
                default:
                    this.stopMoving();
                    this.state = 'idle';

                    break;
            }
        this.lastAction = action
    }

    performPlatformingAction(action){
        if(this.tileType == 0) console.log(`Player ${this.port} is in a wall at index ${this.tileIndex}`);

            switch (action) {
                case 'run_right':
                        this.velocity.x = this.runSpeed.x;
                        this.angle = 1;
                        if(this.isGrounded) this.switchSprite('run');
                    break;
                case 'run_left':
                        this.velocity.x = -this.runSpeed.x;
                        this.angle = 3;
                        if(this.isGrounded) this.switchSprite('run');
                    break;
                    case 'run_up':
                        this.velocity.y = -this.runSpeed.y;
                        if(this.isGrounded) this.switchSprite('run');
                        break;
                    case 'run_down':
                        this.velocity.y = this.runSpeed.y;
                        if(this.isGrounded) this.switchSprite('run');
                        break;
                case 'jump':
                    this.isGrounded = false;
                    this.isJumping = true;
                    // this.velocity.y -= this.gravity;
                    // setTimeout(10, _=>{ this.isJumping = false})
                    this.isFalling = false;
                    this.switchSprite('jump');
                    
                    if(this.availableJumps > 0){
                        this.availableJumps--;
                        let jup = setInterval(_=>{
                            this.velocity.y = -this.runSpeed.y;
                            // this.velocity.z = this.jumpVel;
                            // console.log('jumping');
                        }, 17);

                        this.isJumping = true;
                        
                        setTimeout(_=>{
                            this.isJumping = false;
                            this.isFalling = true;
                            this.availableJumps++;

                            clearInterval(jup);
                        }, 300);
                    }
                    break;
                case 'fall':
                        if(!this.isJumping){
                            this.isGrounded = false;
                            this.velocity.y += this.gravity;
                        }
                        this.switchSprite('fall');
                    break;
                case 'attack':
                    console.log('atk');
                    this.isAttacking = true;
                    if(this.isGrounded)
                        this.stopMoving();

                    this.switchSprite('attack');
                    setTimeout(_=>{
                        this.isAttacking = false;
                        this.attackLanded = false
                    }, 600);
                    
                    break;
                case 'death':
                    this.stopMoving()
                    if(this.isGrounded) this.switchSprite('death');
                    break;
                default:
                    this.stopMoving()
                    this.switchSprite('idle');
                    break;
            }
        this.lastAction = action
    }


    drawHitBox(){

        // draw casted rays
        if(this.physics == 'fps'){
            // draw facing angle
            this.canvas.beginPath();
            this.canvas.moveTo(this.center.x, this.center.y);
            this.canvas.lineTo(this.center.x + Math.cos(this.angle) * this.width/2, this.center.y + Math.sin(this.angle) * this.width/2)
            this.canvas.stroke();

            // draw casted rays
            this.canvas.strokeStyle = '#00ffff';
            rays.forEach( r =>{
                this.canvas.beginPath();
                this.canvas.moveTo(this.center.x, this.center.y);
                this.canvas.lineTo(r.x, r.y)
                this.canvas.stroke();
            })
        } else{

            // draw outer body
            this.canvas.beginPath();
            this.canvas.arc(this.center.x, this.center.y, this.width/4, 0, 2*3.14);
            this.canvas.fill();
            this.canvas.stroke();

            // // draw center point
            this.canvas.fillStyle = 'green';
            this.canvas.beginPath();
            this.canvas.arc(this.center.x, this.center.y, this.width/16, 0, 2*3.14);
            this.canvas.fill();
            this.canvas.stroke();
            
            // draw ECBs
            // this.canvas.beginPath();
            // this.canvas.arc(this.center.x, this.ecb.south, this.width/16, 0, 2*3.14);
            // this.canvas.stroke();

        }
    }

    update(){


        if(this.prevTileIndex != this.tileIndex)
            this.prevTileIndex = this.tileIndex

        this.tileIndex = Math.floor((this.center.x-this.mapOffset.x)/this.map.tileWidth) + Math.floor((this.center.y-this.mapOffset.y)/this.map.tileHeight) * Math.floor(this.map.mapHeight)
        this.tile = [Math.floor((this.center.x-this.mapOffset.x)/this.map.tileWidth), Math.floor((this.center.y-this.mapOffset.y)/this.map.tileHeight)]
        this.tileType = this.map.gamMap[this.tileIndex]


        this.mapOffset.x = this.map.viewport.offset[0];
        this.mapOffset.y = this.map.viewport.offset[1];

        if(this.physics == 'fps'){
            this.mapOffset = {x: 0, y: 0};
            this.generateRays();
        }
        else{
            this.canvas.fillStyle = '#000'
            this.canvas.font = "15px Arial"
            this.canvas.fillText(`${this.sessionId}`, this.center.x - this.canvas.measureText(this.sessionId).width/4, this.center.y - this.height/2)
            this.map.viewport.update(this.position.x + this.width/2,  this.position.y + this.height/2)
        }
            

        this.ecb.north = Math.floor(Math.floor(this.tileIndex / this.map.mapHeight) * this.map.tileHeight) + this.mapOffset.y ;
        this.ecb.east = Math.floor(Math.floor(this.tileIndex % this.map.mapWidth) * this.map.tileWidth + this.map.tileWidth) + this.mapOffset.x;
        this.ecb.south = Math.floor(Math.floor(this.tileIndex / this.map.mapHeight) * this.map.tileHeight + this.map.tileHeight) + this.mapOffset.y;
        this.ecb.west = Math.floor(Math.floor(this.tileIndex % this.map.mapHeight) * this.map.tileWidth) + this.mapOffset.x;


        // wall collision
        if (this.velocity.x < 0 && (this.map.gamMap[this.tileIndex-1] != mapTileTypes.walkable && this.center.x <= (this.ecb.west+this.width/3)))
            this.velocity.x = 0;
        if (this.velocity.x > 0 && (this.map.gamMap[this.tileIndex+1] != mapTileTypes.walkable && this.center.x >= (this.ecb.east-this.width/3)))
            this.velocity.x = 0;
        if (this.velocity.y < 0 && (this.map.gamMap[this.tileIndex-this.map.mapWidth] != mapTileTypes.walkable && this.center.y <= (this.ecb.north+this.width/3)))
            this.velocity.y = 0;
        if (this.velocity.y > 0 && (this.map.gamMap[this.tileIndex+this.map.mapWidth] != mapTileTypes.walkable && this.center.y >= (this.ecb.south-this.width/3)))
            this.velocity.y = 0;


        if(this.applyGravity){
            if(!this.isJumping && (this.map.gamMap[this.tileIndex + this.map.mapWidth] == mapTileTypes.walkable || this.center.y < this.ecb.south - this.height/3)){
                this.performPlatformingAction('fall');
            } else{
                if(!this.isJumping)
                    this.velocity.y = 0;
                    this.isGrounded = true;
            }
        }


        
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.center.x = this.position.x + this.width/2  + this.mapOffset.x;
        this.center.y = this.position.y + this.height/2  + this.mapOffset.y;

        if(this.isOnline)
            this.room.send('player', {
                pid: this.id
                , x: this.position.x + this.width/2
                , y: this.position.y + this.height/2
                , angle: this.angle
                , state: this.state
            });

        super.update();
        // this.drawHitBox();

    }


    setRPGPhysics(){
        this.physics = 'rpg';
        this.runSpeed = {x: 5, y: 5};
        this.applyGravity = false;
        this.isGrounded = true;
        this.isJumping = false;
        this.isFalling = false;
        
    }
    
    setPlatformerPhysics(){
        this.physics = 'platformer';

        this.runSpeed = {x: 4, y: 8};
        this.gravity = 1;
        this.applyGravity = true;
        this.isGrounded = false;
        this.isJumping = false;
        this.isFalling = false;
    }

    setFPSPhysics(){
        this.physics = 'fps';

        this.runSpeed = {x: 4, y:4};
        this.rotSpeed = .05;
        // this.rotSpeed = .005;
        this.velocity.terminal = 8;
        this.applyGravity = false;
        this.isGrounded = true;
        this.isJumping = false;
        this.isFalling = false;
    }


    respawn(){
        this.position.x = this.spawnPoint.x;
        this.position.y = this.spawnPoint.y;
    }

    generateRays(){
        let texture = 0, textureX, textureY, wallHeight, depth, vertDepth, horzDepth, rayAngle, midAngle, curCos, curSin, xVert, yVert, dx, dy, dDepth, xHorz, yHorz, index;
        let theDeep = this.map.mapWidth * this.map.tileWidth;
            
        this.canvas.fillStyle = `#434039`;
        this.canvas.fillRect(0, 0, window.innerWidth, window.innerHeight/2 );
        this.canvas.fillStyle = `#76736e`;
        this.canvas.fillRect(0, window.innerHeight/2, window.innerWidth, window.innerHeight/2 );
        if(this.physics != 'fps') return;

        rayAngle = this.angle - this.fov/2;
        midAngle = this.angle + 2*3.14;
        // rayAngle = midAngle;
        
        this.canvas.font = "30px Arial";
        this.canvas.fillStyle = '#40D61A';

        for (let i=0; i < this.rayNum; i++){
            curCos = Math.cos(rayAngle);
            curSin = Math.sin(rayAngle);

            // vertical line detectection
            xVert = (curCos > 0) ? (Math.floor(this.center.x / this.map.tileWidth)+1) * this.map.tileWidth : (Math.floor(this.center.x / this.map.tileWidth)-.00001) * this.map.tileWidth;
            dx = (curCos > 0) ? this.map.tileWidth : -this.map.tileWidth
            vertDepth = (xVert - this.center.x) / curCos;
            yVert = this.center.y + vertDepth * curSin;
            dDepth = dx / curCos;
            dy = dDepth * curSin;

            for(let j=0;j<theDeep;j+=this.map.tileWidth){
                index = Math.floor(xVert/this.map.tileWidth) + Math.floor(yVert/this.map.tileHeight) * this.map.mapHeight
                // index = (curCos >= 0) ? index+=this.map.mapHeight : index
                textureY = this.map.gamMap[index]
                if(this.map.gamMap[index] != mapTileTypes.walkable) break;
                xVert += dx
                yVert += dy
                vertDepth += dDepth;

            }

            // horizontal line detection
            yHorz = (curSin > 0) ? (Math.floor(this.center.y / this.map.tileHeight)+1) * this.map.tileHeight : (Math.floor(this.center.y / this.map.tileHeight)-.00001) * this.map.tileHeight;
            dy = (curSin > 0) ? this.map.tileHeight : -this.map.tileHeight
            horzDepth = (yHorz - this.center.y) / curSin;
            xHorz = this.center.x + horzDepth * curCos;
            dDepth = dy / curSin;
            dx = dDepth * curCos;
            

            for(let j=0;j<theDeep;j+=this.map.tileHeight){
                index = Math.floor(xHorz/this.map.tileWidth) + Math.floor(yHorz/this.map.tileHeight) * this.map.mapHeight
                textureX = this.map.gamMap[index]
                if(this.map.gamMap[index] != mapTileTypes.walkable) break;
                xHorz += dx
                yHorz += dy
                horzDepth += dDepth;

                
                // this.canvas.beginPath();
                // this.canvas.arc(xHorz, yHorz, 5, 0, 2*3.14);
                // this.canvas.fill();
                // this.canvas.stroke();
            }

            // depth decision
            if (vertDepth < horzDepth){
                depth = vertDepth;
                yVert %= 1;
                texture = textureY;
            } else{
                depth = horzDepth;
                xHorz %= 1;
                texture = textureX;
            }

            // fisheye fix that makes the walls crawl
            // depth = Math.trunc(depth * Math.cos(this.angle - rayAngle));
            rays[i] = {x: ((this.center.x - this.mapOffset.x)  + depth * curCos), y: ((this.center.y - this.mapOffset.y)  + depth *  curSin)}

            wallHeight = Math.floor(window.innerHeight*30 / (depth + .00001))

            if(i == this.rayNum/2){
                this.midWallHeight = wallHeight
                this.midDepth = depth
                this.targetBlockIndex = index

            }

            texture = (texture == undefined) ? 8 : texture;

            // draw walls
            this.canvas.beginPath();
            let textureOffset = (vertDepth < horzDepth) ? rays[i].y : rays[i].x;
            textureOffset = Math.floor(textureOffset - Math.floor(textureOffset / this.map.tileWidth) * this.map.tileWidth);
            // this.canvas.fillText(`${i}`, rays[i].x, rays[i].y)
            
            this.canvas.drawImage(
                this.map.mapTextures[texture+1],                            // img
                textureOffset,                                      // src x offset
                0,                                                  // src y offset
                1/(window.innerWidth / this.rayNum),                                                // src img width
                64,                                                 // src img hieght
                i * window.innerWidth / this.rayNum,                // target x offset
                Math.trunc(window.innerHeight/2 - wallHeight/2),    // target y offset
                window.innerWidth / this.rayNum,                    // target width
                wallHeight                                          // target height
            );

            // if(this.targetBlockIndex == 160)
            // this.canvas.drawImage(
            //     huskImg,                            // img
            //     textureOffset + (64 * (i % 1)),                                      // src x offset
            //     0,                                                  // src y offset
            //     1/(window.innerWidth / this.rayNum),                // src img width
            //     64,                                                 // src img hieght
            //     i * window.innerWidth / this.rayNum - this.width,                // target x offset
            //     Math.trunc(window.innerHeight/2 - wallHeight/2),    // target y offset
            //     window.innerWidth / this.rayNum,                    // target width
            //     wallHeight   
            // );

            // if(i%64 == 0) this.canvas.fillText(`${i}`, i * window.innerWidth / this.rayNum, 100)
            rayAngle += this.stepAngle;
        }

    }

}


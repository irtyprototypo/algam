var canvasFG = document.getElementById("foreground");
var ctxFG = canvasFG.getContext('2d');

var debuging = true;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed, currentFps;
var gams = ['rpg', 'platformer', 'fps', 'idle', 'fishing', 'arcade/gamba', 'fighting', 'beat-em-up']
var husks = new Map();
var map, inputMode = gams[2];
var player;
var gamePaused = false;
const PLAY_ONLINE = true;
let mouseRotation = false, chatVisible = true, chatCloseTimer = 0;
var client = new Colyseus.Client(`${window.location.protocol.replace("http", "ws")}//${window.document.location.host.replace(/:.*/, '')}:${31337}`);
let room;
let inputField, chatOpen = false;
let mx = 0;
let chat = [];

ctxFG.strokeStyle = '#000';
ctxFG.font = "15px Arial";

async function init(frameRate){
    fpsInterval = 1000 / frameRate;
    then = Date.now();
    startTime = then;
    inputField = document.querySelector('#chatInput');

    map = new GameMap({canvas: ctxFG});
    player = new Player({
        canvas: ctxFG
        , username: `player ${Math.floor(Math.random() * 100)+1}`
        , map: map
        , position: {x: this.map.tileWidth, y: this.map.tileHeight, z: 0}
        , color: '#9f496e'
        , imgSrc: './assets/char/knight/Idle.png'
        , framesMax: 11
        , scale: 1
        , height: 50
        , width: 50
        , framesHold: 8
        , spriteName: 'knight'
        , port: 0
        , isOnline: false
    });


    if(PLAY_ONLINE)
        try{
            room = await client.joinOrCreate("Overworld", {username: player.username})
            player.room = room
            player.sessionId = room.sessionId;
            player.isOnline = true;

            room.onMessage('chat_message', m =>{
                chat.unshift(m)
            })
        
            room.onStateChange(s =>{
                if(s.mapName != map.mapName){
                    map.changeMap(s.mapName)
                    player.respawn()
                }
            })
            
            // room.onMessage('admin', m =>{
            //     console.log(m);
            // })

        } catch (e){ console.error(e); }

    console.log(`input mode: ${inputMode}`);
    updatePhysics(inputMode);


    animate();
}


function animate(){
    window.requestAnimationFrame(animate);
    
    now = Date.now();
    elapsed = now - then;
    if (!gamePaused && elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        // draw background
        canvasFG.width = window.innerWidth;
        canvasFG.height = window.innerHeight;
        ctxFG.fillStyle = '#808080'
        ctxFG.fillRect(0,0,canvasFG.width, canvasFG.height);

        if(player.isOnline && room.state.players.size-1 > husks.size)
            defineHusks();
       
        map.update();
        player.update();
        if(player.isOnline)
            updateHusks();
    
        if (debuging)
            drawDebugText();

        if(chatVisible && (now - chatCloseTimer < 10000))
            drawChat();

        
        if(!chatOpen || document.activeElement != inputField)
            switch(inputMode){
                case 'platformer':
                    this.pollPlatformerInputs();
                    
                    player.isGrounded = !(player.isFalling || player.isJumping);
                    player.isRunning = !(player.velocity.x == 0 || player.velocity.y == 0);
                    player.velocity.y = (player.velocity.y > player.velocity.terminal) ? player.velocity.terminal : player.velocity.y  
                    break;
                case 'fps':
                    this.pollFPSInputs();
                    
                    player.isGrounded = !(player.isFalling || player.isJumping);
                    player.isRunning = !(player.velocity.x == 0 || player.velocity.y == 0);
                    player.velocity.x = (player.velocity.x > player.velocity.terminal) ? player.velocity.terminal : player.velocity.x  
                    player.velocity.y = (player.velocity.y > player.velocity.terminal) ? player.velocity.terminal : player.velocity.y  
                    break;
                default:
                    this.pollRPGInputs();
                    break;
            }


        map.viewport.screen = [canvasFG.width, canvasFG.height];
    }

    currentFps = Math.round(1000 / ((now - startTime) / ++frameCount) * 100) / 100;

}


function defineHusks(){

    if(player.isOnline)
        room.state.players.forEach( p =>{
            if(p.username != player.username){
                husks.set(p.sessionId, new Husk({
                    canvas: ctxFG
                    , username: p.username
                    , map: map
                    , position: {x: p.x + player.mapOffset.x, y: p.y + player.mapOffset.y, z: 0}
                    , color: '#9f496e'
                    , imgSrc: './assets/char/knight/idle.png'
                    , framesMax: 11
                    , scale: 1
                    , framesHold: 8
                    , spriteName: 'knight'
                    , sessionId: p.sessionId
                }));

            }
    });
}

function updateHusks(){
    if(player.isOnline)
        room.state.players.forEach( p =>{
            if(p.username != player.username && husks.get(p.sessionId)){
                husks.get(p.sessionId).updateData({
                    x: p.x + player.mapOffset.x
                    , y: p.y + player.mapOffset.y
                    , angle: p.angle
                    , state: p.actionState
                });
            
                let dx = p.x - player.position.x
                let dy = p.y - player.position.y
                let theta = Math.atan2(dy, dx)
                let delta = theta - player.angle
    
                // removing one blind spot adds another.
                if ((dx > 0 && player.angle > Math.PI) || (dx < 0 && dy < 0))
                    delta += Math.PI*2
                    
                let delta_rays = delta / (player.fov / player.rayNum)
                let screen_x = Math.trunc((Math.floor(player.rayNum/2) + delta_rays) * (window.innerWidth / player.rayNum))
                let dist = Math.trunc(Math.hypot(dx, dy) - player.width/2)
                let norm_dist = Math.trunc(dist * Math.cos(delta))
    
                let d2h = norm_dist
                let d2w = player.midDepth
                let floorPos = (window.innerHeight/2 + player.midWallHeight/2)
                // let huskY = 1/(d2w)

                // let uhhuh = (window.innerHeight/2 + player.midWallHeight/2) + (norm_dist/window.innerHeight)
                // console.log(uhhuh);
                // rough projection
                if(inputMode == 'fps'){
                    ctxFG.fillStyle = '#40D61A';
                    ctxFG.beginPath();
                    ctxFG.arc(screen_x, floorPos, 10, 0, 6.48)
                    ctxFG.fill();
                    ctxFG.stroke();
                    player.husk.screen_x = screen_x;
                    player.husk.norm_dist = norm_dist;
                } else {
                    husks.get(p.sessionId).update();
                    ctxFG.fillText(`${p.sessionId}`, p.x + player.mapOffset.x - player.width/4, p.y + player.mapOffset.y - player.height/2)
                }
            }
        });
}



function showChatField(){
    chatVisible = true;
    chatOpen = true;
    inputField.style.opacity = 1;

    inputField.focus();
    inputField.value = "";

    inputField.style.left = `${10}px`;
    inputField.style.top = `${235}px`;
}

function hideChatField(){
    chatCloseTimer = Date.now();
    chatOpen = false;
    inputField.style.opacity = 0;
    inputField.value ="";
}

function sendMessage(event) {
    event.preventDefault();
    let inputStr = inputField.value

    if(inputStr)
        room.send('chat_message', {
            pid: player.sessionId,
            str: `${inputStr}`
        });

    inputField.value ="";
    hideChatField();
}

function drawChat(){
    if(chat)
        chat.forEach( (m, index) => {

            let w = ctxFG.measureText(m).width;
            ctxFG.fillStyle = '#423a38';
            ctxFG.fillRect(5, 205 - (index*25), w+10, 25)

            ctxFG.fillStyle = '#fff';
            ctxFG.fillText(`${m}`, 10, 225 - (index*25))

        });
}

function updatePhysics(type){
    console.log(`Physics: ${inputMode}`);
    switch(type){
        case 'platformer':
            player.setPlatformerPhysics();
            map.genre = 'platformer';
            document.exitPointerLock();
            break;
        case 'fps':
            map.genre = 'fps';
            player.setFPSPhysics();
            canvasFG.requestPointerLock();
            break;
        default:
            map.genre = 'rpg';
            player.setRPGPhysics();
            document.exitPointerLock();
            break;
    }
}

function pollRPGInputs(){
    if(!player.isAttacking){
        if(!player.isRunning && player.isGrounded)
            player.performRPGAction('idle')

        if(inputs.right.pressed && !inputs.left.pressed)
                player.performRPGAction('run_right')

        if(inputs.left.pressed && !inputs.right.pressed)
                player.performRPGAction('run_left')

        if(inputs.up.pressed && !inputs.down.pressed)
                player.performRPGAction('run_up')

        if(inputs.down.pressed && !inputs.up.pressed)
                player.performRPGAction('run_down')
    }
}


function pollPlatformerInputs(){
    if(!player.isAttacking && player.isGrounded){
        if(inputs.right.pressed && !(inputs.left.pressed))
            player.performPlatformingAction('run_right')

        else if(inputs.left.pressed && !(inputs.right.pressed))
            player.performPlatformingAction('run_left')

        else if(!player.isRunning && player.isGrounded)
            player.performPlatformingAction('idle')

    }
    
    if(player.isGrounded && (inputs.jump.pressed || inputs.up.pressed))
        player.performPlatformingAction('jump')

    if(inputs.attack.pressed)
        player.performPlatformingAction('attack')
    if(inputs.block.pressed || inputs.down.pressed)
        player.performPlatformingAction('death')

    // else if(!player.isAttacking && player.isFalling)
    //     player.performPlatformingAction('fall')


}


function pollFPSInputs(){
        player.performFPSAction('idle')

        if(inputs.rotCW.pressed && !inputs.rotCCW.pressed)
            player.performFPSAction('rot_cw')

        if(inputs.rotCCW.pressed && !inputs.rotCW.pressed)
            player.performFPSAction('rot_ccw')

            
        if(inputs.right.pressed && !(inputs.up.pressed || inputs.down.pressed || inputs.left.pressed))
                player.performFPSAction('run_right')
        if(inputs.left.pressed && !(inputs.up.pressed || inputs.down.pressed || inputs.left.right))
                player.performFPSAction('run_left')
        if(inputs.up.pressed && !(inputs.left.pressed || inputs.right.pressed || inputs.down.pressed))
                player.performFPSAction('run_forward')
        if(inputs.down.pressed && !(inputs.left.pressed || inputs.right.pressed || inputs.up.pressed))
                player.performFPSAction('run_back')
        
        if(inputs.right.pressed && inputs.up.pressed && !inputs.left.pressed){
            player.performFPSAction('run_right')
            player.performFPSAction('run_forward')
        }
        
        if(inputs.right.pressed && inputs.down.pressed && !inputs.left.pressed){
            player.performFPSAction('run_right')
            player.performFPSAction('run_back')
        }
        if(inputs.left.pressed && inputs.up.pressed && !inputs.right.pressed){
            player.performFPSAction('run_left')
            player.performFPSAction('run_forward')
        }
        if(inputs.left.pressed && inputs.down.pressed && !inputs.right.pressed){
            player.performFPSAction('run_left')
            player.performFPSAction('run_back')
        }
}

function confirmCapture(){
    if(inputMode == 'fps')
        canvasFG.requestPointerLock();
}
// rotation breaks on alt-tab
window.addEventListener('mousemove', e =>{
    if(mouseRotation && document.pointerLockElement == canvasFG && inputMode == 'fps'){
        if(e.movementX > 3 ){
            inputs.rotCW.pressed = true;
            inputs.rotCCW.pressed = false;
            player.lastInput = inputs.rotCW;
            player.performFPSAction('rot_cw')
        } else if (e.movementX < -3 ) {
            inputs.rotCCW.pressed = true;
            inputs.rotCW.pressed = false;
            player.lastInput = inputs.rotCCW;
            player.performFPSAction('rot_ccw')
        } else {
            player.performFPSAction('idle')
            inputs.rotCW.pressed = false;
            inputs.rotCCW.pressed = false;
        }
    }
});


window.addEventListener('keydown', e =>{
    // console.log(e.code)
    switch(e.code){
        case 'Escape':
            this.hideChatField();
            break;
        case 'KeyD':
            inputs.right.pressed = true;
            player.lastInput = inputs.right;
            break;
        case 'KeyA':
            inputs.left.pressed = true;
            player.lastInput = inputs.left;
            break;
        case 'KeyW':
        case 'NumpadAdd':
            inputs.up.pressed = true;
            player.lastInput = inputs.up;
            break;
        case 'KeyS':
            inputs.down.pressed = true;
            player.lastInput = inputs.down;
            break;
        case 'Space':
        case 'Numpad0':
            inputs.attack.pressed = true;
            player.lastInput = inputs.attack;
            break;
        case 'Numpad8':
            inputs.jump.pressed = true;
            player.lastInput = inputs.jump;
            break;
        case 'Numpad4':
            inputs.block.pressed = true;
            player.lastInput = inputs.block;
            break;
        case 'KeyQ':
        case 'ArrowLeft':
            inputs.rotCCW.pressed = true;
            player.lastInput = inputs.rotCCW;
            break;
        case 'KeyE':
        case 'ArrowRight':
            inputs.rotCW.pressed = true;
            player.lastInput = inputs.rotCW;
            break;
        case 'Backquote':
            inputMode = gams[(gams.indexOf(inputMode)+1) % 3];
            updatePhysics(inputMode);
            break;
        default:
            break;
    }
});

window.addEventListener('keyup', e =>{
    switch(e.code){
        case 'KeyT':
            if(player.isOnline && !chatOpen)
                this.showChatField();
            else if (document.activeElement != inputField)
                this.hideChatField();
            break;
        // case 'KeyH':
        //     if(player.isOnline)
        //         room.state.players.forEach( p =>{
        //             console.log(p.username)
        //         });
            // break;
        case 'KeyR':
            mouseRotation = (mouseRotation) ? false : true;
            break;
        case 'KeyD':
            inputs.right.pressed = false;
            break;
        case 'KeyA':
            inputs.left.pressed = false;
            break;
        case 'KeyW':
        case 'NumpadAdd':
            inputs.up.pressed = false;
            break;
        case 'KeyS':
            inputs.down.pressed = false;
            break;
        case 'Space':
        case 'Numpad0':
            inputs.attack.pressed = false;
            break;
        case 'Numpad8':
            inputs.jump.pressed = false;
            break;
        case 'Numpad4':
            inputs.block.pressed = false;
            break;
        case 'KeyQ':
        case 'ArrowLeft':
            inputs.rotCCW.pressed = false;
            break;
        case 'KeyE':
        case 'ArrowRight':
            inputs.rotCW.pressed = false;
            break;
        case 'KeyM':
            if(!chatOpen){
                room.send('admin', {
                    pid: player.sessionId,
                    command: 'change_map'
                });
            }
            break;
        default:
            break;
    }
});


const inputs = {
    right: {
        name: 'right',
        pressed: false
    },
    left: {
        name: 'left',
        pressed: false
    },
    up: {
        name: 'up',
        pressed: false
    },
    down: {
        name: 'down',
        pressed: false
    },
    attack: {
        name: 'attack',
        pressed: false
    },
    jump: {
        name: 'jump',
        pressed: false
    },
    block: {
        name: 'block',
        pressed: false
    },
    rotCCW: {
        name: 'rotCCW',
        pressed: false
    },
    rotCW: {
        name: 'rotCW',
        pressed: false
    },
}

function drawDebugText(){

    ctxFG.font = "20px Arial";
    ctxFG.fillStyle = (player.attackLanded) ? 'red' : '#1e1e1e';
    deb = [
        [currentFps, player.lastAction]
        , ["cen", [player.center.x, player.center.y]]
        , ["cos, sin", [Math.trunc(Math.cos(player.angle) * 100), Math.trunc(Math.sin(player.angle)*100)]]
        // , ["1ray", [Math.cos(player.angle) - player.fov/2 + .00001]]
        // , ["mid", [Math.cos(player.angle) - player.fov + 2*3.14 + .00001]]
        // , ["e", [player.ecb.north, player.ecb.east, player.ecb.south, player.ecb.west]]
        , ["pos", [player.position.x, player.position.y]]
        , ["vel", [player.velocity.x, player.velocity.y]]
        // , ["wh", [player.midWallHeight]]
        , ["i", [player.targetBlockIndex]]
        // , ["s_x", [player.husk.screen_x]]
        // , ["dn", [player.husk.norm_dist]]
        // , ["r", [player.rays[0].x, player.rays[0].y]]
        // , ["temp", [player.temp]]
        // , ["off", [player.mapOffset.x, player.mapOffset.y]]
        // , ["--", '--']
        // , ["tile ⬇", map.gamMap[player.tileIndex+map.mapWidth]]
        , ["c,r,i,t", [player.tileIndex % map.mapWidth, Math.floor(player.tileIndex / map.mapHeight), player.tileIndex, player.tileType]]
        , ["⬆⬇", [inputs.up.pressed, inputs.down.pressed]]
        , ["⬅➡", [inputs.left.pressed, inputs.right.pressed]]
        , ["↪↩", [inputs.rotCCW.pressed, inputs.rotCW.pressed]]
        , ["👊", inputs.attack.pressed], ["🛡", inputs.block.pressed], ["🚀", inputs.jump.pressed]
    ]

    for (i=0;i < deb.length;i++){ ctxFG.fillText(`${deb[i][0]}: ${deb[i][1]}`, window.innerWidth - 150, `${25+(25*i)}`); }
}

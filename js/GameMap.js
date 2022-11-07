
class GameMap{
    constructor({canvas}){
        this.canvas = canvas
        this.mapName = 'overworld_0'
        this.gamMap = worlds.get(this.mapName)
        this.tileWidth = 50
        this.tileHeight = this.tileWidth
        this.mapWidth = 80
        this.mapHeight = this.mapWidth
        this.viewport = {
            screen: [0,0],
            startTile: [0,0],
            endTile: [0,0],
            offset: [0,0],
            update: (px, py) => {
                this.viewport.offset[0] = Math.floor((this.viewport.screen[0]/2)-px);
                this.viewport.offset[1] = Math.floor((this.viewport.screen[1]/2)-py);
                
                var tile = [
                    Math.floor(px/this.tileWidth),
                    Math.floor(py/this.tileHeight),
                ];
        
                this.viewport.startTile[0] = tile[0]-1 - Math.ceil((this.viewport.screen[0]/2)/this.tileWidth);
                this.viewport.startTile[1] = tile[1]-1 - Math.ceil((this.viewport.screen[1]/2)/this.tileHeight);
            
                if(this.viewport.startTile[0] < 0) this.viewport.startTile[0] = 0;
                if(this.viewport.startTile[1] < 0) this.viewport.startTile[1] = 0;
            
                this.viewport.endTile[0] = tile[0]+1 + Math.ceil((this.viewport.screen[0]/2)/this.tileWidth);
                this.viewport.endTile[1] = tile[1]+1 + Math.ceil((this.viewport.screen[1]/2)/this.tileHeight);
            
                if(this.viewport.endTile[0] >= this.mapWidth) this.viewport.endTile[0] = this.mapWidth-1;
                if(this.viewport.endTile[1] >= this.mapHeight) this.viewport.endTile[1] = this.mapHeight-1;
        
            }            
        }
        this.genre = 'rpg';
        this.mapTextures = []
        this.loadMapTextures()
    }
    
    draw(){

        // stationary map
        if(this.genre == 'fps'){
            for(var y=0; y<this.mapHeight; y++){
                for(var x=0; x<this.mapWidth; x++){
                    switch(this.gamMap[((y*this.mapWidth)+x)]){
                        case 3:
                            this.canvas.fillStyle = '#1e1e1e';
                            break;
                        case 2:
                            this.canvas.fillStyle = '#1e3d58';
                            break;
                        case 1:
                            this.canvas.fillStyle = '#43b0f1';
                            break;
                        default:
                            this.canvas.fillStyle = '#057dcd';
                            break;
                    }
                    this.canvas.fillRect(x*this.tileWidth, y*this.tileHeight, this.tileWidth, this.tileHeight);
                }
            }
            // this.canvas.drawImage(this.mapTextures[0], window.innerWidth, window.innerHeight);

        } else {
            for(var y=this.viewport.startTile[1]; y<this.viewport.endTile[1]+1; y++){
                for(var x=this.viewport.startTile[0]; x<this.viewport.endTile[0]+1; x++){
                    switch(this.gamMap[((y*this.mapWidth)+x)]){
                        case 3:
                            this.canvas.fillStyle = '#1e1e1e';
                            break;
                        case 2:
                            this.canvas.fillStyle = '#1e3d58';
                            break;
                        case 1:
                            this.canvas.fillStyle = '#43b0f1';
                            break;
                        default:
                            this.canvas.fillStyle = '#057dcd';
                            break;
                    }
    
                    //paints cell
                    // players.forEach(p=>{
                    //     if (x == p.tileIndex % this.mapWidth && y == Math.floor(p.tileIndex / this.mapHeight))
                    //         this.canvas.fillStyle = 'white';
                    // });
    
                    this.canvas.fillRect(this.viewport.offset[0] + x*this.tileWidth, this.viewport.offset[1] + y*this.tileHeight, this.tileWidth, this.tileHeight);
                }
            }
        }

    }


    update(){
        this.draw();
    }
    
    loadMapTextures(){
        for (var filename = 0; filename < 13; filename++) {
            var image = document.createElement('img');
            image.src = '../assets/fps/' + filename + '.png';
            this.mapTextures.push(image);
        }
    }

    changeMap(name){
        this.mapName = name
        this.gamMap = worlds.get(this.mapName)
        this.mapWidth = (this.gamMap.length/80 == 80) ? 80 : 40
        this.mapHeight = this.mapWidth
    }

    crFromXY([x, y]){
        return [Math.floor(x / this.tileWidth), Math.floor(y / this.tileHeight)];
    }

}




const worlds = new Map();
worlds.set('overworld_0', overworld_0)
worlds.set('overworld_1', overworld_1)
worlds.set('overworld_2', overworld_2)

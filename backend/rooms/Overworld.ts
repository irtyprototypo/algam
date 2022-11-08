import { Room, Client } from "colyseus";
import { Player } from './schema/Player';
import { RoomState } from './schema/RoomState';


export class Overworld extends Room<RoomState> {
  // Colyseus will invoke when creating the room instance
  onCreate(options: any) {
    // initialize empty room state
    console.log(`${this.roomId} 🌎 has been created by ${options.username} with options:`, options);
    this.setState(new RoomState());

    this.onMessage("chat_message", (client, message) => {
      console.log(`${this.roomId} 🌎 | ${client.sessionId}: ${message.str.toString()}`);
    
      this.broadcast("chat_message", `${this.state.players.get(client.sessionId).username}: ${message.str.toString()}`);

      // this.broadcast("messages", `${client.sessionId} ${message}`);
      // this.state.updateChat(message);
    });


    this.onMessage("admin", (client, message) => {
      switch(message.command){
        case 'change_map':
          // change later. currently cycling
          let name = this.state.mapName.split('_')[0]
          let num = (Number(this.state.mapName.split('_')[1])+1)%3
          this.state.setMapName(`${name}_${num}`);

          console.log(`${this.roomId} 🌎 | ${this.state.players.get(client.sessionId).username}: has updated the map to ${name}_${num}`);
          this.broadcast("chat", `${this.state.players.get(client.sessionId).username} updated to map to ${name}_${num}`);
          break;
        default:
          console.log(`${message.command}`);
          break;
        }
      });



    this.onMessage("player", (client, message) => {
      let curPlayer = this.state.players.get(client.sessionId);
      if(message.x != curPlayer.x || message.y != curPlayer.y)
        curPlayer.setPosition(message.x, message.y)

      if(message.actionState != curPlayer.actionState) 
        curPlayer.setActionState(message.state)

      if(message.angle != curPlayer.angle) 
        curPlayer.setAngle(message.angle)
    

      // switch(message.command){
      //   case 'change_map':
      //     this.state.players.get(client.sessionId).updatePosition()
      //     // change later. currently cycling
      //     let name = this.state.mapName.split('_')[0]
      //     let num = (Number(this.state.mapName.split('_')[1])+1)%3
      //     this.state.setMapName(`${name}_${num}`);
  
      //     console.log(`${this.roomId} 🌎 | ${this.state.players.get(client.sessionId).username}: has updated the map to ${name}_${num}`);
      //     this.broadcast("chat", `${} updated to map to ${name}_${num}`);
      //     break;
      //   default:
      //     console.log(`${message.command}`);
      //     break;
      //   }
      });

  }

  // Called every time a client joins
  onJoin(client: Client, options: any) {
    // this.state.players.set(client.sessionId, new Player());
    
  }
  
  async onAuth (client, options, request) {
    
    let create = true;
    for(let key in this.state.players){
        const player: Player = this.state.players[key];
        if(player.username === options.username)
            create = false;
    }
    
    if(create){
      this.state.createPlayer(client.sessionId, options.username);
      console.log(`${this.roomId} 🌎 | ${this.state.players.get(client.sessionId).username} has been added`);
    }
    
      return true;
  }

}
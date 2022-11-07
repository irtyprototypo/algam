import { Schema, MapSchema, type, ArraySchema} from "@colyseus/schema";
import { Player } from './Player';

// Our custom game state, an ArraySchema of type Player only at the moment
export class RoomState extends Schema {
  @type("number") totalGameCount = 0;
  @type("number") gameCount = 0;
  @type("number") setCount = 0;
  @type("string") mapName = 'overworld_0';
  @type({ map: Player }) players = new MapSchema<Player>();
  
  createPlayer (id: string, name: string) {
    this.players[id] = new Player();
    this.players[id].ready = true;
    this.players[id].username = name;
    this.players[id].sessionId = id;
  }

  removePlayer (id: string) { delete this.players[id]; }
  setPlayerChoice(id: string, choice: string){ this.players[id].choice = choice; }
  setPlayerScore(id: string, score: number){ this.players[id].score = score; }
  setPlayerNotReady(id: string){ this.players[id].ready = false; }
  setPlayerReady(id: string){ this.players[id].ready = true; }
  setMapName(name: string){ this.mapName = name; }
  

}

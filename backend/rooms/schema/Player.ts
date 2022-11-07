import { Schema, type, ArraySchema} from "@colyseus/schema";

// An abstract player object, demonstrating a potential 2D world position
export class Player extends Schema {
  @type("boolean") ready = false;
  @type("string") username = undefined;
  @type("string") sessionId = undefined;
  @type("string") choice = undefined;
  @type(['string']) hist = new ArraySchema<String>();
  @type("number") score = 0;
  @type("number") x = 50;
  @type("number") y = 50;
  @type("number") angle = 0;
  @type("string") actionState = 'idle';

  setPosition(x: number, y: number){ this.x = x; this.y = y; }
  setActionState(as: string){ this.actionState = as; }
  setAngle(ang: number){ this.angle = ang; }
  
}
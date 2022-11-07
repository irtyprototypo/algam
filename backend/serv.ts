import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
const port = Number(process.env.port) || 31337;
import { Overworld } from "./rooms/Overworld";


const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app)
});

gameServer.listen(port);
console.log(`[GamServer] Listening on Port: ${port}`)

// 🌎
gameServer.define("Overworld", Overworld, {
    gameMode: 'rpg'
    , maxPlayers: 6
})
  
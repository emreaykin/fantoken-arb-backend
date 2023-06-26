import { WebSocketServer } from "ws";
import { dataStore } from "../dataStore.js";
export const startWebsocket = async (server) => {
  try {
    const wss = new WebSocketServer({ server });

    wss.on("connection", async (ws) => {
      console.log("Websocket  Bağlandı");
      setInterval(() => {
        ws.send(JSON.stringify(dataStore));
      }, 1000);
      ws.on("message", async (message) => {});

      ws.on("close", async () => {});
    });
  } catch (error) {
    
  }
};

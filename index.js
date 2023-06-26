import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";
import { startWebsocket } from "./websocket/websocket.js";
import { updateFromMongoDB } from "./dataStore.js";
import { Gate } from "./gateio/gateio.js";
import { Huobi } from "./huobi/huobi.js";
import { Binance } from "./binance/binance.js";
import { Mexc } from "./mexc/mexc.js";
import { createTokenList } from "./fantokenList.js";
import { Paribu } from "./paribu/paribu.js";

dotenv.config();
const { PORT } = process.env;
const app = express();

app.use(bodyParser.json({ limit: "2mb" }));
app.use(express.json());
app.use(cors());
const server = app.listen(PORT, async () => {
  console.log(`Uygulama http://localhost:${PORT} çalışıyor `);
  startWebsocket(server);
  const pairs = await createTokenList();

  updateFromMongoDB(pairs);
  Paribu();
  Gate(pairs);
  Huobi(pairs);
  Binance(pairs);
  Mexc(pairs);
});

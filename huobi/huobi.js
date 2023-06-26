import WebSocket from "ws";
import { updateBuyData, updateSellData } from "../dataStore.js";
import pako from "pako";

export const Huobi = async (tokens) => {
  try {
    const huobiWebsocket = new WebSocket("wss://api-aws.huobi.pro/ws");

    const tokenList = tokens.filter((token) => token.exchangeOne === "Huobi" ||token.exchangeTwo === "Huobi");

    huobiWebsocket.on("open", () => {
      console.log("Huobi websocket bağlandı.");

      tokenList.forEach((token) => {
        const symbol = token.exchangeOneSymbol;

        huobiWebsocket.send(
          JSON.stringify({
            sub: `market.${symbol.toLowerCase()}usdt.depth.step1`,
            id: `${symbol}usdt`,
          })
        );
      });
    });

    huobiWebsocket.on("message", async (data) => {
      let text = pako.inflate(data, {
        to: "string",
      });
      let msg = JSON.parse(text);

      if (msg.ping) {
        huobiWebsocket.send(
          JSON.stringify({
            pong: msg.ping,
          })
        );
      } else if (msg.tick) {
        const coin = msg.ch.split(".")[1].split("usdt")[0].toUpperCase();

        if (tokenList.some((token) => token.exchangeOneSymbol === coin)) {
          // coin'in tokenList'te olduğunu kontrol ediyoruz.
          let buyPrice = 0,
            buyVolume = 0,
            sellPrice = 0,
            sellVolume = 0;

          let firstBuyPrice = Number(msg.tick.asks[0][0]);
          let firstBuyVolume = Number(msg.tick.asks[0][1]);
          buyPrice = firstBuyPrice;
          buyVolume = firstBuyVolume;

          let firstSellPrice = Number(msg.tick.bids[0][0]);
          let firstSellVolume = Number(msg.tick.bids[0][1]);
          sellPrice = firstSellPrice;
          sellVolume = firstSellVolume;

          for (let i = 1; i < 5; i++) {
            let currentBuyPrice = Number(msg.tick.asks[i][0]);
            if (
              ((currentBuyPrice - firstBuyPrice) / firstBuyPrice) * 100 <=
              2
            ) {
              buyPrice = currentBuyPrice;
              buyVolume += Number(msg.tick.asks[i][1]);
            } else {
              break;
            }
          }

          for (let i = 1; i < 5; i++) {
            let currentSellPrice = Number(msg.tick.bids[i][0]);
            if (
              ((currentSellPrice - firstSellPrice) / firstSellPrice) * 100 <=
              2
            ) {
              sellPrice = currentSellPrice;
              sellVolume += Number(msg.tick.bids[i][1]);
            } else {
              break;
            }
          }

          updateBuyData("Huobi", coin, buyPrice, buyVolume.toFixed(2));
          updateSellData("Huobi", coin, sellPrice, sellVolume.toFixed(2));
        }
      }
    });
    huobiWebsocket.on("close", () => {
      console.log("close");
    });
    huobiWebsocket.on("error", (err) => {
      console.log("error", err);
    });
  } catch (error) {
    console.error("Hata:", error);
  }
};

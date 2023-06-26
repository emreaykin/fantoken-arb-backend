import { updateBuyData, updateSellData } from "../dataStore.js";
import WebSocket from "ws";
export const Mexc = async (tokens) => {
  try {
    const tokenList = tokens.filter(
      (token) =>
        token.exchangeOne === "Mexc" ||
        token.exchangeTwo === "Mexc" 
      
    );

    let tokenChunks = [];
    const chunkSize = 30;
    for (let i = 0; i < tokenList.length; i += chunkSize) {
      tokenChunks.push(tokenList.slice(i, i + chunkSize));
    }

    tokenChunks.forEach((chunk, index) => {
      const mexcWebsocket = new WebSocket("wss://wbs.mexc.com/ws");

      mexcWebsocket.on("open", () => {
        console.log(`Mexc websocket ${index + 1} bağlandı.`);

        chunk.forEach((token) => {
          const symbol = token.exchangeOneSymbol;

          let subscribeMessage = {
            method: "SUBSCRIPTION",
            params: ["spot@public.limit.depth.v3.api@" + symbol + "USDT@5"],
          };

          mexcWebsocket.send(JSON.stringify(subscribeMessage));
        });
      });
      const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
      mexcWebsocket.on("message", async (data) => {
        let parsedData = JSON.parse(data.toString());

        // Check if it's a PONG message
        if (parsedData.msg === "PONG") {
          console.log("Connection is still alive");
        }

        // Your existing code
        if (parsedData.s) {
          const coin = parsedData.s.split("USDT")[0];
          if (chunk.some((token) => token.exchangeOneSymbol === coin)) {
            let buyPrice = 0,
              buyVolume = 0,
              sellPrice = 0,
              sellVolume = 0;
            let firstBuyPrice = Number(parsedData.d.asks[0].p);
            let firstBuyVolume = Number(parsedData.d.asks[0].v);
            buyPrice = firstBuyPrice;
            buyVolume = firstBuyVolume;
            let firstSellPrice = Number(parsedData.d.bids[0].p);
            let firstSellVolume = Number(parsedData.d.bids[0].v);
            sellPrice = firstSellPrice;
            sellVolume = firstSellVolume;
            for (let i = 1; i < parsedData.d.asks.length; i++) {
              let currentBuyPrice = Number(parsedData.d.asks[i].p);
              if (
                ((currentBuyPrice - firstBuyPrice) / firstBuyPrice) * 100 <=
                2
              ) {
                buyPrice = Number(parsedData.d.asks[i].p);

                buyVolume += Number(parsedData.d.asks[i].v);
              } else {
                break;
              }
            }
            for (let i = 1; i < parsedData.d.bids.length; i++) {
              let currentSellPrice = Number(parsedData.d.bids[i].p);
              if (
                ((currentSellPrice - firstSellPrice) / firstSellPrice) * 100 <=
                2
              ) {
                sellPrice = Number(parsedData.d.bids[i].p);

                sellVolume += Number(parsedData.d.bids[i].v);
              } else {
                break;
              }
            }

            updateBuyData("Mexc", coin, buyPrice, buyVolume.toFixed(2));
            updateSellData("Mexc", coin, sellPrice, sellVolume.toFixed(2));
          }
        }
      });
      // Send a PING message every 5 minutes
      setInterval(() => {
        mexcWebsocket.send(JSON.stringify({ method: "PING" }));
      }, PING_INTERVAL);
      mexcWebsocket.on("close", () => {
        console.log(`Mexc websocket ${index + 1} kapandı.`);
      });

      mexcWebsocket.on("error", (err) => {
        console.log(`Mexc websocket ${index + 1} hata:`, err);
      });
    });
  } catch (error) {
    console.error("Hata:", error);
  }
};

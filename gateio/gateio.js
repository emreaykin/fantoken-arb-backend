import WebSocket from "ws";
import { updateBuyData, updateSellData } from "../dataStore.js";

export const Gate = async (tokens) => {
  try {
    const gateWebSocket = new WebSocket("wss://api.gateio.ws/ws/v4/");
   
    const tokenList = tokens.filter(
      (token) => token.exchangeOne === "Gate" ||token.exchangeTwo === "Gate"
    );

    gateWebSocket.on("open", () => {
      console.log("Gate websocket bağlandı.");
     
      tokenList.forEach((token) => {
        const symbol = token.exchangeOneSymbol;

        gateWebSocket.send(
          JSON.stringify({
            time: 1,
            channel: "spot.order_book",
            event: "subscribe",
            payload: [`${symbol}_USDT`, "5", "100ms"],
          })
        );
      });
    });

    gateWebSocket.on("message", (data) => {
      const stringData = data.toString();
      const message = JSON.parse(stringData); // Buffer verisini dizeye dönüştürme

      if (message.event === "update") {
        const coin = message.result.s.split("_")[0];

        if (tokenList.some((token) => token.exchangeOneSymbol === coin)) {
          let buyPrice = 0,
            buyVolume = 0,
            sellPrice = 0,
            sellVolume = 0;

          let firstBuyPrice = Number(message.result.asks[0][0]);
          let firstBuyVolume = Number(message.result.asks[0][1]);
          buyPrice = firstBuyPrice;
          buyVolume = firstBuyVolume;

          let firstSellPrice = Number(message.result.bids[0][0]);
          let firstSellVolume = Number(message.result.bids[0][1]);
          sellPrice = firstSellPrice;
          sellVolume = firstSellVolume;

          for (let i = 1; i < message.result.asks.length; i++) {
            let currentBuyPrice = Number(message.result.asks[i][0]);
            if (
              ((currentBuyPrice - firstBuyPrice) / firstBuyPrice) * 100 <=
              2
            ) {
              buyPrice = Number(message.result.asks[i][0]);
              buyVolume += Number(message.result.asks[i][1]);
            } else {
              break;
            }
          }

          for (let i = 1; i < message.result.bids.length; i++) {
            let currentSellPrice = Number(message.result.bids[i][0]);
            if (
              ((currentSellPrice - firstSellPrice) / firstSellPrice) * 100 <=
              2
            ) {
              sellPrice = Number(message.result.bids[i][0]);
              sellVolume += Number(message.result.bids[i][1]);
            } else {
              break;
            }
          }
         
          updateBuyData("Gate", coin, buyPrice, buyVolume.toFixed(2));
          updateSellData("Gate", coin, sellPrice, sellVolume.toFixed(2));
        }
      }
    });

    gateWebSocket.onerror = (error) => {
      console.log("WebSocket error: ", error);
    };
  } catch (error) {
    console.error("Hata:", error);
  }
};

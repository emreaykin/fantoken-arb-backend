import axios from "axios";
import { updateBuyData, updateSellData } from "../dataStore.js";

export const Binance = async (tokens) => {
  try {
    setInterval(() => {
      fetchData(tokens);
    }, 5000);
  } catch (error) {
    console.error("Hata:", error);
  }
};

const fetchData = (tokens) => {
  tokens.forEach(async (token) => {
    try {
      if (
        token.exchangeOne === "Binance" ||
        token.exchangeTwo === "Binance" 
        
      ) {
        const symbol = token.exchangeOneSymbol;
        const exceptions = ["SRM", "FIDA"];
        const pairSymbol = exceptions.includes(symbol) ? "busd" : "usdt";
        const res = await axios.get(
          `https://api.binance.com/api/v3/depth?symbol=${symbol}${pairSymbol.toUpperCase()}&limit=5`
        );
        let buyPrice = 0,
          buyVolume = 0,
          sellPrice = 0,
          sellVolume = 0;
  
        let firstBuyPrice = Number(res.data.asks[0][0]);
        let firstBuyVolume = Number(res.data.asks[0][1]);
        buyPrice = firstBuyPrice;
        buyVolume = firstBuyVolume;
  
        let firstSellPrice = Number(res.data.bids[0][0]);
        let firstSellVolume = Number(res.data.bids[0][1]);
        sellPrice = firstSellPrice;
        sellVolume = firstSellVolume;
  
        for (let i = 1; i < res.data.asks.length; i++) {
          let currentBuyPrice = Number(res.data.asks[i][0]);
          if (((currentBuyPrice - firstBuyPrice) / firstBuyPrice) * 100 <= 2) {
            buyPrice = currentBuyPrice;
            buyVolume += Number(res.data.asks[i][1]);
          } else {
            break;
          }
        }
  
        for (let i = 1; i < res.data.bids.length; i++) {
          let currentSellPrice = Number(res.data.bids[i][0]);
          if (((currentSellPrice - firstSellPrice) / firstSellPrice) * 100 <= 2) {
            sellPrice = currentSellPrice;
            sellVolume += Number(res.data.bids[i][1]);
          } else {
            break;
          }
        }
  
        
        updateBuyData("Binance", symbol, buyPrice, buyVolume.toFixed(2));
        updateSellData("Binance", symbol, sellPrice, sellVolume.toFixed(2));
      }
    } catch (error) {
      console.error("Hata:", error);
    }
  });
};

import axios from "axios";
import { updateBuyData, updateSellData } from "../dataStore.js";

let x = 0;
const USDT = "https://web.paribu.com/market/usdt_tl/orderbook";

const getUSDT = async () => {
  const res = await axios.get(USDT);

  const sellOrders = res.data.payload.sell;
  const firstPriceKey = Object.keys(sellOrders)[0];

  x = firstPriceKey;
};

const convertDöviz = (x, y) => {
  let result = Number(y) / Number(x);
  return result.toFixed(4);
};
let paribuTokens = [
  "ATM",
  "JUV",
  "NAP",
  "ASR",
  "CITY",
  "BAR",
  "PSG",
  "FB",
  "INTER",
  "GAL",
  "SEVILLA",
  "ACM",
  "SAUBER",
  "VCF",
  "ARG",
  "GOZ",
  "ASM",
  "AFC",
  "POR",
  "ASTON",
  "TRA",
  "AVL",
];
export const Paribu = async () => {
  try {
    setInterval(() => {
      getUSDT().then(() => {
        fetchData(paribuTokens);
      });
    }, 10000);
  } catch (error) {
    console.error("Hata:", error);
  }
};

const fetchData = (tokens) => {
  tokens.forEach(async (token) => {
    try {
       

      const res = await axios.get(
        `https://web.paribu.com/market/${token.toLowerCase()}_tl/orderbook`
      );
      let buyPrice = 0,
        buyVolume = 0,
        sellPrice = 0,
        sellVolume = 0;

      let buyOrders = Object.entries(res.data.payload.sell);
      let sellOrders = Object.entries(res.data.payload.buy);

      let firstBuyPrice = Number(buyOrders[0][0]);
      let firstBuyVolume = Number(buyOrders[0][1]);
      buyPrice = firstBuyPrice;
      buyVolume = firstBuyVolume;

      let firstSellPrice = Number(sellOrders[0][0]);
      let firstSellVolume = Number(sellOrders[0][1]);
      sellPrice = firstSellPrice;
      sellVolume = firstSellVolume;

      for (let i = 1; i < buyOrders.length; i++) {
        let currentBuyPrice = Number(buyOrders[i][0]);
        if (((currentBuyPrice - firstBuyPrice) / firstBuyPrice) * 100 <= 2) {
          buyPrice = currentBuyPrice;
          buyVolume += Number(buyOrders[i][1]);
        } else {
          break;
        }
      }

      for (let i = 1; i < sellOrders.length; i++) {
        let currentSellPrice = Number(sellOrders[i][0]);
        if (((currentSellPrice - firstSellPrice) / firstSellPrice) * 100 <= 2) {
          sellPrice = currentSellPrice;
          sellVolume += Number(sellOrders[i][1]);
        } else {
          break;
        }
      }

      updateBuyData("Paribu", token, convertDöviz(x,buyPrice), buyVolume.toFixed(2));
      updateSellData("Paribu", token, convertDöviz(x,sellPrice), sellVolume.toFixed(2));
    
    } catch (error) {
      console.error("Hata:", error);
    }
  });
};

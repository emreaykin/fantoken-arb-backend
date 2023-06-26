import { getBinanceFanToken } from "./binance/binanceGetToken.js";
import { getGateioFanToken } from "./gateio/gateioGetToken.js";
import { getHuobiFanToken } from "./huobi/huobiGetToken.js";
import { getKucoinFanToken } from "./kucoin.js";
import { getMexcFanToken } from "./mexc/mexcGetToken.js";

export const createTokenList = async () => {
  let tokenList = [];
  const gate = await getGateioFanToken();
  const binance = await getBinanceFanToken();
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
  const mexc = await getMexcFanToken();
  const huobi = await getHuobiFanToken();
 /* const kucoin = await getKucoinFanToken();*/
  paribuTokens.map((token) => {
    tokenList.push({
      currency: token,
      exchange: [
        {
          name: "Paribu",
          currency: token,
        },
      ],
    });
  });
  gate.forEach((gateToken) => {
    const foundToken = tokenList.find(
      (token) => token.currency === gateToken.currency
    );
    if (foundToken) {
      foundToken.exchange = foundToken.exchange || [];
      foundToken.exchange.push({
        name: "Gate",
        currency: gateToken.currency,
        withdraw_disabled: gateToken.withdraw_disabled,
        deposit_disabled: gateToken.deposit_disabled,
      });
    }
  });
  binance.forEach((binanceToken) => {
    const foundToken = tokenList.find(
      (token) => token.currency === binanceToken.currency
    );
    if (foundToken) {
      foundToken.exchange = foundToken.exchange || [];
      foundToken.exchange.push({
        name: "Binance",
        currency: binanceToken.currency,
        withdraw_disabled: binanceToken.withdrawAllEnable,
        deposit_disabled: binanceToken.depositAllEnable,
      });
    }
  });
  mexc.forEach((mexcToken) => {
    const foundToken = tokenList.find(
      (token) => token.currency === mexcToken.currency
    );
    if (foundToken) {
      foundToken.exchange = foundToken.exchange || [];
      foundToken.exchange.push({
        name: "Mexc",
        currency: mexcToken.currency,
        withdraw_disabled:
          mexcToken.coins[0].is_withdraw_enabled === true ? false : true,
        deposit_disabled:
          mexcToken.coins[0].is_deposit_enabled === true ? false : true,
      });
    }
  });
  huobi.forEach((huobiToken) => {
    const foundToken = tokenList.find(
      (token) => token.currency === huobiToken.currency.toUpperCase()
    );
    if (foundToken) {
      foundToken.exchange.push({
        name: "Huobi",
        currency: huobiToken.currency.toUpperCase(),
        withdraw_disabled: huobiToken.withdraw_disabled,
        deposit_disabled: huobiToken.deposit_disabled,
      });
    }
   
  });
  /*kucoin.forEach((kucoinToken) => {
    const foundToken = tokenList.find(
      (token) => token.currency === kucoinToken.currency
    );
    if (foundToken) {
      foundToken.exchange.push({
        name: "Kucoin",
        currency: kucoinToken.currency,
        withdraw_disabled: kucoinToken.isWithdrawEnabled,
        deposit_disabled: kucoinToken.isDepositEnabled,
      });
    }
   
  });*/

  let pairs = [];


  for (let i = 0; i < tokenList.length; i++) {
    for (let k = 0; k < tokenList[i].exchange.length; k++) {
        let borsa1 = tokenList[i].exchange[k];
        for (let x = k + 1; x < tokenList[i].exchange.length; x++) {
            let borsa2 = tokenList[i].exchange[x];
            if (borsa1.name !== borsa2.name) {
                pairs.push({
                    exchangeOne: borsa1.name,
                    exchangeOneSymbol: borsa1.currency, // Simge bilgisi verinizin içerisinde bulunmamakta, bu yüzden varsayılan değer boş string olarak atandı.
                    withdrawEnabledOne: !borsa1.withdraw_disabled, // alanın olmaması durumunda çekim yapılabilir olduğunu varsayıyoruz
                    buyPrice: 0, // Varsayılan değer
                    buyVolume: 0, // Varsayılan değer
                    exchangeTwo: borsa2.name,
                    exchangeTwoSymbol: borsa2.currency, // Simge bilgisi verinizin içerisinde bulunmamakta, bu yüzden varsayılan değer boş string olarak atandı.
                    sellPrice: 0, // Varsayılan değer
                    sellVolume: 0, // Varsayılan değer
                    depositEnabledTwo: !borsa2.deposit_disabled,  // alanın olmaması durumunda yatırma yapılabilir olduğunu varsayıyoruz
                    profit: 0 // Varsayılan değer
                });
            }
        }
    }
}

 return pairs;
};



import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";
import querystring from "querystring";


dotenv.config();

const { apiKey, apiSecret } = process.env;

export const getBinanceFanToken = async () => {
  const params = {
    recvWindow: 5000,
    timestamp: new Date().getTime() - 1000,
  };
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(querystring.stringify(params))
    .digest("hex");

  params.signature = signature;

  const response = await axios.get(
    "https://api.binance.com/sapi/v1/capital/config/getall",
    {
      params: params,
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    }
  );

  let fanToken = [];
  response.data.forEach((token) => {
    const tokenFilter = token.networkList.filter(
      (chain) => chain.network === "CHZ"
    );

    if (tokenFilter.length > 0) {
      fanToken.push({
        currency: token.coin,
        depositAllEnable: tokenFilter[0].depositEnable,
        withdrawAllEnable: tokenFilter[0].withdrawEnable,
      });
    }
  });

  return fanToken;
};


import axios from "axios";
export const getKucoinFanToken = async () => {
  const response = await axios.get("https://api.kucoin.com/api/v1/currencies");

  const tokens = response.data.data;

  return tokens;
};

import axios from "axios";
export const getGateioFanToken = async () => {
  const response = await axios.get(
    "https://api.gateio.ws/api/v4/spot/currencies"
  );

  const tokens = response.data.filter((token) => token.chain === "CHZ");

  return tokens;
};

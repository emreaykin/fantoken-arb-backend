let dataStore = [];

const updateFromMongoDB = (mongoData) => {
  dataStore = mongoData;
}

const updateBuyData = (exchangeOne, exchangeOneSymbol, buyPrice, buyVolume) => {
  dataStore.filter((item) => 
    item.exchangeOne === exchangeOne && 
    item.exchangeOneSymbol === exchangeOneSymbol
  ).forEach((item) => {
    item.buyPrice = buyPrice;
    item.buyVolume = buyVolume;
    
    // update profit
    const maxVolume = Math.min(item.buyVolume, item.sellVolume);
    item.profit = ((item.sellPrice - item.buyPrice) * maxVolume).toFixed(2);
  });
}

const updateSellData = (exchangeTwo, exchangeTwoSymbol, sellPrice, sellVolume) => {
  dataStore.filter((item) =>
    item.exchangeTwo === exchangeTwo && 
    item.exchangeTwoSymbol === exchangeTwoSymbol
  ).forEach((item) => {
    item.sellPrice = sellPrice;
    item.sellVolume = sellVolume;
    
    // update profit
    const maxVolume = Math.min(item.sellVolume, item.buyVolume);
    item.profit = ((item.sellPrice - item.buyPrice) * maxVolume).toFixed(2);
  });
}


export {
  dataStore,
  updateFromMongoDB,
  updateBuyData,
  updateSellData,
};

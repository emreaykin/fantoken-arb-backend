import axios from 'axios';

export  const getMexcFanToken = async ()=>{
  try {
    // Her iki API'den de verileri al
    const [coinListResponse, defaultSymbolsResponse] = await Promise.all([
      axios.get('https://www.mexc.com/open/api/v2/market/coin/list'),
      axios.get('https://api.mexc.com/api/v3/defaultSymbols')
    ]);

    const coinListData = coinListResponse.data.data;
    const defaultSymbols = defaultSymbolsResponse.data.data;

    // "SOL" chain'i olan tokenleri ve semboller listesinde bulunanları filtrele
    const solTokens = coinListData.filter(token => {
      return token.coins.some(coin => coin.chain === 'Chiliz Chain(CHZ)') && 
             !['USDC', 'USDT'].includes(token.currency) && 
             defaultSymbols.includes(token.currency + "USDT");
    });
    

    // Filtrelenmiş token listesini döndür
    return solTokens;
  } catch (error) {
    console.error(error);
    throw error;  // Hataları yakalamak ve işlemek için isteği atan fonksiyona hata atıyoruz.
  }
}

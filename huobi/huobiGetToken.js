
import axios from "axios";

export const getHuobiFanToken = async () => {

    let tokenList=[];
  const response = await axios.get("https://api.huobi.pro/v2/reference/currencies");

  const data = response.data.data;

    data.map((token)=>{
       const filter= token.chains.find(chain =>  chain.baseChain === "CHZ")
      
       if(filter){
        tokenList.push({
            currency:token.currency,
            deposit_disabled:filter.depositStatus==="allowed" ? false:true,
            withdraw_disabled:filter.withdrawStatus==="allowed" ? false:true
        })
     
       }
    })

    return tokenList;
};



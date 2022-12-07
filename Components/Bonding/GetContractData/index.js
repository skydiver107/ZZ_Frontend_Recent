import { ethers } from "ethers";
import ChainID from "../../../Blockchain/chainId";
import {
  MOCK_POZTOKEN_ABI,
  MOCK_USDT_ABI,
  BONDING_ABI,
  CONVERSION_RATE_ABI,
  BONDING_ABI_POLYGON,
  MOCK_POZTOKEN_ABI_POLYGON,
  MOCK_USDT_ABI_POLYGON,
  CONVERSION_RATE_ABI_POLYGON
} from '../../../Blockchain/abis'
import {
  RPC_SERVER,
  Bonding_address,
  USDT_TOKEN_address,
  POZ_TOKEN_address,
  CONVERSION_RATE_ADDR
} from "../../../Blockchain/addresses";

const isTest = process.env.ENVIRONMENT === "dev";
// const isTest = false

const getContractData = async () => {
  // const { data: signer } = useSigner();
  // const provider = new ethers.providers.Web3Provider(window.ethereum);
  const rpcServer = isTest ? RPC_SERVER[ChainID.mumbai] : RPC_SERVER[ChainID.polygon]
  const provider = new ethers.providers.JsonRpcProvider(rpcServer);
  const bondingContract = new ethers.Contract(Bonding_address, JSON.stringify(BONDING_ABI), provider); //bonding for ConversionRate
  const usdtContract = new ethers.Contract(USDT_TOKEN_address, JSON.stringify(isTest ? MOCK_USDT_ABI : MOCK_USDT_ABI_POLYGON), provider);
  const pozTokenContract = new ethers.Contract(POZ_TOKEN_address, JSON.stringify(isTest ? MOCK_POZTOKEN_ABI : MOCK_POZTOKEN_ABI_POLYGON), provider);

  // get contract data for conversion rate
  const conversionRate = new ethers.Contract(CONVERSION_RATE_ADDR, JSON.stringify(CONVERSION_RATE_ABI), provider);

  return { bondingContract, usdtContract, pozTokenContract, conversionRate }
}

export default getContractData;
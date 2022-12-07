import ChainID from "./chainId";
import LzChainID from "./lzChainId";

const isTest = process.env.ENVIRONMENT === "dev";
// const isTest = false

const ChainList = [
  {
    id: isTest ? ChainID.rinkeby : ChainID.ethereum,
    lzId: isTest ? LzChainID.rinkeby : LzChainID.ethereum,
    chain: "Ethereum",
    testnet: "Rinkeby",
    color: "#989898",
    thumb: "/img/nfts/ONFT ETH.png",
    logo: "/img/coins/ETH.svg",
  },
  {
    id: isTest ? ChainID.mumbai : ChainID.polygon,
    lzId: isTest ? LzChainID.mumbai : LzChainID.polygon,
    chain: "Polygon",
    testnet: "mumbai",
    color: "#6429C7",
    thumb: "/img/nfts/ONFT POL.png",
    logo: "/img/coins/MATIC.svg",
  },
  {
    id: isTest ? ChainID.fuji : ChainID.avalanche,
    lzId: isTest ? LzChainID.fuji : LzChainID.avalanche,
    chain: "Avalanche",
    testnet: "fuji",
    color: "#EF797A",
    thumb: "/img/nfts/ONFT AVA.png",
    logo: "/img/coins/AVAX.svg",
  },
  {
    id: isTest ? ChainID["bsc-testnet"] : ChainID.binance,
    lzId: isTest ? LzChainID["bsc-testnet"] : LzChainID.binance,
    chain: "Binance",
    testnet: "bsc-testnet",
    color: "#F0B90B",
    thumb: "/img/nfts/ONFT BSC.png",
    logo: "/img/coins/BNB.svg",
  },
  {
    id: isTest ? ChainID["arbitrum-rinkeby"] : ChainID.arbitrum,
    lzId: isTest ? LzChainID["arbitrum-rinkeby"] : LzChainID.arbitrum,
    chain: "Arbitrum",
    testnet: "arbitrum-rinkeby",
    color: "#96BEDC",
    thumb: "/img/nfts/ONFT ARB.png",
    logo: "/img/coins/ARBI.svg",
  },
  {
    id: isTest ? ChainID["optimism-kovan"] : ChainID.optimism,
    lzId: isTest ? LzChainID["optimism-kovan"] : LzChainID.optimism,
    chain: "Optimism",
    testnet: "optimism-kovan",
    color: "#FF0420",
    thumb: "/img/nfts/ONFT OPT.png",
    logo: "/img/coins/OPT.svg",
  },
];

export default ChainList;

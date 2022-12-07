const isTest = process.env.ENVIRONMENT === "dev";

// const isTest = false
import { chain } from "wagmi";
const testChainIdList = [
  chain.polygonMumbai,
  chain.rinkeby,
  chain.arbitrumGoerli,
  chain.optimismGoerli,
];

const prodChainList = [
  chain.mainnet,
  chain.polygon,
  chain.optimism,
  chain.arbitrum,
  {
    id: 43114,
    name: "Avalanche C-Chain",
    network: "avalanche",
    iconUrl: "/img/coins/AVAX.svg",
    iconBackground: "#EF797A",
    nativeCurrency: {
      decimals: 18,
      name: "Avalanche",
      symbol: "AVAX",
    },
    rpcUrls: {
      default: "https://api.avax.network/ext/bc/C/rpc",
    },
    blockExplorers: {
      default: { name: "SnowTrace", url: "https://snowtrace.io" },
      etherscan: { name: "SnowTrace", url: "https://snowtrace.io" },
    },
    testnet: false,
  },
  {
    id: 56,
    name: "Binance Smart Chain Mainnet",
    network: "binance",
    iconUrl: "/img/coins/BNB.svg",
    iconBackground: "#F0B90B",
    nativeCurrency: {
      decimals: 18,
      name: "BNB",
      symbol: "BNB",
    },
    rpcUrls: {
      default: "https://bsc-dataseed1.binance.org",
    },
    blockExplorers: {
      default: { name: "BscScan", url: "https://bscscan.com" },
    },
    testnet: false,
  },
];

const chainIdList = isTest ? testChainIdList : prodChainList;

export const isSupportedChain = (chainId) => {
  return chainIdList.find((chain) => chain.id === chainId) === undefined
    ? false
    : true;
};

export default chainIdList;

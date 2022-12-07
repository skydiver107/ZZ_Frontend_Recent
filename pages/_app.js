import { useRouter } from "next/router";
import { WagmiConfig, configureChains, createClient, chain } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { infuraProvider } from 'wagmi/providers/infura'
import {
  RainbowKitProvider
} from '@rainbow-me/rainbowkit'

import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets, wallet } from '@rainbow-me/rainbowkit';

// import { MoralisProvider } from "react-moralis";
import "bootstrap/dist/css/bootstrap.css";
import { ThemeProvider } from "styled-components";
import { theme } from "../styles/styles";
import { ToastContainer, Flip } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "/global.scss";
import './../styles/Staking/staking.css';
import './../styles/Bonding/bonding.css';
import './../styles/Bonding/popupModal.css';
import './../styles/foot/foot.css';
import './../styles/header/header.css';
import './../styles/Home/heroLanding.css';
import './../styles/globals.css'

import chainIdList from "../Blockchain/chainIdList";

const isTest = process.env.ENVIRONMENT === "dev";

const { chains, provider } = configureChains(
  chainIdList,
  [jsonRpcProvider({ rpc: chain => ({ http: chain.rpcUrls.default }) })],
  [infuraProvider({ infuraId: process.env.INFURA_ID })]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      wallet.rainbow({ chains }),
      wallet.walletConnect({ chains }),
      wallet.trust({ chains }),
      wallet.metaMask({ chains }),
    ],
  }
]);

const WagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

const MyApp = ({ Component, pageProps }) => {
  const router = useRouter();
  const path = (/#!(\/.*)$/.exec(router.asPath) || [])[1];
  if (path) {
    router.replace(path);
  }

  return (
    <ThemeProvider theme={theme}>
      <WagmiConfig client={WagmiClient}>
        <RainbowKitProvider
          chains={chains}
          initialChain={isTest ? chain.polygonMumbai : chain.polygon}
        >
          <Component {...pageProps} />
          <ToastContainer
            autoClose={3000}
            theme="colored"
            transition={Flip}
            position="bottom-right"
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </RainbowKitProvider>
      </WagmiConfig>
    </ThemeProvider>

  );
};

export default MyApp;
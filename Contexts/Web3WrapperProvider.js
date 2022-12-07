import { createContext, useEffect, useState, useContext } from "react";
import * as Sentry from "@sentry/nextjs";
import Web3Wrapper from "../Blockchain/web3/Web3Wrapper";
import { Web3ModalContext } from "./Web3ModalProvider";

// const IWeb3WrapperContext = {
//   web3Wrapper: Web3Wrapper,
// };

export const Web3WrapperContext = createContext({
  web3Wrapper: null,
});

export const Web3WrapperProvider = ({ children }) => {
  const { ethersInstance, signer, chainId, account, connect, disconnect } =
    useContext(Web3ModalContext);
  const [web3Wrapper, setWeb3Wrapper] = useState();

  useEffect(() => {
    if (ethersInstance && chainId && account) {
      try {
        const _web3Wrapper = new Web3Wrapper(signer);
        setWeb3Wrapper(_web3Wrapper);
      } catch (e) {
        console.log("Failed to create a Web3 Wrapper: ", e);
        Sentry.captureException(e);
      }
    } else {
      setWeb3Wrapper(null);
    }
  }, [ethersInstance, chainId, account, signer, setWeb3Wrapper]);
  // }, [ethersInstance, chainId, account]);

  return (
    <Web3WrapperContext.Provider value={{ web3Wrapper }}>
      {children}
    </Web3WrapperContext.Provider>
  );
};

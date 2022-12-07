import { createContext, useCallback, useEffect, useState } from "react";
import Web3Modal from "web3modal";
// import Web3 from "web3"
import { ethers } from "ethers";
import * as Sentry from "@sentry/nextjs";
import { providerOptions } from "../Blockchain/provider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
// import { string } from "prop-types"
// let BSCChainId = 97;
// if (process.env.REACT_APP_ENV == "dev") {
//   BSCChainId = 1337;
// }

// interface IWeb3ModalContext {
//   ethersInstance,
//   // web3: any | null;
//   signer,
//   connect,
//   disconnect,
//   account,
//   chainId,
//   // networkId: number | null;
//   connected,
// };

export const Web3ModalContext = createContext({
  // web3: null,
  ethersInstance: "",
  signer: "",
  connect: () => {},
  disconnect: () => {},
  account: "",
  chainId: "",
  // networkId: null,
  connected: false,
});

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    disableInjectedProvider: false,
    providerOptions, // required
  });
}

export const Web3ModalProvider = ({ children }) => {
  // const [web3Modal, setWeb3Modal] = useState<Web3Modal | null>(null);
  const [ethersInstance, setEthersInstance] = useState("");
  // const [web3, setWeb3] = useState<any | null>(null)
  const [signer, setSigner] = useState("");
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [provider, setProvider] = useState("");
  const [library, setLibrary] = useState(null);
  const [connected, setConnected] = useState(false);

  const resetWeb3 = useCallback(() => {
    setAccount("");
    setChainId("");
    setEthersInstance("");
    setSigner("");
    setConnected(false);
    setProvider("");
    setLibrary(null);
  }, [
    setAccount,
    setChainId,
    setConnected,
    setEthersInstance,
    setProvider,
    setSigner,
    setLibrary,
  ]);
  // }, []);

  const disconnect = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      if (provider?.disconnect && typeof provider.disconnect === "function") {
        await provider.disconnect();
      }
      if (provider?.close && typeof provider.close === "function") {
        await provider.close();
      }
      resetWeb3();
    },
    [provider, resetWeb3]
    // [web3Modal, ethersInstance, resetWeb3]
  );

  const connect = useCallback(async () => {
    let _provider;
    try {
      _provider = await web3Modal.connect();
      await _provider.enable()
      // setProvider(_provider);
    } catch (e) {
      disconnect();
      if (e === "Modal closed by user") {
        toast.warn("The transaction signature was cancelled or denied.", {
          type: toast.TYPE.WARNING,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="warn" />
          ),
        });
        return;
      }
      toast.warn(
        `Trouble connecting wallet..!! Check if your wallet is unlocked.`,
        {
          type: toast.TYPE.WARNING,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="warn" />
          ),
        }
      );
      Sentry.captureException(e);
      return;
    }
    if (_provider === null) return;

    //============================================================================================================//
    const ethersProviderInstance = new ethers.providers.Web3Provider(_provider);
    setEthersInstance(ethersProviderInstance);
    // await ethersProviderInstance.send("eth_requestAccounts", [])
    const signer = await ethersProviderInstance.getSigner();
    setSigner(signer);
    const _account = await signer.getAddress().then((address) => {
      return address;
    });
    const _chainId = (await ethersProviderInstance.getNetwork()).chainId;
    //===========================================================================================================//
    // if (_chainId != BSCChainId) {
    //   toast.warn(`Please connect to BSC Testnet`, {
    //     position: toast.POSITION.BOTTOM_RIGHT,
    //     autoClose: 4000,
    //     closeOnClick: true,
    //   });
    //   disconnect();
    //   return;
    // }
    setAccount(String(_account));
    setChainId(_chainId);
    setLibrary(ethersProviderInstance);
    setConnected(true);
  }, [
    disconnect,
    setAccount,
    setChainId,
    setConnected,
    setEthersInstance,
    setProvider,
    setSigner,
  ]);
  // }, [web3Modal]);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        setAccount(accounts[0]);
        // chainId === BSCChainId ? setAccount(accounts[0]) : setAccount(null);
      };

      const handleChainChanged = async (_hexChainId) => {
        setChainId(parseInt(_hexChainId, 16));
        // if (parseInt(_hexChainId, 16) !== BSCChainId) {
        //   toast.warn(`Please connect to BSC Testnet`, {
        //     position: toast.POSITION.BOTTOM_RIGHT,
        //     autoClose: 4000,
        //     closeOnClick: true,
        //   });
        //   setConnected(false);
        //   disconnect();
        //   return;
        // }
        toast.success("Your wallet is now connected.", {
          type: toast.TYPE.SUCCESS,
          icon: (
            <Image
              src="/icon/success.svg"
              width={24}
              height={24}
              alt="success"
            />
          ),
        });
      };

      const handleDisconnect = async (error) => {
        console.log("disconnect", error.message);
        await web3Modal.clearCachedProvider();
        resetWeb3();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
    return () => {};
  }, [
    provider,
    disconnect,
    chainId,
    setAccount,
    setChainId,
    setConnected,
    resetWeb3,
  ]);
  // }, [provider, disconnect]);

  // Auto connect to the cached provider
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, [connect]);
  return (
    <Web3ModalContext.Provider
      value={{
        ethersInstance,
        // web3,
        signer,
        connect,
        disconnect,
        account,
        // networkId,
        chainId,
        connected,
        library,
      }}
    >
      {children}
    </Web3ModalContext.Provider>
  );
};

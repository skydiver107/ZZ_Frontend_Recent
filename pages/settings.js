import { useState, useContext } from "react";
import * as Sentry from "@sentry/nextjs";
import { Web3ModalContext } from "../Contexts/Web3ModalProvider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  nullAddress,
  PozzlenautsONFT,
  RPC_SERVER,
} from "../Blockchain/addresses";
import ChainID from "../Blockchain/chainId";
import ChainList from "../Blockchain/chainList";
import PozzlenautsFreeList from "../Blockchain/listings/PozzlenautsFreeList.json";
import PozzlenautsGreenList from "../Blockchain/listings/PozzlenautsGreenList.json";
import POZZ_ABI from "../Blockchain/abis/PozzlenautsONFT.json";
import POZZPoz_ABI from "../Blockchain/abis/PozzlenautsONFTPoz.json";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";
import { ethers } from "ethers";

export default function Index() {
  const d = new Date();
  const [currentDate, setCurrentDate] = useState(d.toDateString());

  const { connect, disconnect, account, chainId, signer } =
    useContext(Web3ModalContext);

  const switchNetwork = async (newChainId) => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x" + newChainId.toString(16) }], // chainId must be in hexadecimal numbers
        });
      } catch (error) {
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x" + newChainId.toString(16),
                  rpcUrl: RPC_SERVER[newChainId],
                },
              ],
            });
          } catch (addError) {
            toast.error(addError.message, {
              position: toast.POSITION.BOTTOM_RIGHT,
              autoClose: 4000,
              closeOnClick: true,
            });
            Sentry.captureException(addError);
          }
        } else if (error.code === 4001) {
          toast.error(error.message, {
            position: toast.POSITION.BOTTOM_RIGHT,
            autoClose: 4000,
            closeOnClick: true,
          });
        } else {
          toast.error(error.message, {
            position: toast.POSITION.BOTTOM_RIGHT,
            autoClose: 4000,
            closeOnClick: true,
          });
        }
        Sentry.captureException(error);
      }
    } else {
      toast.warning(
        "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html",
        {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 4000,
          closeOnClick: true,
        }
      );
    }
  };

  const handleSetDate = (chainOn) => {
    if (!signer) return;

    let _currentDate = Date.parse(currentDate) / 1000;

    if (
      PozzlenautsONFT[chainOn] === nullAddress ||
      PozzlenautsONFT[chainOn] === undefined
    )
      return;

    const pozzlenautsONFT = new ethers.Contract(
      PozzlenautsONFT[chainOn],
      JSON.stringify(chainOn === ChainID.mumbai ? POZZPoz_ABI : POZZ_ABI),
      signer
    );
    const setPublicDate = async () => {
      let tx = await (await pozzlenautsONFT.setPublicDate(_currentDate)).wait();
      console.log(tx);
    };
    setPublicDate();
  };

  const handleSetMerkle = (chainOn) => {
    if (!signer) return;
    if (
      PozzlenautsONFT[chainOn] === nullAddress ||
      PozzlenautsONFT[chainOn] === undefined
    )
      return;

    const flHashedAddrs = PozzlenautsFreeList.map((addr) => keccak256(addr));
    const wlHashedAddrs = PozzlenautsGreenList.map((addr) => keccak256(addr));

    const flMerkleTree = new MerkleTree(flHashedAddrs, keccak256, {
      sortPairs: true,
    });

    const glMerkleTree = new MerkleTree(wlHashedAddrs, keccak256, {
      sortPairs: true,
    });

    let flRoot = flMerkleTree.getHexRoot();
    let glRoot = glMerkleTree.getHexRoot();

    const pozzlenautsONFT = new ethers.Contract(
      PozzlenautsONFT[chainOn],
      JSON.stringify(chainOn === ChainID.mumbai ? POZZPoz_ABI : POZZ_ABI),
      signer
    );
    const setMerkleRoot = async () => {
      let flTx = await (await pozzlenautsONFT.setFLMerkleRoot(flRoot)).wait();
      let glTx = await (await pozzlenautsONFT.setGLMerkleRoot(glRoot)).wait();
      console.log(flTx, glTx);
    };
    setMerkleRoot();
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "grid",
          width: "600px",
          gap: "1em",
        }}
      >
        <button onClick={!account ? connect : disconnect}>
          {account ? account : "Connect Wallet"}
        </button>
        <div
          style={{
            display: "grid",
            gap: "1em",
          }}
        >
          <input
            type="date"
            onChange={(e) => setCurrentDate(e.target.value)}
            value={currentDate}
          />
          <div style={{ display: "grid", gap: "0.5em" }}>
            {ChainList.map((item, idx) =>
              chainId !== item.id ? (
                <button key={idx} onClick={() => switchNetwork(item.id)}>
                  Switch to {item.chain}
                </button>
              ) : (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.3em",
                  }}
                >
                  <button onClick={() => handleSetDate(item.id)}>
                    Set Date at {item.chain}
                  </button>
                  <button onClick={() => handleSetMerkle(item.id)}>
                    Set Merkle Roots at {item.chain}
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

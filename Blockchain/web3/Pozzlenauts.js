import { useContext } from "react";
import { ethers } from "ethers";
import { PozzlenautsONFT } from "../addresses";
import OnftARGS from "../onftArgs";
import { Web3ModalContext } from "../../Contexts/Web3ModalProvider";
import abi from "../abis/PozzlenautsONFT.json";
import ChainID from "../chainId";

const PozzlenautsWrapper = (_signer) => {
  const chainId = useContext(Web3ModalContext);

  const pozzlenautsONFT = new ethers.Contract(
    PozzlenautsONFT[chainId],
    JSON.stringify(abi),
    _signer
  );

  const balanceOf = (_owner) => {
    return pozzlenautsONFT.balanceOf(_owner);
  };

  const baseURI = () => {
    return pozzlenautsONFT.baseURI();
  };

  const countMinted = (_address) => {
    return pozzlenautsONFT.countMinted(_address);
  };

  const freeListMint = (_proof) => {
    pozzlenautsONFT.freeListMint(_proof);
  };

  const greeListMint = (_proof) => {
    pozzlenautsONFT.greenListMint(_proof);
  };

  const isFLClaimed = (_address) => {
    return pozzlenautsONFT.isFLClaimed(_address);
  };

  const isGLClaimed = (_address) => {
    return pozzlenautsONFT.isGLClaimed(_address);
  };

  const maxMintId = () => {
    return pozzlenautsONFT.maxMintId();
  };

  const nextMintId = () => {
    return pozzlenautsONFT.nextMintId();
  };

  const publicMint = (_mintCount) => {
    pozzlenautsONFT.publicMint(_mintCount);
  };

  const sendToken = (_owner, _srcChainId, _dstChainId, _tokenId) => {
    let adapterParams = ethers.utils.solidityPack(
      ["uint16", "uint256"],
      [1, 200000]
    );

    let pozzleCustomONFT = new ethers.Contract(
      PozzlenautsONFT[_srcChainId],
      JSON.stringify(abi),
      _signer
    );

    pozzleCustomONFT.sendFrom(
      _owner,
      _dstChainId,
      _owner,
      _tokenId,
      _owner,
      ethers.constants.AddressZero,
      adapterParams,
      {
        value: ethers.utils.parseEther("0.001"),
      }
    );
  };
};

export default PozzlenautsWrapper;

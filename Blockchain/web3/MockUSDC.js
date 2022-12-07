import { useContext } from "react";
import { ethers } from "ethers";
import { MockUSDC } from "../addresses";
import { Web3ModalContext } from "../../Contexts/Web3ModalProvider";
import { NumToBN } from "../utils";
import abi from "../abis/MockUSDC.json";

const MockUSDCWrapper = (_signer) => {
  const chainId = useContext(Web3ModalContext);
  const kUSDC = new ethers.Contract(
    MockUSDC[chainId],
    JSON.stringify(abi),
    _signer
  );

  const approve = (_value, _decimal) => {
    kUSDC.approve(MockUSDC[chainId], NumToBN(_value, _decimal));
  };

  const allowance = (_owner) => {
    return kUSDC.allowance(_owner, MockUSDC[chainId]);
  };

  const balanceOf = (_owner) => {
    return kUSDC.balanceOf(_owner);
  };
};

export default MockUSDCWrapper;

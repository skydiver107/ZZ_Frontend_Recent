import { useState, useEffect, useContext, useCallback, Children } from "react";
import { useRouter } from "next/router";
import * as Sentry from "@sentry/nextjs";
import Image from "next/image";
import Button from "../../Components/Button";
import Row from "../../Components/Layouts/Row";
import Column from "../../Components/Layouts/Column";
import Modal from "../../Components/Modal";
import Text from "../../Components/Text";
import Input from "../../Components/Inputs/Input";
import ChainID from "../../Blockchain/chainId";
import ChainList from "../../Blockchain/chainList";
import PozzlenautsFreeList from "../../Blockchain/listings/PozzlenautsFreeList.json";
import PozzlenautsGreenList from "../../Blockchain/listings/PozzlenautsGreenList.json";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MerkleTree from "merkletreejs";
import keccak256 from "keccak256";

import { isSupportedChain } from "../../Blockchain/chainIdList";
import {
  nullAddress,
  MockUSDC,
  PozzlenautsONFT,
  RPC_SERVER,
} from "../../Blockchain/addresses";
import POZZ_ABI from "../../Blockchain/abis/PozzlenautsONFT.json";
import POZZPoz_ABI from "../../Blockchain/abis/PozzlenautsONFTPoz.json";
import USDC_ABI from "../../Blockchain/abis/MockUSDC";
import { ethers } from "ethers";
import Loader from "../../Components/Loader";
import {
  useAccount,
  useConnect,
  useNetwork,
  useProvider,
  useSigner,
  useSwitchNetwork,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Landing() {
  const [isNFTModalOpen, setNFTModalOpen] = useState(false);

  const routerLink = ["mint", "transfer"];
  const [current, setCurrent] = useState(routerLink[0]);

  const [isPending, setPending] = useState(false);

  const router = useRouter();

  const [maxAmount] = useState(3);
  const [mintAmount, setMintAmount] = useState(1);
  const [tokenId, setTokenId] = useState("");

  const [chainNewOn, setChainNewOn] = useState(-1);
  const [chainOn, setChainOn] = useState(-1);
  const [chainFrom, setChainFrom] = useState(-1);
  const [chainTo, setChainTo] = useState(-1);

  const [pMintPrice, setPMintPrice] = useState(199);
  const [glMintPrice, setGLMintPrice] = useState(150);

  const [publicDate, setPublicDate] = useState(0);

  const [isApproved, setApproved] = useState(false);
  const [isDetected, setDetected] = useState(undefined);
  const [isDisabled, setDisabled] = useState(false);
  const [isLimited, setLimited] = useState(false);

  const [maxETHMint, setMaxETHMint] = useState(-1);
  const [maxMATMint, setMaxMATMint] = useState(-1);
  const [maxAVAMint, setMaxAVAMint] = useState(-1);
  const [maxBSCMint, setMaxBSCMint] = useState(-1);
  const [maxARBMint, setMaxARBMint] = useState(-1);
  const [maxFANMint, setMaxFANMint] = useState(-1);

  const [nextETHMint, setNextETHMint] = useState(0);
  const [nextMATMint, setNextMATMint] = useState(0);
  const [nextAVAMint, setNextAVAMint] = useState(0);
  const [nextBSCMint, setNextBSCMint] = useState(0);
  const [nextARBMint, setNextARBMint] = useState(0);
  const [nextFANMint, setNextFANMint] = useState(0);

  const [mintedCount, setMintedCount] = useState(0);
  const [glClaimed, setGLClaimed] = useState(true);
  const [flClaimed, setFLClaimed] = useState(true);

  const [verifyStep, setVerifyStep] = useState(1);
  const HANDLER = {
    APPROVE: 1,
    FREE_MINT: 2,
    GREEN_MINT: 3,
    PUBLIC_MINT: 4,
    DETECT: 5,
    TRANSFER: 6,
  };
  const [reqHandler, setReqHandler] = useState(0);
  const [isVerifyModalVisible, setVerifyModalVisible] = useState(false);
  const [isVerified, setVerified] = useState(false);
  const [verfiyModalContent, setVerifyModalContent] = useState(
    "You can now mint your NFT! Continue to your wallet to finalise the mint"
  );
  const [verifyModalButton, setVerifyModalButton] =
    useState("Continue to wallet");

  const [isPendingModalVisible, setPendingModalVisible] = useState(false);
  const [pendingText, setPendingText] = useState("Verifying...");

  const [isApproveModalVisible, setApproveModalVisible] = useState(false);

  const [isMintModalVisible, setMintModalVisible] = useState(false);
  const [isTransferModalVisible, setTransferModalVisible] = useState(false);
  const [transferText, setTransferText] = useState(
    "Congratulations! You have successfully sent a Pozzlenaut NFT!"
  );
  const [latestNFTAddress, setLatestNFTAddress] = useState("");

  const loadingOpacity = [0.88, 0.5, 0.2, 0.2, 0.2, 0.88];
  const [loadingStep, setLoadingStep] = useState(0);

  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();

  const provider = useProvider();

  const { connect } = useConnect();
  const { data: signer } = useSigner();
  const { switchNetwork } = useSwitchNetwork({
    onError(error) {
      toast.error(error.message, {
        type: toast.TYPE.ERROR,
        icon: (
          <Image src="/icon/error.svg" width={24} height={24} alt="error" />
        ),
      });
    },
    onSuccess(data) {
      setChainOn(data.id);
      setChainFrom(data.id);
    },
    throwForSwitchChainNotSupported: true,
  });

  useEffect(() => {
    if (isConnected) {
      setChainOn(chain.id);
    } else {
      setChainOn(-1);
    }
  }, [chain, isConnected]);

  const _switchNetwork = useCallback(
    async (newChainId, isMint) => {
      setPending(true);
      if (!isConnected) {
        setPending(false);
        return;
      }
      if (provider) {
        try {
          switchNetwork(newChainId);
        } catch (error) {
          console.log(error);
          if (error.code === 4902) {
            try {
              switchNetwork(newChainId);
              !isMint && setChainFrom(newChainId);
            } catch (addError) {
              toast.error(
                "Oops! Your wallet is connected to a different chain. To select this blockchain, please switch your network to the correct chain first.",
                {
                  type: toast.TYPE.ERROR,
                  icon: (
                    <Image
                      src="/icon/error.svg"
                      width={24}
                      height={24}
                      alt="error"
                    />
                  ),
                }
              );
              Sentry.captureException(addError);
            }
          } else if (error.code === 4001) {
            toast.error("The transaction signature was cancelled or denied.", {
              type: toast.TYPE.ERROR,
              icon: (
                <Image
                  src="/icon/error.svg"
                  width={24}
                  height={24}
                  alt="error"
                />
              ),
            });
          } else if (error.message.includes("Unsupported keys")) {
            toast.error(
              "Oops! Your wallet is connected to a different chain. To select this blockchain, please switch your network to the correct chain first.",
              {
                type: toast.TYPE.ERROR,
                icon: (
                  <Image
                    src="/icon/error.svg"
                    width={24}
                    height={24}
                    alt="error"
                  />
                ),
              }
            );
          } else if (error.message) {
            toast.error(error.message, {
              type: toast.TYPE.ERROR,
              icon: (
                <Image
                  src="/icon/error.svg"
                  width={24}
                  height={24}
                  alt="error"
                />
              ),
            });
          } else {
            toast.error("Oops! Some error found.", {
              type: toast.TYPE.ERROR,
              icon: (
                <Image
                  src="/icon/error.svg"
                  width={24}
                  height={24}
                  alt="error"
                />
              ),
            });
          }
          Sentry.captureException(error);
        }
      } else {
        if (!window.ethereum) {
          toast.warning(
            "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html",
            {
              type: toast.TYPE.WARNING,
              icon: (
                <Image
                  src="/icon/error.svg"
                  width={24}
                  height={24}
                  alt="warning"
                />
              ),
            }
          );
        }
      }
      setPending(false);
    },
    [isConnected, provider, switchNetwork]
  );

  const getMintPrice = useCallback(async () => {
    if (chainOn === -1) return;

    if (
      PozzlenautsONFT[chainOn] === nullAddress ||
      PozzlenautsONFT[chainOn] === undefined
    )
      return;

    setPending(true);
    const provider = new ethers.providers.JsonRpcProvider(RPC_SERVER[chainOn]);

    let pozzlenautsONFT = new ethers.Contract(
      PozzlenautsONFT[chainOn],
      JSON.stringify(
        chainOn === ChainID.mumbai || chainOn === ChainID.polygon
          ? POZZPoz_ABI
          : POZZ_ABI
      ),
      provider
    );

    let pMintPrice = await pozzlenautsONFT.publicPrice();
    setPMintPrice(Number(pMintPrice));
    let glMintPrice = await pozzlenautsONFT.greenPrice();
    setGLMintPrice(Number(glMintPrice));

    let _publicDate = await pozzlenautsONFT.publicDate();
    setPublicDate(Number(_publicDate) * 1000);
    setPending(false);
  }, [chainOn]);

  const getMintabeInfo = useCallback(() => {
    if (!isConnected) return;

    setPending(true);
    let _mintCount = 0;

    const flHashedAddrs = PozzlenautsFreeList.map((addr) => keccak256(addr));
    const wlHashedAddrs = PozzlenautsGreenList.map((addr) => keccak256(addr));

    const flMerkleTree = new MerkleTree(flHashedAddrs, keccak256, {
      sortPairs: true,
    });

    const glMerkleTree = new MerkleTree(wlHashedAddrs, keccak256, {
      sortPairs: true,
    });

    let hashedAddr = keccak256(address);
    let flProof = flMerkleTree.getHexProof(hashedAddr);
    let flRoot = flMerkleTree.getHexRoot();
    let flValid = flMerkleTree.verify(flProof, hashedAddr, flRoot);
    console.log("FL Root", flRoot, flValid);

    let glProof = glMerkleTree.getHexProof(hashedAddr);
    let glRoot = glMerkleTree.getHexRoot();
    let glValid = glMerkleTree.verify(glProof, hashedAddr, glRoot);
    console.log("GL Root", glRoot, glValid);

    let _isFLClaimed = flValid,
      _isGLClaimed = glValid;

    setGLClaimed(false);
    setFLClaimed(false);

    ChainList.map((item) => {
      if (
        PozzlenautsONFT[item.id] === nullAddress ||
        PozzlenautsONFT[item.id] === undefined
      )
        return;

      const provider = new ethers.providers.JsonRpcProvider(
        RPC_SERVER[item.id]
      );

      const pozzlenautsONFT = new ethers.Contract(
        PozzlenautsONFT[item.id],
        JSON.stringify(
          item.id === ChainID.mumbai || item.id === ChainID.polygon
            ? POZZPoz_ABI
            : POZZ_ABI
        ),
        provider
      );

      const getMintable = async () => {
        let _mintedCount = await pozzlenautsONFT.countMinted(address);
        _mintCount += Number(_mintedCount);
        setMintedCount(_mintCount);

        let _isFLClaim = await pozzlenautsONFT.isFLClaimed(address);
        let _isGLClaim = await pozzlenautsONFT.isGLClaimed(address);

        _isFLClaimed &&= !_isFLClaim;
        _isGLClaimed &&= !_isGLClaim;

        // console.log(_isFLClaim, _isGLClaim, item.id);

        !_isGLClaimed && setGLClaimed(!_isGLClaimed);
        !_isFLClaimed && setFLClaimed(!_isFLClaimed);
      };

      getMintable();
    });
    setPending(false);
  }, [address, isConnected]);

  const getAllowance = useCallback(async () => {
    if (!isConnected) return;
    if (chainOn === -1) return;
    if (chainOn !== chain.id) return;
    if (MockUSDC[chain.id] === nullAddress || MockUSDC[chain.id] === undefined)
      return;

    setPending(true);
    let mockUSDC = new ethers.Contract(
      MockUSDC[chain.id],
      JSON.stringify(USDC_ABI[chain.id]),
      signer
    );

    try {
      let allowance = await mockUSDC.allowance(
        address,
        PozzlenautsONFT[chain.id]
      );
      let decimals = await mockUSDC.decimals();

      let _mintPrice = !flClaimed ? 0 : !glClaimed ? glMintPrice : pMintPrice;

      let isApproved =
        _mintPrice * mintAmount * Math.pow(10, Number(decimals)) <=
        Number(allowance);
      setApproved(isApproved);
      // getMintabeInfo();
    } catch (e) {
      console.log(e);
      Sentry.captureException(e);
    }

    setPending(false);
  }, [
    isConnected,
    chainOn,
    chain,
    address,
    signer,
    flClaimed,
    glClaimed,
    glMintPrice,
    pMintPrice,
    mintAmount,
  ]);

  const handleVerify = (handler) => {
    setVerifyStep(1);
    setVerifyModalVisible(true);
    setReqHandler(handler);

    switch (handler) {
      case HANDLER.APPROVE:
        setVerifyModalContent(
          "You can now mint your NFT! Continue to your wallet to finalise the mint"
        );
        setVerifyModalButton("Continue to wallet");
        break;
      case HANDLER.FREE_MINT:
        setVerifyModalContent(
          "You can now mint your NFT! Continue to your wallet to finalise the mint"
        );
        setVerifyModalButton("Continue to wallet");
        break;
      case HANDLER.GREEN_MINT:
        setVerifyModalContent(
          "You can now mint your NFT! Continue to your wallet to finalise the mint"
        );
        setVerifyModalButton("Continue to wallet");
        break;
      case HANDLER.PUBLIC_MINT:
        setVerifyModalContent(
          "You can now mint your NFT! Continue to your wallet to finalise the mint"
        );
        setVerifyModalButton("Continue to wallet");
        break;
      case HANDLER.DETECT:
        setVerifyModalContent(
          "You can now find your NFT! Continue to find your NFT"
        );
        setVerifyModalButton("Find My NFT");
        break;
      case HANDLER.TRANSFER:
        setVerifyModalContent(
          "You can now transfer your NFT! Continue to transfer your NFT"
        );
        setVerifyModalButton("Transfer My NFT");
        break;
    }
  };

  const handleContinue = () => {
    setVerifyModalVisible(false);
    switch (reqHandler) {
      case HANDLER.APPROVE:
        handleApprove();
        break;
      case HANDLER.FREE_MINT:
        handleFreeMint();
        break;
      case HANDLER.GREEN_MINT:
        handleGreenMint();
        break;
      case HANDLER.PUBLIC_MINT:
        handlePublicMint();
        break;
      case HANDLER.DETECT:
        handleDetect();
        break;
      case HANDLER.TRANSFER:
        handleTransfer();
        break;
    }
  };

  const performVerify = async () => {
    setPendingText("Verifying...");
    setPendingModalVisible(true);
    setVerifyModalVisible(false);
    let rawMessage = `Please sign to let us verify that you are the owner of this address: ${address} \n\n [${new Date(
      Date.now()
    ).toLocaleString("en-US")}]`;

    let signedMessage;
    try {
      signedMessage = await signer.signMessage(rawMessage);
    } catch (e) {
      if (e.code === 4001) {
        toast.warning("The transaction signature was cancelled or denied.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
      }
      setPendingModalVisible(false);
      Sentry.captureException(e);
      return;
    }

    const verified = ethers.utils.verifyMessage(rawMessage, signedMessage);

    if (verified === address) {
      setVerified(true);
      toast.success("You are successfully verified as the owner.", {
        type: toast.TYPE.SUCCESS,
        icon: (
          <Image src="/icon/success.svg" width={24} height={24} alt="success" />
        ),
      });
      setVerifyStep(2);
      setVerifyModalVisible(true);
    } else {
      toast.error("You are not verified as the owner.", {
        type: toast.TYPE.ERROR,
        icon: (
          <Image src="/icon/error.svg" width={24} height={24} alt="error" />
        ),
      });
    }
    setPendingModalVisible(false);
  };

  const cancelVerify = () => {
    setVerifyModalVisible(false);
    toast.warning("The verification was cancelled.", {
      type: toast.TYPE.ERROR,
      icon: <Image src="/icon/error.svg" width={24} height={24} alt="error" />,
    });
  };

  const proceedMint = () => {
    setApproveModalVisible(false);
    if (!flClaimed) {
      handleFreeMint();
    } else if (!glClaimed) {
      handleGreenMint();
    } else {
      handlePublicMint();
    }
  };

  const peformLatestNFTAddress = (_chainId) => {
    let isTest = process.env.ENVIRONMENT === "dev";
    let link = "";
    switch (_chainId) {
      case ChainID.ethereum:
      case ChainID.rinkeby:
      case ChainID.polygon:
      case ChainID.mumbai:
        link = `https://${isTest ? "testnets." : ""
          }opensea.io/assets?search[resultModel]=ASSETS&search[query]=${address}&search[chains][0]=${isTest
            ? ChainList.filter((item) => item.id === _chainId)[0].testnet
            : ChainList.filter((item) => item.id === _chainId)[0].chain
          }`;
        break;
      default:
        link = `https://tofunft.com/user/${address}/items/in-wallet?contract=${_chainId}_${PozzlenautsONFT[_chainId]}&network=${_chainId}`;
        break;
    }
    setLatestNFTAddress(link);
  };

  // isPending ||
  //                 isDisabled ||
  //                 isLimited ||
  //                 !isConnected ||
  //                 !isSupportedChain(chainOn)

  const handleApprove = async () => {
    if (!isConnected) return;
    if (chainOn === -1) return;

    if (!isVerified) {
      handleVerify(HANDLER.APPROVE);
      return;
    }

    setPending(true);
    setApproved(false);
    setPendingText("Pre-Approving USDC...");
    setPendingModalVisible(true);

    let mockUSDC = new ethers.Contract(
      MockUSDC[chainOn],
      JSON.stringify(USDC_ABI[chainOn]),
      signer
    );

    let decimals = await mockUSDC.decimals();

    let _mintPrice = !flClaimed ? 0 : !glClaimed ? glMintPrice : pMintPrice;

    try {
      let balance = await mockUSDC.balanceOf(address);

      if (
        Number(balance) <
        _mintPrice * mintAmount * Math.pow(10, Number(decimals))
      ) {
        toast.error(
          `You don't have enough USDC(${_mintPrice * mintAmount
          } USDC) to approve.`,
          {
            type: toast.TYPE.ERROR,
            icon: (
              <Image src="/icon/error.svg" width={24} height={24} alt="error" />
            ),
          }
        );
      } else {
        try {
          await (
            await mockUSDC.approve(
              PozzlenautsONFT[chainOn],
              (
                _mintPrice *
                mintAmount *
                Math.pow(10, Number(decimals))
              ).toString()
            )
          ).wait();
          setApproveModalVisible(true);
          toast.success(
            `${(
              _mintPrice * mintAmount
            ).toString()} USDC is successfully approved.`,
            {
              type: toast.TYPE.SUCCESS,
              icon: (
                <Image
                  src="/icon/success.svg"
                  width={24}
                  height={24}
                  alt="success"
                />
              ),
            }
          );
          getAllowance();
        } catch (error) {
          if (error.code === 4001 || error.code === "ACTION_REJECTED") {
            toast.error("The transaction signature was cancelled or denied.", {
              type: toast.TYPE.ERROR,
              icon: (
                <Image src="/icon/error.svg" width={24} height={24} alt="error" />
              ),
            });
          } else {
            toast.error("You do not have enough gas to pay the transaction fee.", {
              type: toast.TYPE.ERROR,
              icon: (
                <Image src="/icon/error.svg" width={24} height={24} alt="error" />
              ),
            });
          }
          setApproveModalVisible(false);
          setPendingModalVisible(false);
          setPending(false);
          return;
        }
      }
    } catch (error) {
      setApproveModalVisible(false);
      // console.log("error code is", error.code)

      toast.error("Insufficient USDC balance or internal error.", {
        type: toast.TYPE.ERROR,
        icon: (
          <Image src="/icon/error.svg" width={24} height={24} alt="error" />
        ),
      });

      Sentry.captureException(error);
    }

    setPendingModalVisible(false);
    setPending(false);
  };

  const handleFreeMint = async () => {
    if (!isConnected) return;
    if (chainOn === -1) return;

    if (!isVerified) {
      handleVerify(HANDLER.FREE_MINT);
      return;
    }

    setPending(true);
    setPendingText("Confirming Free Mint...");
    setPendingModalVisible(true);
    let pozzlenautsONFT = new ethers.Contract(
      PozzlenautsONFT[chainOn],
      JSON.stringify(
        chainOn === ChainID.mumbai || chainOn === ChainID.polygon
          ? POZZPoz_ABI
          : POZZ_ABI
      ),
      signer
    );

    const flHashedAddrs = PozzlenautsFreeList.map((addr) => keccak256(addr));

    const flMerkleTree = new MerkleTree(flHashedAddrs, keccak256, {
      sortPairs: true,
    });

    let hashedAddr = keccak256(address);
    let flProof = flMerkleTree.getHexProof(hashedAddr);

    try {
      let tx = await (await pozzlenautsONFT.freeListMint(flProof)).wait();

      let message =
        `Pozzlenaut ` +
        (mintAmount === 1
          ? `#${Number(tx.logs[0].topics[3]).toString()}`
          : `#${Number(tx.logs[0].topics[3] - mintAmount + 1)} to #${Number(
            tx.logs[0].topics[3]
          )}`) +
        " is minted.";

      toast.success(message, {
        type: toast.TYPE.SUCCESS,
        icon: (
          <Image src="/icon/success.svg" width={24} height={24} alt="success" />
        ),
      });
      peformLatestNFTAddress(chainOn);
      setApproved(false);
      setMintModalVisible(true);
    } catch (error) {
      console.log(error);
      if (error.code === 4001) {
        toast.error("The transaction signature was cancelled or denied.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
      } else if (error.code === -32603) {
        if (error.data.message.includes("NOT Freelisted yet")) {
          toast.error("The Address is not freelisted yet.", {
            type: toast.TYPE.ERROR,
            icon: (
              <Image src="/icon/error.svg" width={24} height={24} alt="error" />
            ),
          });
        } else if (error.data.message.includes("Freenlist already claimed")) {
          toast.error("The Freelist is already claimed.", {
            type: toast.TYPE.ERROR,
            icon: (
              <Image src="/icon/error.svg" width={24} height={24} alt="error" />
            ),
          });
        } else {
          toast.error("An error is occurred during the free mint.", {
            type: toast.TYPE.ERROR,
            icon: (
              <Image src="/icon/error.svg" width={24} height={24} alt="error" />
            ),
          });
        }
      } else if (error.message) {
        toast.error("Unfortunately there is an error with the mint, please contact #support at Pozzle Planet.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
      } else {
        toast.error("An error is occurred during the free mint.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
      }
      Sentry.captureException(error);
    }
    getAllowance();
    setPending(false);
    setPendingModalVisible(false);
  };

  const handleGreenMint = async () => {
    if (!isConnected) return;
    if (chainOn === -1) return;

    if (!isVerified) {
      handleVerify(HANDLER.GREEN_MINT);
      return;
    }

    setPending(true);
    setPendingText("Confirming GreenList Mint...");
    setPendingModalVisible(true);
    if (publicDate - Date.now() >= 86400 * 1000) {
      toast.error("GreenList mint is not opened yet.", {
        type: toast.TYPE.ERROR,
        icon: (
          <Image src="/icon/error.svg" width={24} height={24} alt="error" />
        ),
      });
      setApproved(false);
      setPendingModalVisible(false);
      return;
    }

    let pozzlenautsONFT = new ethers.Contract(
      PozzlenautsONFT[chainOn],
      JSON.stringify(
        chainOn === ChainID.mumbai || chainOn === ChainID.polygon
          ? POZZPoz_ABI
          : POZZ_ABI
      ),
      signer
    );

    const wlHashedAddrs = PozzlenautsGreenList.map((addr) => keccak256(addr));

    const glMerkleTree = new MerkleTree(wlHashedAddrs, keccak256, {
      sortPairs: true,
    });

    let hashedAddr = keccak256(address);
    let glProof = glMerkleTree.getHexProof(hashedAddr);

    try {
      let tx = await (await pozzlenautsONFT.greenListMint(glProof)).wait();

      let message =
        `Pozzlenaut ` +
        (mintAmount === 1
          ? `#${Number(tx.logs[0].topics[3]).toString()}`
          : `#${Number(tx.logs[0].topics[3] - mintAmount + 1)} to #${Number(
            tx.logs[0].topics[3]
          )}`) +
        " is minted.";

      toast.success(message, {
        type: toast.TYPE.SUCCESS,
        icon: (
          <Image src="/icon/success.svg" width={24} height={24} alt="success" />
        ),
      });
      peformLatestNFTAddress(chainOn);
      setApproved(false);
      setMintModalVisible(true);
    } catch (error) {
      if (error.code === 4001) {
        toast.error("The transaction signature was cancelled or denied.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
      } else if (error.code === -32603) {
        if (error.data.message.includes("NOT Greenlisted yet")) {
          toast.error("The Address is not Greelisted yet.", {
            type: toast.TYPE.ERROR,
            icon: (
              <Image src="/icon/error.svg" width={24} height={24} alt="error" />
            ),
          });
        } else if (error.data.message.includes("Greenlist already claimed")) {
          toast.error("The Greenlist mint is already claimed.", {
            type: toast.TYPE.ERROR,
            icon: (
              <Image src="/icon/error.svg" width={24} height={24} alt="error" />
            ),
          });
        } else {
          toast.error("An error is occurred during the Greenlist mint.", {
            type: toast.TYPE.ERROR,
            icon: (
              <Image src="/icon/error.svg" width={24} height={24} alt="error" />
            ),
          });
        }
      } else {
        toast.error("An error is occurred during the Greenlist mint.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
      }
      Sentry.captureException(error);
    }
    getAllowance();
    setPending(false);
    setPendingModalVisible(false);
  };

  const handlePublicMint = async () => {
    if (!isConnected) return;
    if (chainOn === -1) return;

    if (!isVerified) {
      handleVerify(HANDLER.PUBLIC_MINT);
      return;
    }

    if (publicDate - Date.now() > 0) {
      toast.error("Public Mint is not opened yet", {
        type: toast.TYPE.ERROR,
        icon: (
          <Image src="/icon/error.svg" width={24} height={24} alt="error" />
        ),
      });
      return;
    }

    setPending(true);
    setPendingText("Confirming Mint...");
    setPendingModalVisible(true);

    try {
      let pozzlenautsONFT = new ethers.Contract(
        PozzlenautsONFT[chainOn],
        JSON.stringify(
          chainOn === ChainID.mumbai || chainOn === ChainID.polygon
            ? POZZPoz_ABI
            : POZZ_ABI
        ),
        signer
      );
      let tx = await (
        await pozzlenautsONFT.publicMint(mintAmount.toString())
      ).wait();

      let message =
        `Pozzlenaut ` +
        (mintAmount === 1
          ? `#${Number(tx.logs[0].topics[3]).toString()}`
          : `#${Number(tx.logs[0].topics[3] - mintAmount + 1)} to #${Number(
            tx.logs[0].topics[3]
          )}`) +
        (mintAmount === 1 ? " is " : " are ") +
        "minted.";

      toast.success(message, {
        type: toast.TYPE.SUCCESS,
        icon: (
          <Image src="/icon/success.svg" width={24} height={24} alt="success" />
        ),
      });
      peformLatestNFTAddress(chainOn);
      setMintModalVisible(true);
      setApproved(false);
    } catch (error) {
      if (error.code === 4001) {
        toast.error("The transaction signature was cancelled or denied.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
      } else {
        toast.error("The transaction signature was failed.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
        // toast.success(
        //   `${mintAmount} Pozzlenaut${mintAmount === 1 ? " is" : " are"
        //   } minted successfully.`,
        //   {
        //     type: toast.TYPE.SUCCESS,
        //     icon: (
        //       <Image
        //         src="/icon/success.svg"
        //         width={24}
        //         height={24}
        //         alt="success"
        //       />
        //     ),
        //   }
        // );
        // peformLatestNFTAddress(chainOn);
        // setApproved(false);
        // setMintModalVisible(true);
      }
      Sentry.captureException(error);
    }
    getAllowance();
    setPending(false);
    setPendingModalVisible(false);
  };

  const handleDetect = () => {
    if (!isConnected) {
      toast.error("Please connect wallet first.", {
        type: toast.TYPE.ERROR,
        icon: (
          <Image src="/icon/error.svg" width={24} height={24} alt="error" />
        ),
      });
      return;
    }

    if (tokenId === "") {
      toast.error("Please input the token number to send.", {
        type: toast.TYPE.ERROR,
        icon: (
          <Image src="/icon/error.svg" width={24} height={24} alt="error" />
        ),
      });
      return;
    }

    if (!isVerified) {
      handleVerify(HANDLER.DETECT);
      return;
    }

    setPending(true);
    setPendingText(`Finding Pozzlenaut #${tokenId}...`);
    setPendingModalVisible(true);

    setChainFrom(-1);
    setDetected(undefined);

    var failCount = 0;
    ChainList.map((item) => {
      if (
        PozzlenautsONFT[item.id] === nullAddress ||
        PozzlenautsONFT[item.id] === undefined
      ) {
        setPendingModalVisible(false);
        return;
      }

      const provider = new ethers.providers.JsonRpcProvider(
        RPC_SERVER[item.id]
      );

      let pozzlenautsONFT = new ethers.Contract(
        PozzlenautsONFT[item.id],
        JSON.stringify(
          item.id === ChainID.mumbai || item.id === ChainID.polygon
            ? POZZPoz_ABI
            : POZZ_ABI
        ),
        provider
      );

      const getOwner = async () => {
        try {
          let _ownerOf = await pozzlenautsONFT.ownerOf(tokenId);
          if (_ownerOf === address) {
            if (item.id === chain.id || chainFrom === item.id)
              setChainFrom(item.id);
            else {
              _switchNetwork(item.id, false);
            }
            setDetected(true);
            setPending(false);
            setPendingModalVisible(false);
          } else {
            failCount++;
            if (failCount === ChainList.length) {
              setDetected(false);
              setPending(false);
              setPendingModalVisible(false);
            }
          }
        } catch (e) {
          failCount++;
          if (failCount === ChainList.length) {
            setDetected(false);
            setPending(false);
            setPendingModalVisible(false);
          }
          console.log(e);
          Sentry.captureException(e);
        }
      };
      getOwner();
    });
  };

  const handleTransfer = async () => {
    let adapterParams = ethers.utils.solidityPack(
      ["uint16", "uint256"],
      [1, 200000]
    );

    if (chainTo === -1) {
      toast.error("Please select the target chain you want to transfer.", {
        type: toast.TYPE.ERROR,
        icon: (
          <Image src="/icon/error.svg" width={24} height={24} alt="error" />
        ),
      });
      return;
    }

    if (tokenId === "") {
      toast.error("Please input the token number to send.", {
        type: toast.TYPE.ERROR,
        icon: (
          <Image src="/icon/error.svg" width={24} height={24} alt="error" />
        ),
      });
      return;
    }

    if (!isVerified) {
      handleVerify(HANDLER.TRANSFER);
      return;
    }

    setPending(true);

    setPendingText(
      `Sending Pozzlenaut #${tokenId} from ${ChainList.find((item) => item.id === chainOn && item).chain
      } to ${ChainList[chainTo].chain} ...`
    );
    setPendingModalVisible(true);

    let pozzlenautsONFT = new ethers.Contract(
      PozzlenautsONFT[chain.id],
      JSON.stringify(
        chain.id === ChainID.mumbai || chain.id === ChainID.polygon
          ? POZZPoz_ABI
          : POZZ_ABI
      ),
      signer
    );

    try {
      await (
        await pozzlenautsONFT.sendFrom(
          address,
          ChainList[chainTo].lzId,
          address,
          tokenId,
          address,
          ethers.constants.AddressZero,
          adapterParams,
          {
            value: ethers.utils.parseEther("0.1"),
          }
        )
      ).wait();
      toast.success(
        "Successfully sent Pozzlenauts " +
        tokenId +
        " from " +
        ChainList[chain.id].chain +
        " to " +
        ChainList[chainTo].chain,
        {
          type: toast.TYPE.SUCCESS,
          icon: (
            <Image
              src="/icon/success.svg"
              width={24}
              height={24}
              alt="success"
            />
          ),
        }
      );
      peformLatestNFTAddress(chainTo);
      setTransferModalVisible(true);
      setTransferText(
        "Congratulations! You have successfully sent a Pozzlenaut NFT!"
      );
    } catch (e) {
      console.log(e);
      if (e.code === 4001)
        toast.error("The transaction signature was cancelled or denied.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
      else if (
        e.code === -32000 ||
        (e.data &&
          e.data.message &&
          e.data.message.match(/insufficient funds/i))
      ) {
        toast.error("Insuffcient funds for gas to transfer your NFT.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
      } else {
        toast.error("The destination chain is not the trusted remote.", {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        });
      }
      Sentry.captureException(e);
    }
    setPending(false);
    setPendingModalVisible(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((loadingStep + 1) % 6);
    }, 120);
    return () => clearInterval(interval);
  }, [loadingStep]);

  useEffect(() => {
    if (chainFrom === -1) {
      setDetected(undefined);
      return;
    }
    _switchNetwork(chainFrom, false);
    setDetected(true);
    return () => { };
  }, [_switchNetwork, chainFrom, switchNetwork]);

  useEffect(() => {
    if (chainOn === -1) return;
    getMintPrice();
    return () => { };
  }, [chainOn, getMintPrice]);

  useEffect(() => {
    setApproved(false);
    getAllowance();
    return () => { };
  }, [chain, getAllowance]);

  useEffect(() => {
    if (chainNewOn === -1) return;
    if (!isConnected) {
      toast.warn("Please connect to wallet first", {
        type: toast.TYPE.WARNING,
        icon: (
          <Image src="/icon/error.svg" width={24} height={24} alt="warning" />
        ),
      });
    }
    setDisabled(true);
    // setDetected(false);
    if (
      MockUSDC[ChainList[chainNewOn].id] === nullAddress ||
      MockUSDC[ChainList[chainNewOn].id] === undefined
    )
      return;
    if (
      PozzlenautsONFT[ChainList[chainNewOn].id] === nullAddress ||
      PozzlenautsONFT[ChainList[chainNewOn].id] === undefined
    )
      return;

    _switchNetwork(ChainList[chainNewOn].id, true);
    setChainNewOn(-1);
    setDisabled(false);
    return () => { };
  }, [address, _switchNetwork, isConnected, chainNewOn]);

  useEffect(() => {
    if (!isConnected) return;

    getMintabeInfo();
    return () => { };
  }, [address, getMintabeInfo, isConnected]);

  useEffect(() => {
    ChainList.map((item) => {
      if (
        PozzlenautsONFT[item.id] === nullAddress ||
        PozzlenautsONFT[item.id] === undefined
      )
        return;

      const provider = new ethers.providers.JsonRpcProvider(
        RPC_SERVER[item.id]
      );

      let pozzlenautsONFT = new ethers.Contract(
        PozzlenautsONFT[item.id],
        JSON.stringify(
          item.id === ChainID.mumbai || item.id === ChainID.polygon
            ? POZZPoz_ABI
            : POZZ_ABI
        ),
        provider
      );

      const getContractData = async () => {
        let maxResult = await pozzlenautsONFT.maxMintId();
        let nextResult = await pozzlenautsONFT.nextMintId();

        switch (item.id) {
          case ChainID.ethereum:
          case ChainID.rinkeby:
            setMaxETHMint(Number(maxResult));
            setNextETHMint(Number(nextResult));
            break;
          case ChainID.polygon:
          case ChainID.mumbai:
            setMaxMATMint(Number(maxResult));
            setNextMATMint(Number(nextResult));
            break;
          case ChainID.avalanche:
          case ChainID.fuji:
            setMaxAVAMint(Number(maxResult));
            setNextAVAMint(Number(nextResult));
            break;
          case ChainID.binance:
          case ChainID["bsc-testnet"]:
            setMaxBSCMint(Number(maxResult));
            setNextBSCMint(Number(nextResult));
            break;
          case ChainID.arbitrum:
          case ChainID["arbitrum-rinkeby"]:
            setMaxARBMint(Number(maxResult));
            setNextARBMint(Number(nextResult));
            break;
          case ChainID.optimism:
          case ChainID["optimism-kovan"]:
            setMaxFANMint(Number(maxResult));
            setNextFANMint(Number(nextResult));
            break;
        }
      };

      getContractData();
    });
    return () => { };
  }, []);

  useEffect(() => {
    const isHash = router.asPath?.split("#");
    if (isHash[1]) {
      setCurrent(isHash[1]);
    }
    return () => { };
  }, [router]);

  useEffect(() => {
    var element = document.getElementsByTagName("body")[0];
    if (!element) {
      return;
    }

    element.style.overflowY = isNFTModalOpen ? "hidden" : "scroll";

    return () => {
      element.style.overflowY = "scroll";
    };
    return () => { };
  }, [isNFTModalOpen]);

  useEffect(() => {
    if (mintedCount >= 3) {
      setLimited(true);
      toast.error(
        "Maximum number of mints has been reached with this wallet. Please connect a different wallet to mint again",
        {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        }
      );
    } else {
      setLimited(false);
    }
    return () => { };
  }, [mintedCount]);

  useEffect(() => {
    if (isDetected) {
      try {
        toast.success(
          // `Pozzlenaut #${tokenId} is detected in ${ChainList.find((item) => item.id === chainFrom && item).chain}`
          `Network successfully switched to ${ChainList.find((item) => item.id === chainFrom && item).chain}`,
          {
            type: toast.TYPE.SUCCESS,
            icon: (
              <Image
                src="/icon/success.svg"
                width={24}
                height={24}
                alt="success"
              />
            ),
          }
        );
      } catch (e) {
        setDetected(undefined);
        Sentry.captureException(e);
      }
    } else if (isDetected === false) {
      toast.error(
        `Pozzlenaut #${tokenId} seems to not exist or you are not the owner of the NFT.`,
        {
          type: toast.TYPE.ERROR,
          icon: (
            <Image src="/icon/error.svg" width={24} height={24} alt="error" />
          ),
        }
      );
    } else {
    }
    return () => { };
  }, [chainFrom, isDetected, tokenId]);

  return (
    <div className="mint">
      <div className="mint-cover">
        <div className="content">
          <Image
            className="logo-title"
            src="/img/nfts/logo.png"
            alt="logo"
            width={600}
            height={120}
          ></Image>
          <div className="board">
            {ChainList.map((item, idx) => {
              let result = 0;
              switch (item.id) {
                case ChainID.ethereum:
                case ChainID.rinkeby:
                  result = maxETHMint - nextETHMint + 1;
                  break;
                case ChainID.polygon:
                case ChainID.mumbai:
                  result = maxMATMint - nextMATMint + 1;
                  break;
                case ChainID.avalanche:
                case ChainID.fuji:
                  result = maxAVAMint - nextAVAMint + 1;
                  break;
                case ChainID.binance:
                case ChainID["bsc-testnet"]:
                  result = maxBSCMint - nextBSCMint + 1;
                  break;
                case ChainID.arbitrum:
                case ChainID["arbitrum-rinkeby"]:
                  result = maxARBMint - nextARBMint + 1;
                  break;
                case ChainID.optimism:
                case ChainID["optimism-kovan"]:
                  result = maxFANMint - nextFANMint + 1;
                  break;
              }
              return (
                <div className="item" key={idx}>
                  <Image src={item.thumb} alt="thumb" width={94} height={102} />
                  <div
                    className="price"
                    style={{ background: `${item.color}0D` }}
                  >
                    <div
                      className="icon-container"
                      style={{
                        width: "32px",
                        height: "32px",
                        background: `${item.color}33`,
                      }}
                    >
                      <Image
                        src={item.logo}
                        alt="logo"
                        width={24}
                        height={24}
                      />
                    </div>
                    {result}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="group">
            <div className="text">
              <p>
                POZZLENAUTS are transmogrified earthlings with special powers to
                mine $POZ from Pozzle Planet. They are the first omnichain NFTs
                with environmental &amp; social impact.
              </p>
              <p>
                You will be able to use and transfer your POZZLENAUT on any
                blockchain using Layer Zero.
              </p>
            </div>
            <div className="special w-100">
              <div className="section w-100">
                <p>+ $POZ POWER PACK</p>
                <p>
                  Receive $POZ tokens that are linked to your NFT and unlock in
                  the future
                </p>
              </div>
              <div className="section w-100">
                <p>+ STAKING BONUS</p>
                <p>
                  Staking multiplier + increased yield based on your
                  POZZLENAUT&apos;s $POZ Power
                </p>
              </div>
            </div>
          </div>
          <p className="cost">Mint Price $199</p>
          <div className="special w-100">
            <a className="w-100">
              <Button
                className="w-100"
                hasBorder
                onClick={() => setNFTModalOpen(true)}
              >
                MINT NOW
              </Button>
            </a>
            <a className="w-100">
              <Button
                className="w-100"
                variant="purple"
                onClick={() => setNFTModalOpen(true)}
              >
                Transfer
              </Button>
            </a>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isNFTModalOpen}
        onClose={() => setNFTModalOpen(false)}
        className="mint-modal"
      >
        <div className="closeButton" onClick={() => setNFTModalOpen(false)}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 2L9 9M9 9L16 16M9 9L16 2M9 9L2 16"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="switch d-flex justify-content-between">
          <button
            className={`${current === routerLink[0] ? "active" : ""} w-50`}
            onClick={() => router.push(`/#${routerLink[0]}`)}
          >
            {" "}
            Mint
          </button>
          <button
            className={`${current === routerLink[1] ? "active" : ""} w-50`}
            onClick={() => router.push(`/#${routerLink[1]}`)}
          >
            Transfer
          </button>
        </div>
        {!isConnected && (
          <Column className="connect-notify">
            <Column gap="16px" align="center" className="verify-content">
              <Column gap="8px" align="center">
                <Text size="18px" color="#25174E" align="center" weight="bold">
                  Wallet Not Connected
                </Text>
                <Text size="14px" color="#25174E8C" align="center">
                  To mint and transfer a Pozzle Planet NFT, you need to first
                  connect your wallet
                </Text>
              </Column>
              <Column gap="8px" align="center">
                <ConnectButton label="Connect" />
                {/* <Button variant="purple" onClick={connect}>
                  Connect
                </Button> */}
              </Column>
            </Column>
          </Column>
        )}
        {current === routerLink[0] && (
          <>
            <Text family="DrukWide" align="center" className="sub-title">
              CHOOSE A BLOCKCHAIN TO MINT ON
            </Text>
            <Row align="center" gap="24px" className="chain-list">
              {ChainList.map((item, idx) => {
                let result = 0;
                switch (item.id) {
                  case ChainID.ethereum:
                  case ChainID.rinkeby:
                    result = maxETHMint - nextETHMint + 1;
                    break;
                  case ChainID.polygon:
                  case ChainID.mumbai:
                    result = maxMATMint - nextMATMint + 1;
                    break;
                  case ChainID.avalanche:
                  case ChainID.fuji:
                    result = maxAVAMint - nextAVAMint + 1;
                    break;
                  case ChainID.binance:
                  case ChainID["bsc-testnet"]:
                    result = maxBSCMint - nextBSCMint + 1;
                    break;
                  case ChainID.arbitrum:
                  case ChainID["arbitrum-rinkeby"]:
                    result = maxARBMint - nextARBMint + 1;
                    break;
                  case ChainID.optimism:
                  case ChainID["optimism-kovan"]:
                    result = maxFANMint - nextFANMint + 1;
                    break;
                }
                return (
                  <Column key={idx} gap="8px" className="chain-item">
                    <div
                      className="icon-container"
                      onClick={() => setChainNewOn(idx)}
                      style={{
                        width: "72px",
                        height: "72px",
                        cursor: "pointer",
                        border:
                          chainOn === ChainList[idx].id
                            ? `1px solid  ${item.color}33`
                            : "1px solid rgba(255, 255, 255, 0.1)",
                        background:
                          chainOn !== ChainList[idx].id
                            ? "none"
                            : `${item.color}33`,
                      }}
                    >
                      <Image
                        src={
                          chainOn !== ChainList[idx].id
                            ? `${item.logo.split(".")[0]}-white.svg`
                            : item.logo
                        }
                        alt="logo"
                        width={44}
                        height={44}
                      />
                    </div>
                    <Text
                      align="center"
                      size="16px"
                      color={
                        chainOn === ChainList[idx].id ? "white" : "#F8F8F878"
                      }
                      // color={"#F8F8F878"}
                      family="sans-serif"
                    >
                      {result}
                    </Text>
                    <Text
                      align="center"
                      size="12px"
                      style={{ minHeight: "20px" }}
                      color={
                        chainOn === ChainList[idx].id ? "white" : "#F8F8F878"
                      }
                    // color={"#F8F8F878"}
                    >
                      {item.chain}
                    </Text>
                  </Column>
                );
              })}
            </Row>
            <Text className="cost">
              Mint Price $
              {!flClaimed ? 0 : !glClaimed ? glMintPrice : pMintPrice}
            </Text>
            <Text size="16px" transform="uppercase">
              Choose amount to mint
            </Text>
            <Row align="center" gap="24px">
              <Button
                className={`flex justify-content-center items-center btns btn-counter`}
                disabled={mintAmount <= 1}
                clickHandler={() =>
                  setMintAmount(mintAmount > 1 ? mintAmount - 1 : mintAmount)
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 10h24v4h-24z" />
                </svg>
              </Button>
              <Text
                size="36px"
                family="sans-serif"
                align="center"
                style={{ minWidth: "48px" }}
              >
                {mintAmount}
              </Text>
              <Button
                className="flex justify-content-center items-center btns btn-counter"
                disabled={
                  isLimited ||
                  mintAmount === maxAmount - mintedCount ||
                  mintAmount >= 3 ||
                  !flClaimed ||
                  !glClaimed
                }
                clickHandler={() =>
                  setMintAmount(mintAmount < 3 ? mintAmount + 1 : mintAmount)
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" />
                </svg>
              </Button>
            </Row>
            {!flClaimed ? (
              <Button
                className="btns btn-control"
                variant="purple"
                disabled={
                  isPending ||
                  isDisabled ||
                  flClaimed ||
                  !isConnected ||
                  !isSupportedChain(chainOn)
                }
                onClick={handleFreeMint}
              >
                {isPending ? <Loader /> : "Free Mint"}
              </Button>
            ) : !isApproved ? (
              <Button
                className="btns btn-control"
                variant="purple"
                disabled={
                  isPending ||
                  isDisabled ||
                  isLimited ||
                  !isConnected ||
                  !isSupportedChain(chainOn)
                }
                onClick={handleApprove}
              >
                {isPending ? <Loader /> : "Continue"}
              </Button>
            ) : !glClaimed ? (
              <Button
                className="btns btn-control"
                variant="purple"
                disabled={
                  isPending ||
                  isDisabled ||
                  glClaimed ||
                  !isConnected ||
                  !isSupportedChain(chainOn)
                }
                onClick={handleGreenMint}
              >
                {isPending ? <Loader /> : "Green Mint"}
              </Button>
            ) : (
              <Button
                className="btns btn-control"
                variant="purple"
                disabled={
                  isPending ||
                  isDisabled ||
                  isLimited ||
                  !isConnected ||
                  !isSupportedChain(chainOn)
                }
                onClick={handlePublicMint}
              >
                {isPending ? <Loader /> : "Mint"}
              </Button>
            )}
            <Text
              size="14px"
              color="rgba(248, 248, 248, 0.7)"
              style={{ marginTop: "-8px", textAlign: "center" }}
            >
              NOTE: YOUR WALLET MUST FIRST BE CONNECTED TO CORRECT CHAIN
            </Text>
          </>
        )}
        {current === routerLink[1] && (
          <>
            <Text family="DrukWide" align="center" className="sub-title">
              CHOOSE A BLOCKCHAIN TO TRANSFER YOUR OMNICHAIN NFT TO
            </Text>
            <Row align="center" gap="24px" className="chain-list">
              {ChainList.map((item, idx) => {
                let result = 0;
                switch (item.id) {
                  case ChainID.ethereum:
                  case ChainID.rinkeby:
                    result = maxETHMint - nextETHMint + 1;
                    break;
                  case ChainID.polygon:
                  case ChainID.mumbai:
                    result = maxMATMint - nextMATMint + 1;
                    break;
                  case ChainID.avalanche:
                  case ChainID.fuji:
                    result = maxAVAMint - nextAVAMint + 1;
                    break;
                  case ChainID.binance:
                  case ChainID["bsc-testnet"]:
                    result = maxBSCMint - nextBSCMint + 1;
                    break;
                  case ChainID.arbitrum:
                  case ChainID["arbitrum-rinkeby"]:
                    result = maxARBMint - nextARBMint + 1;
                    break;
                  case ChainID.optimism:
                  case ChainID["optimism-kovan"]:
                    result = maxFANMint - nextFANMint + 1;
                    break;
                }
                return (
                  <Column key={idx} gap="8px" className="chain-item">
                    <div
                      className="icon-container"
                      onClick={() => setChainTo(idx)}
                      style={{
                        width: "72px",
                        height: "72px",
                        cursor: "pointer",
                        border:
                          chainTo === idx
                            ? `1px solid  ${item.color}33`
                            : "1px solid rgba(255, 255, 255, 0.1)",
                        background:
                          chainTo !== idx ? "none" : `${item.color}33`,
                      }}
                    >
                      <Image
                        src={
                          chainTo !== idx
                            ? `${item.logo.split(".")[0]}-white.svg`
                            : item.logo
                        }
                        alt="logo"
                        width={44}
                        height={44}
                      />
                    </div>
                    {/* <Text
                      align="center"
                      size="16px"
                      color={chainTo === idx ? "white" : "#F8F8F878"}
                      // color={"#F8F8F878"}
                      family="sans-serif"
                    >
                      {result}
                    </Text> */}
                    <Text
                      align="center"
                      size="12px"
                      style={{ minHeight: "20px" }}
                      color={chainTo === idx ? "white" : "#F8F8F878"}
                    // color={"#F8F8F878"}
                    >
                      {item.chain}
                    </Text>
                  </Column>
                );
              })}
            </Row>
            <Text size="16px">ENTER TOKEN ID</Text>
            <Input
              type="number"
              placeholder="TOKEN ID"
              size="16px"
              align="center"
              value={tokenId}
              onChange={(e) => {
                setDetected(undefined);
                setTokenId(e.target.value);
              }}
              style={{ marginTop: "-8px", maxWidth: "480px" }}
            />
            {!isConnected ? (
              <Button
                className="btns btn-control"
                variant="purple"
                disabled={isPending}
                onClick={connect}
              >
                {isPending ? <Loader /> : "Connect"}
              </Button>
            ) : !isDetected || isDetected === undefined ? (
              <Button
                className="btns btn-control"
                variant="purple"
                disabled={isPending}
                onClick={handleDetect}
              >
                {isPending ? <Loader /> : "Find My NFT"}
              </Button>
            ) : (
              <Button
                className="btns btn-control"
                variant="purple"
                disabled={isPending}
                onClick={handleTransfer}
              >
                {isPending ? <Loader /> : "Transfer"}
              </Button>
            )}
            <Text
              size="14px"
              color="rgba(248, 248, 248, 0.7)"
              align="center"
              style={{ marginTop: "-8px" }}
            >
              NOTE: MUST BE CONNECTED TO CORRECT CHAIN
            </Text>
          </>
        )}
      </Modal>
      <Modal isOpen={isPendingModalVisible} className="pending-modal">
        <Column gap="16px" align="center" className="pending-content">
          <Text size="24px" color="#25174E" align="center">
            {pendingText}
          </Text>
          <svg
            width="80"
            height="81"
            viewBox="0 0 80 81"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity={loadingOpacity[(loadingStep + 0) % 6]}
              d="M38.719 10.8608C38.719 9.92178 37.9358 9.16745 37.0011 9.25727C27.5953 10.1612 19.4025 15.2171 14.2774 22.5704C13.7459 23.3329 14.0077 24.374 14.8106 24.8423L22.0309 29.0542C22.5452 29.3541 23.1811 29.3541 23.6954 29.0542L37.8996 20.7684C38.407 20.4724 38.719 19.9291 38.719 19.3417V10.8608Z"
              fill="#25174E"
            />
            <path
              opacity={loadingOpacity[(loadingStep + 1) % 6]}
              d="M13.6686 54.1487C12.8548 54.6234 11.8055 54.3238 11.4156 53.4662C9.61889 49.5129 8.61816 45.1211 8.61816 40.4956C8.61816 35.8702 9.61889 31.4784 11.4156 27.5251C11.8054 26.6675 12.8548 26.3679 13.6686 26.8426L20.6816 30.9336C21.189 31.2295 21.501 31.7728 21.501 32.3602V48.6311C21.501 49.2185 21.189 49.7617 20.6816 50.0577L13.6686 54.1487Z"
              fill="#25174E"
            />
            <path
              opacity={loadingOpacity[(loadingStep + 2) % 6]}
              d="M38.6785 70.1357C38.6785 71.0747 37.8953 71.829 36.9606 71.7392C27.5548 70.8353 19.362 65.7794 14.2368 58.4261C13.7054 57.6636 13.9672 56.6225 14.77 56.1542L21.9904 51.9423C22.5047 51.6423 23.1406 51.6423 23.6548 51.9423L37.859 60.2281C38.3665 60.5241 38.6785 61.0673 38.6785 61.6548V70.1357Z"
              fill="#25174E"
            />
            <path
              opacity={loadingOpacity[(loadingStep + 3) % 6]}
              d="M65.2292 56.1461C66.0321 56.6144 66.2939 57.6556 65.7624 58.418C60.6373 65.7713 52.4445 70.8272 43.0387 71.7311C42.104 71.821 41.3208 71.0666 41.3208 70.1276V61.6467C41.3208 61.0593 41.6328 60.516 42.1402 60.22L56.3444 51.9343C56.8587 51.6343 57.4946 51.6343 58.0089 51.9342L65.2292 56.1461Z"
              fill="#25174E"
            />
            <path
              opacity={loadingOpacity[(loadingStep + 4) % 6]}
              d="M66.3305 26.8429C67.1443 26.3682 68.1936 26.6677 68.5834 27.5254C70.3802 31.4787 71.3809 35.8704 71.3809 40.4959C71.3809 45.1214 70.3802 49.5131 68.5834 53.4664C68.1936 54.3241 67.1443 54.6236 66.3305 54.1489L59.3175 50.058C58.8101 49.762 58.498 49.2188 58.498 48.6313V32.3605C58.498 31.773 58.8101 31.2298 59.3175 30.9338L66.3305 26.8429Z"
              fill="#25174E"
            />
            <path
              opacity={loadingOpacity[(loadingStep + 5) % 6]}
              d="M41.3208 10.8638C41.3208 9.92477 42.104 9.17044 43.0387 9.26026C52.4445 10.1642 60.6373 15.2201 65.7624 22.5733C66.2939 23.3358 66.0321 24.3769 65.2293 24.8453L58.0089 29.0571C57.4946 29.3571 56.8587 29.3571 56.3444 29.0571L42.1402 20.7714C41.6328 20.4754 41.3208 19.9321 41.3208 19.3447V10.8638Z"
              fill="#25174E"
            />
            <path
              d="M38.3354 23.1336C39.364 22.5337 40.6358 22.5337 41.6643 23.1336L54.2169 30.456C55.2317 31.0479 55.8558 32.1344 55.8558 33.3093V47.6828C55.8558 48.8577 55.2317 49.9442 54.2169 50.5361L41.6643 57.8585C40.6358 58.4584 39.364 58.4584 38.3355 57.8585L25.7829 50.5361C24.7681 49.9442 24.144 48.8577 24.144 47.6828V33.3093C24.144 32.1344 24.7681 31.0479 25.7829 30.456L38.3354 23.1336Z"
              fill="#25174E"
            />
          </svg>
        </Column>
      </Modal>
      <Modal isOpen={isVerifyModalVisible} className="verify-modal">
        {verifyStep === 1 && (
          <Column gap="16px" align="center" className="verify-content">
            <Column gap="8px" align="center">
              <Text size="14px" color="#25174E8C" align="center">
                Step 1 / 2
              </Text>
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.6276 43.9856H33.3932C34.0211 44.0354 34.6527 43.9559 35.2487 43.752C35.8447 43.5481 36.3926 43.2242 36.8586 42.8002C37.704 41.7644 38.1137 40.4406 38.0013 39.1083V24.9232C38.111 23.5999 37.7018 22.2859 36.8604 21.2588C36.3944 20.8348 35.8465 20.5109 35.2505 20.307C34.6544 20.1031 34.0229 20.0236 33.395 20.0734H14.6276C14.0013 20.0253 13.3719 20.1056 12.7778 20.3094C12.1837 20.5132 11.6376 20.8363 11.1728 21.2588C10.3236 22.2823 9.90901 23.5977 10.0177 24.9232V39.1083C9.90668 40.4416 10.3212 41.7656 11.1728 42.7976C11.6374 43.2205 12.1834 43.5441 12.7775 43.7483C13.3716 43.9526 14.0012 44.0334 14.6276 43.9856ZM15.0345 40.6188C14.8483 40.6331 14.661 40.6097 14.484 40.5502C14.3069 40.4907 14.1436 40.3961 14.0038 40.2723C13.7429 39.9468 13.6195 39.5323 13.6599 39.1171V24.9241C13.6391 24.7199 13.6587 24.5137 13.7177 24.3171C13.7767 24.1206 13.8739 23.9376 14.0038 23.7787C14.2897 23.5353 14.6602 23.4149 15.0345 23.4437H33.0271C33.2078 23.4299 33.3894 23.4525 33.5612 23.51C33.7331 23.5675 33.8917 23.6589 34.0276 23.7787C34.2833 24.1027 34.4031 24.5134 34.3617 24.9241V39.1083C34.4009 39.5217 34.2814 39.9346 34.0276 40.2634C33.8934 40.3864 33.7353 40.4807 33.5632 40.5403C33.3912 40.5999 33.2087 40.6236 33.0271 40.6099L15.0345 40.6188ZM13.6208 21.7564H17.2089V14.9393C17.1623 13.5081 17.4845 12.0889 18.1445 10.8181C18.7149 9.75454 19.5784 8.87689 20.6325 8.28926C21.6743 7.72913 22.8387 7.43595 24.0215 7.43595C25.2043 7.43595 26.3687 7.72913 27.4105 8.28926C28.4587 8.88025 29.317 9.75737 29.8851 10.8181C30.5429 12.0895 30.8627 13.5087 30.8137 14.9393V21.759H34.4053V15.3374C34.4406 13.6343 34.1499 11.9401 33.5487 10.3463C33.0588 9.05572 32.2993 7.88444 31.321 6.91056C30.3427 5.93668 29.168 5.18258 27.8752 4.69857C25.3856 3.76714 22.6432 3.76714 20.1536 4.69857C18.9123 5.16625 17.7796 5.88256 16.825 6.80358C15.8022 7.80389 15.0054 9.01155 14.4881 10.3454C13.881 11.9379 13.5872 13.6326 13.6226 15.3365L13.6208 21.7564Z"
                  fill="#25174E"
                />
              </svg>
              <Text size="18px" color="#25174E" align="center" weight="bold">
                Verify Address
              </Text>
              <Text size="14px" color="#25174E8C" align="center">
                You will be asked to sign a message so that we can verify you as
                the owner of the address.
              </Text>
            </Column>
            <Column gap="8px" align="center" className="button-group-mint-modal">
              <Button variant="purple" onClick={performVerify}>
                Verify
              </Button>
              <Button variant="white" onClick={cancelVerify}>
                Cancel
              </Button>
            </Column>
          </Column>
        )}
        {verifyStep === 2 && (
          <Column gap="16px" align="center" className="verify-content">
            <Column gap="8px" align="center">
              <Text size="14px" color="#25174E8C" align="center">
                Step 2 / 2
              </Text>
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.6276 43.9856H33.3932C34.0211 44.0354 34.6527 43.9559 35.2487 43.752C35.8447 43.5481 36.3926 43.2242 36.8586 42.8002C37.704 41.7644 38.1137 40.4406 38.0013 39.1083V24.9232C38.111 23.5999 37.7018 22.2859 36.8604 21.2588C36.3944 20.8348 35.8465 20.5109 35.2505 20.307C34.6544 20.1031 34.0229 20.0236 33.395 20.0734H14.6276C14.0013 20.0253 13.3719 20.1056 12.7778 20.3094C12.1837 20.5132 11.6376 20.8363 11.1728 21.2588C10.3236 22.2823 9.90901 23.5977 10.0177 24.9232V39.1083C9.90668 40.4416 10.3212 41.7656 11.1728 42.7976C11.6374 43.2205 12.1834 43.5441 12.7775 43.7483C13.3716 43.9526 14.0012 44.0334 14.6276 43.9856ZM15.0345 40.6188C14.8483 40.6331 14.661 40.6097 14.484 40.5502C14.3069 40.4907 14.1436 40.3962 14.0038 40.2723C13.7429 39.9468 13.6195 39.5323 13.6599 39.1171V24.9241C13.6391 24.7199 13.6587 24.5137 13.7177 24.3171C13.7767 24.1206 13.8739 23.9376 14.0038 23.7787C14.2897 23.5353 14.6602 23.4149 15.0345 23.4437H33.0271C33.2078 23.4299 33.3894 23.4525 33.5612 23.51C33.7331 23.5675 33.8917 23.6589 34.0276 23.7787C34.2833 24.1027 34.4031 24.5134 34.3617 24.9241V39.1083C34.4009 39.5217 34.2814 39.9346 34.0276 40.2634C33.8934 40.3864 33.7353 40.4807 33.5632 40.5403C33.3912 40.5999 33.2087 40.6236 33.0271 40.6099L15.0345 40.6188ZM13.6208 21.7564H17.2089V14.9393C17.1623 13.5081 17.4845 12.0889 18.1445 10.8181C18.7149 9.75454 19.5784 8.87689 20.6325 8.28926C21.6743 7.72913 22.8387 7.43595 24.0215 7.43595C25.2043 7.43595 26.3687 7.72913 27.4105 8.28926C28.4587 8.88025 29.317 9.75737 29.8851 10.8181C30.5429 12.0895 30.8627 13.5087 30.8137 14.9393V15.9632C30.8137 16.955 31.6177 17.759 32.6095 17.759C33.6012 17.759 34.4053 16.955 34.4053 15.9632V15.3374C34.4406 13.6343 34.1499 11.9401 33.5487 10.3463C33.0588 9.05572 32.2993 7.88444 31.321 6.91056C30.3427 5.93668 29.168 5.18258 27.8752 4.69857C25.3856 3.76714 22.6432 3.76714 20.1536 4.69857C18.9123 5.16625 17.7796 5.88256 16.825 6.80358C15.8022 7.80389 15.0054 9.01155 14.4881 10.3454C13.881 11.9379 13.5872 13.6326 13.6226 15.3365L13.6208 21.7564Z"
                  fill="#25174E"
                />
              </svg>
              <Text size="18px" color="#25174E" align="center" weight="bold">
                Verification Success!
              </Text>
              <Text size="14px" color="#25174E8C" align="center">
                {verfiyModalContent}
              </Text>
            </Column>
            <Column gap="8px" align="center" className="button-group-mint-modal">
              <Button variant="purple" onClick={handleContinue}>
                {verifyModalButton}
              </Button>
            </Column>
          </Column>
        )}
      </Modal>
      <Modal isOpen={isApproveModalVisible} className="verify-modal">
        <Column gap="16px" align="center" className="verify-content">
          <Column gap="8px" align="center">
            <Text size="14px" color="#25174E8C" align="center">
              Step 1 / 2
            </Text>
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.6276 43.9856H33.3932C34.0211 44.0354 34.6527 43.9559 35.2487 43.752C35.8447 43.5481 36.3926 43.2242 36.8586 42.8002C37.704 41.7644 38.1137 40.4406 38.0013 39.1083V24.9232C38.111 23.5999 37.7018 22.2859 36.8604 21.2588C36.3944 20.8348 35.8465 20.5109 35.2505 20.307C34.6544 20.1031 34.0229 20.0236 33.395 20.0734H14.6276C14.0013 20.0253 13.3719 20.1056 12.7778 20.3094C12.1837 20.5132 11.6376 20.8363 11.1728 21.2588C10.3236 22.2823 9.90901 23.5977 10.0177 24.9232V39.1083C9.90668 40.4416 10.3212 41.7656 11.1728 42.7976C11.6374 43.2205 12.1834 43.5441 12.7775 43.7483C13.3716 43.9526 14.0012 44.0334 14.6276 43.9856ZM15.0345 40.6188C14.8483 40.6331 14.661 40.6097 14.484 40.5502C14.3069 40.4907 14.1436 40.3961 14.0038 40.2723C13.7429 39.9468 13.6195 39.5323 13.6599 39.1171V24.9241C13.6391 24.7199 13.6587 24.5137 13.7177 24.3171C13.7767 24.1206 13.8739 23.9376 14.0038 23.7787C14.2897 23.5353 14.6602 23.4149 15.0345 23.4437H33.0271C33.2078 23.4299 33.3894 23.4525 33.5612 23.51C33.7331 23.5675 33.8917 23.6589 34.0276 23.7787C34.2833 24.1027 34.4031 24.5134 34.3617 24.9241V39.1083C34.4009 39.5217 34.2814 39.9346 34.0276 40.2634C33.8934 40.3864 33.7353 40.4807 33.5632 40.5403C33.3912 40.5999 33.2087 40.6236 33.0271 40.6099L15.0345 40.6188ZM13.6208 21.7564H17.2089V14.9393C17.1623 13.5081 17.4845 12.0889 18.1445 10.8181C18.7149 9.75454 19.5784 8.87689 20.6325 8.28926C21.6743 7.72913 22.8387 7.43595 24.0215 7.43595C25.2043 7.43595 26.3687 7.72913 27.4105 8.28926C28.4587 8.88025 29.317 9.75737 29.8851 10.8181C30.5429 12.0895 30.8627 13.5087 30.8137 14.9393V21.759H34.4053V15.3374C34.4406 13.6343 34.1499 11.9401 33.5487 10.3463C33.0588 9.05572 32.2993 7.88444 31.321 6.91056C30.3427 5.93668 29.168 5.18258 27.8752 4.69857C25.3856 3.76714 22.6432 3.76714 20.1536 4.69857C18.9123 5.16625 17.7796 5.88256 16.825 6.80358C15.8022 7.80389 15.0054 9.01155 14.4881 10.3454C13.881 11.9379 13.5872 13.6326 13.6226 15.3365L13.6208 21.7564Z"
                fill="#25174E"
              />
            </svg>
            <Text size="18px" color="#25174E" align="center" weight="bold">
              Spending Pre-Approval Succeeded!
            </Text>
            <Text size="14px" color="#25174E8C" align="center">
              Your wallet pre-approved a USDC amount to spend on minting.
            </Text>
            <Text size="14px" color="#25174E8C" align="center">
              You can now mint your NFT.
            </Text>
            <Text size="14px" color="#25174E8C" align="center">
              Proceed to finalise the minting of your NFT!
            </Text>
          </Column>
          <Column gap="8px" align="center" className="button-group-mint-modal">
            <Button variant="purple" onClick={proceedMint}>
              Proceed to Mint
            </Button>
            <Button
              variant="white"
              onClick={() => setApproveModalVisible(false)}
            >
              Close
            </Button>
          </Column>
        </Column>
      </Modal>
      <Modal isOpen={isMintModalVisible} className="verify-modal">
        <Column gap="16px" align="center" className="verify-content">
          <Column gap="8px" align="center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.6254 31.8394L33.5096 19.9597C34.1348 19.3347 34.1347 18.3213 33.5095 17.6964L32.9434 17.1306C32.3186 16.5061 31.3059 16.5061 30.6811 17.1307L21.6254 26.1833C21.0006 26.8079 19.988 26.8079 19.3631 26.1834L15.9645 22.7865C15.3397 22.162 14.3271 22.162 13.7023 22.7865L13.1362 23.3523C12.5109 23.9772 12.5109 24.9908 13.1362 25.6157L19.3632 31.8394C19.988 32.4639 21.0006 32.4639 21.6254 31.8394Z"
                fill="#25174E"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M32.9706 43.3333L43.376 32.9333C43.7763 32.5333 44.0208 31.9556 43.9986 31.3778V16.6222C44.0015 16.3296 43.946 16.0393 43.8353 15.7684C43.7246 15.4975 43.5609 15.2514 43.3538 15.0444L32.9484 4.64444C32.526 4.24445 31.9701 4 31.3698 4H16.6288C16.0507 4 15.4726 4.24444 15.0502 4.66666L4.64478 15.0667C4.24457 15.4889 4 16.0444 4 16.6444V31.3778C4 31.9556 4.24457 32.5333 4.64478 32.9333L15.0724 43.3556C15.4726 43.7556 16.0507 44 16.6288 44H31.392C31.9701 44 32.5482 43.7556 32.9706 43.3333ZM30.4582 8.44444L39.5741 17.5556V30.4444L30.4582 39.5556H17.5626L8.44676 30.4444V17.5556L17.5626 8.44444H30.4582Z"
                fill="#25174E"
              />
            </svg>
            <Text size="18px" color="#25174E" align="center" weight="bold">
              NFT Mint Succeeded!
            </Text>
            <Text size="14px" color="#25174E8C" align="center">
              Congratulations! You have successfully minted a Pozzlenaut NFT!
            </Text>
            <Text size="14px" color="#25174E8C" align="center">
              Your NFT is now viewable on NFT marketplaces.
            </Text>
          </Column>
          <Column gap="8px" align="center" className="button-group-mint-modal">
            <a href={latestNFTAddress} target="_blank" rel="noreferrer">
              <Button variant="purple">View NFT</Button>
            </a>
            <Button variant="white" onClick={() => setMintModalVisible(false)}>
              Close
            </Button>
          </Column>
        </Column>
      </Modal>
      <Modal isOpen={isTransferModalVisible} className="verify-modal">
        <Column gap="16px" align="center" className="verify-content">
          <Column gap="8px" align="center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.6254 31.8394L33.5096 19.9597C34.1348 19.3347 34.1347 18.3213 33.5095 17.6964L32.9434 17.1306C32.3186 16.5061 31.3059 16.5061 30.6811 17.1307L21.6254 26.1833C21.0006 26.8079 19.988 26.8079 19.3631 26.1834L15.9645 22.7865C15.3397 22.162 14.3271 22.162 13.7023 22.7865L13.1362 23.3523C12.5109 23.9772 12.5109 24.9908 13.1362 25.6157L19.3632 31.8394C19.988 32.4639 21.0006 32.4639 21.6254 31.8394Z"
                fill="#25174E"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M32.9706 43.3333L43.376 32.9333C43.7763 32.5333 44.0208 31.9556 43.9986 31.3778V16.6222C44.0015 16.3296 43.946 16.0393 43.8353 15.7684C43.7246 15.4975 43.5609 15.2514 43.3538 15.0444L32.9484 4.64444C32.526 4.24445 31.9701 4 31.3698 4H16.6288C16.0507 4 15.4726 4.24444 15.0502 4.66666L4.64478 15.0667C4.24457 15.4889 4 16.0444 4 16.6444V31.3778C4 31.9556 4.24457 32.5333 4.64478 32.9333L15.0724 43.3556C15.4726 43.7556 16.0507 44 16.6288 44H31.392C31.9701 44 32.5482 43.7556 32.9706 43.3333ZM30.4582 8.44444L39.5741 17.5556V30.4444L30.4582 39.5556H17.5626L8.44676 30.4444V17.5556L17.5626 8.44444H30.4582Z"
                fill="#25174E"
              />
            </svg>
            <Text size="18px" color="#25174E" align="center" weight="bold">
              NFT Transfer Succeeded!
            </Text>
            <Text size="14px" color="#25174E8C" align="center">
              {transferText}
            </Text>
            <Text size="14px" color="#25174E8C" align="center">
              Your NFT is now viewable on NFT marketplaces.
            </Text>
          </Column>
          <Column gap="8px" align="center" className="button-group-mint-modal">
            <a href={latestNFTAddress} target="_blank" rel="noreferrer">
              <Button variant="purple">View NFT</Button>
            </a>
            <Button
              variant="white"
              onClick={() => setTransferModalVisible(false)}
            >
              Close
            </Button>
          </Column>
        </Column>
      </Modal>
    </div>
  );
}

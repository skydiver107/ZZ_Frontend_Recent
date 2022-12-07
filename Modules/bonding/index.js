import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { ethers, BigNumber } from "ethers";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import styled from "styled-components";
import { useMediaQuery } from 'react-responsive';

import Button from "../../Components/Button";
import CountdownComponent from "../../Components/CountDown/Countdown";

import MockUSDC from "../../Blockchain/abis/MockUSDC";
import ChainList from "../../Blockchain/chainList";
import ChainID from "../../Blockchain/chainId";
import { Web3ModalContext } from '../../Contexts/Web3ModalProvider';
import BuypozCard from '../../Components/Bonding/BuypozCard';
import BondingTexts from '../../Components/Bonding/bondingTexts';
import RewardSlick from '../../Components/Bonding/reward-slick';
import RewardCard from '../../Components/Bonding/rewardCard';
import getContractData from "../../Components/Bonding/GetContractData";
import RedirectModal from "../../Components/Modal/redirectModal";

import { useAccount, useConnect, useNetwork, useProvider, useSigner, useSwitchNetwork } from "wagmi";
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from '@rainbow-me/rainbowkit'

import {
  RPC_SERVER,
  Bonding_address,
  USDT_TOKEN_address,
  USDC_treasure_address,
  POZ_treasure_address
} from "../../Blockchain/addresses";

import {
  MOCK_POZTOKEN_ABI,
  MOCK_USDT_ABI,
  BONDING_ABI,
  CONVERSION_RATE_ABI,
  BONDING_ABI_POLYGON,
  MOCK_POZTOKEN_ABI_POLYGON,
  MOCK_USDT_ABI_POLYGON,
  CONVERSION_RATE_ABI_POLYGON
} from '../../Blockchain/abis'

import { useRouter } from 'next/router'

const isTest = process.env.ENVIRONMENT === "dev";

// styled components for Reward cards
const Container = styled.div`
  max-width: 350px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  margin:auto;
  margin-top: 64px;
  padding: ${props => props.pd ? props.pd : '0px'};
  background: ${props => props.bg ? 'radial-gradient(95.11% 95.11% at 36.64% 4.89%, #2ad0ca 0%, #e1f664 22.92%, #feb0fe 46.88%, #abb3fc 68.23%, #5df7a4 87.5%, #58c4f6 100%)' : ''};
  position: relative;
  overflow: hidden !important;
  @media (max-width: 1024px){
    margin-top: 32px;
  }
  @media (max-width: 768px){
    max-width: 100%;
  }
`

const Wrapper = styled.div`
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 16px;
  text-align: left;
  background: linear-gradient(45deg, #442961, black);
`

const getBondingData = async (address) => {
  let bondInfo = [];
  let totalAmount = 0;
  let lastBondedAt = 0;
  let bondingLength = 0;
  try {
    const Bonding = await (await getContractData()).bondingContract;
    bondingLength = await Bonding.getBondingLength(address, USDT_TOKEN_address)
    let getClaimablePoz = await Bonding.getClaimablePoz(address, USDT_TOKEN_address)
    const claimablePoz = isTest ? parseInt(getClaimablePoz) / (10 ** 18) : parseInt(getClaimablePoz) / (10 ** 6)
    for (let i = 0; i < parseInt(bondingLength); i++) {
      let bondInfos = await Bonding.bondInfo(address, USDT_TOKEN_address, i)
      totalAmount = totalAmount + (isTest ? parseInt(bondInfos.amount) / (10 ** 18) : parseInt(bondInfos.amount) / (10 ** 6))
      bondInfo.push(bondInfos)
    }
    lastBondedAt = parseInt(bondInfo[bondingLength - 1].bondedAt) * 1000
    return { lastBondedAt, totalAmount, bondInfo, bondingLength, claimablePoz }
  } catch (e) {
    console.log("error on function getBondingData")
    return;
  }
}

const checkIOS = () => {
  const userAgent = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(userAgent)) {
    return true;
  }
  return false;
}

const Bonding = () => {

  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [tabClick, setTabClick] = useState(false);
  const [isPending, setPending] = useState(false);

  const [lastAmount, setLastAmount] = useState(0); //last bonded amount
  const [lastAmount_1, setLastAmount_1] = useState(0); //(n-1)th bonded amount
  const [lastAmount_2, setLastAmount_2] = useState(0); //(n-2)th bonded amount
  const [lastPrice_1, setLastPrice_1] = useState(0); //(n-1)th bonded price
  const [lastPrice_2, setLastPrice_2] = useState(0); //(n-2)th bonded price

  const [lastClaimHash, setLastClaimHash] = useState('') //last claiming tx hash
  const [lastClaimHash_1, setLastClaimHash_1] = useState('') //(n-1)th claiming tx hash
  const [lastClaimHash_2, setLastClaimHash_2] = useState('') //(n-2)th claiming tx hash

  const [treasureBalance, setTreasureBalance] = useState(0)
  const [totalPozAmount, setTotalPozAmount] = useState(0)
  const [lastBondedTime, setLastBondedTime] = useState(0)
  const [lockPeriod, setLockPeriod] = useState(0)
  const [pendingTime, setPendingTime] = useState(0);
  const [claimingText, setClaimingText] = useState('Claim POZ')
  const [approveStatus, setApproveStatus] = useState(false)
  const [bondingStatus, setBondingStatus] = useState(false)
  const [claimingStatus, setClaimingStatus] = useState(false);
  const [claimingModalStatus, setClaimingModalStatus] = useState(false);
  const [txLength, setTxLength] = useState(0);
  const [claimablePozToken, setClaimablePozToken] = useState(0);
  const [pozPrice, setPozPrice] = useState(20); //initial price ---- 1 USDT to 20 POZ token
  const [claimTxHash, setClaimTxHash] = useState('');

  const [modalState, setModalState] = useState(0); //BuyPoz modal state
  const [redirectModalState, setRedirectModalState] = useState(false)
  const [deepLink, setDeepLink] = useState('')
  const [detectNFT, setDetectNFT] = useState(false)

  const [usdcLockTime, setUsdcLockTime] = useState(0);
  const [usdcLockedTime, setUsdcLockedTime] = useState(0);
  const [bctLockTime, setBctLockTime] = useState(0);
  const [bctLockedTime, setBctLockedTime] = useState(0);
  const [slrLockTime, setSlrLockTime] = useState(0);
  const [slrLockedTime, setSlrLockedTime] = useState(0);

  const [usdcComplete, setUsdcComplete] = useState(false);
  const [bctComplete, setBctComplete] = useState(false);
  const [slrComplete, setSlrComplete] = useState(false);

  // check if viewpoint length is below 370px
  const isGalaxy = useMediaQuery({
    query: '(max-width: 385px)'
  })

  const [usdcData, setUsdcData] = useState({
    pozPrice: '8.05',
    discount: 12.52,
    duration: 14,
    maximum: '10 000',
  });
  const [bctData, setBctData] = useState({
    pozPrice: '17,8',
    discount: 12.52,
    duration: 14,
    maximum: '10 000',
  });
  const [slrData, setSlrData] = useState({
    pozPrice: '8.05',
    discount: 12.52,
    duration: 14,
    maximum: '10 000',
  });

  const { account, library } = useContext(Web3ModalContext);

  // signer from wagmi
  const { data: signer } = useSigner()

  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { chain } = useNetwork()
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork()

  const buyPOZ_data = [
    {
      silence: {
        id: 1,
        name: 'USDC',
        subname: 'Circle',
        imgurl: '/img/bonding/usdc-logo32.svg',
      },
      data: usdcData,
      time: usdcLockTime,
      complete: usdcComplete,
      setComplete: setUsdcComplete,
    },
  ]
  // Loading Spinner
  const [loadingSpinner, setLoadingSpinner] = useState(false);
  const loadingOpacity = [0.88, 0.5, 0.2, 0.2, 0.2, 0.88];
  const [loadingStep, setLoadingStep] = useState(0);

  const latency = 20000;   //latency time for getting data from Blockchain

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((loadingStep + 1) % 6);
    }, 120);
    return () => clearInterval(interval);
  }, [loadingStep]);

  // detect pozzle nft in user wallet
  useEffect(() => {
    (async () => {
      try {
        let nfts = []
        setDetectNFT(false)
        const currentChainID = ethers.utils.hexValue(BigNumber.from(chain.id))  //change chain id into hex value
        // console.log("current chain id is", currentChainID)
        const options = {
          method: 'GET',
          url: `https://deep-index.moralis.io/api/v2/${address}/nft`,
          params: { chain: currentChainID, format: 'decimal' },
          headers: { accept: 'application/json', 'X-API-Key': process.env.MORALIS_API_KEY ? process.env.MORALIS_API_KEY : 'ndSbBCUm0rOUjj0wI2sShQHENCpHlv1geth2O41AqzZLbdsLEVSty7LkX5xLimwi' }
        };

        axios
          .request(options)
          .then(function (response) {
            nfts = response.data.result
            nfts.map((nft, idx) => {
              let jsonMetadata = JSON.parse(nft.metadata)
              if (jsonMetadata?.name?.includes('Pozzle')) {
                setDetectNFT(true)
                return;
              }
            })
            // if (detectNFT == true) {
            //   toast.success("You have Pozzlenaut NFTs in your wallet!", {
            //     type: toast.TYPE.SUCCESS,
            //   });
            // }
          })
          .catch(function (error) {
            console.error(error);
            setDetectNFT(false)
          });

      } catch (e) {
        return
      }

    })()
  }, [address, isConnected])

  useEffect(() => {
    // get deep links for wallet

    let publicUrl = ''
    publicUrl = process.env.NEXT_PUBLIC_URL
    const NEXT_DAPP_URL = publicUrl?.slice(8)
    const metaMaskDeepUrl = `https://metamask.app.link/dapp/${NEXT_DAPP_URL}`
    const trustWalletDeepUrl = `https://link.trustwallet.com/open_url?coin_id=966&url=${process.env.NEXT_PUBLIC_URL}`   //coin id == 966 equals to Matic, 60 equals to Eth

    let connectedWallet = window.localStorage.getItem("wagmi.wallet")
    let connectedStatus = window.localStorage.getItem("wagmi.connected")

    if (!checkIOS()) {
      //do nothing
    } else {
      // console.log("current address is", address)
      if (JSON.parse(connectedWallet) == "metaMask" && address) {
        setRedirectModalState(true)
        setDeepLink(metaMaskDeepUrl)

        // window.location.replace(metaMaskDeepUrl)
      } else if (JSON.parse(connectedWallet) == "trustWallet" && address) {
        setRedirectModalState(trustWalletDeepUrl)
        setDeepLink(trustWalletDeepUrl)
        // window.location.replace(trustWalletDeepUrl)
      }
    }

  }, [address, isConnected])


  useEffect(() => {

    if (usdcLockTime <= -20000 && claimablePozToken == 0) {
      console.log("returning------------");
      setUsdcComplete(false);
      return;
    }
    if (usdcComplete && claimablePozToken > 0) {
      console.log("returning because claiming");
      setUsdcLockTime(0);
      return;
    }

    (async () => {
      try {
        const Bonding = new ethers.Contract(Bonding_address, JSON.stringify(isTest ? BONDING_ABI : BONDING_ABI_POLYGON), signer)
        let getClaimablePoz = await Bonding.getClaimablePoz(address, USDT_TOKEN_address)
        const claimablePoz = isTest ? parseInt(getClaimablePoz) / (10 ** 18) : parseInt(getClaimablePoz) / (10 ** 6)
        const endTime = (parseInt(await Bonding.LOCK_PERIOD()) * 1000)
        const tempPendingTime = (lastBondedTime) + (endTime + latency) - Date.now()
        setUsdcLockTime(tempPendingTime)
        setPendingTime(tempPendingTime)

        if (usdcLockTime > 0) {
          setUsdcComplete(false)
          setUsdcLockTime(tempPendingTime)
          setPendingTime(tempPendingTime)
          setClaimablePozToken(claimablePoz)
        }

        if (usdcLockTime <= 0 && claimablePozToken > 0) {
          setUsdcComplete(true)
          setUsdcLockTime(0)
          setPendingTime(0)
          return;
        }

      } catch (e) {
        return;
      }
    })();
  }, [usdcLockTime])

  useEffect(() => {
    (async () => {
      try {
        if (address) {
          if (window.ethereum) {
            try {
              requestAccount()
            } catch (e) {
              console.log(e)
            }
          } else {
            if (chain.id !== (isTest ? ChainID.mumbai : ChainID.polygon)) {
              switchNetwork?.(isTest ? ChainID.mumbai : ChainID.polygon)
            }
          }
        }


        setLastClaimHash('')
        setLastClaimHash_1('')
        setLastClaimHash_2('')
        const tempBonding = new ethers.Contract(Bonding_address, JSON.stringify(isTest ? BONDING_ABI : BONDING_ABI_POLYGON), signer)

        // find events by user addresses
        let purchaseFilterTopic = tempBonding.filters.POZ_purchased(address, null, null, null, null)?.topics
        let claimFilterTopic = tempBonding.filters.POZ_claimed(address, null, null, null)?.topics

        // console.log("tempbonding is", claimFilterTopic[0])

        const purchaseFilter = {
          method: 'GET',
          url: `https://deep-index.moralis.io/api/v2/${Bonding_address}/logs`,
          params: {
            chain: isTest ? 'mumbai' : "polygon",
            topic0: purchaseFilterTopic[0],
            topic1: purchaseFilterTopic[1],
          },
          headers: { accept: 'application/json', 'X-API-Key': process.env.MORALIS_API_KEY ? process.env.MORALIS_API_KEY : 'ndSbBCUm0rOUjj0wI2sShQHENCpHlv1geth2O41AqzZLbdsLEVSty7LkX5xLimwi' }
        };

        const claimFilter = {
          method: 'GET',
          url: `https://deep-index.moralis.io/api/v2/${Bonding_address}/logs`,
          params: {
            chain: isTest ? 'mumbai' : "polygon",
            topic0: claimFilterTopic[0],
            topic1: claimFilterTopic[1]
          },
          headers: {
            accept: 'application/json', 'X-API-Key': process.env.MORALIS_API_KEY ? process.env.MORALIS_API_KEY : 'ndSbBCUm0rOUjj0wI2sShQHENCpHlv1geth2O41AqzZLbdsLEVSty7LkX5xLimwi'
          }
        }

        axios
          .request(purchaseFilter)
          .then(function (response) {
          })
          .catch(function (error) {
            console.error(error);
          });

        axios
          .request(claimFilter)
          .then(function (response) {
            setLastClaimHash(response.data.result[0]?.transaction_hash)
            setLastClaimHash_1(response.data.result[1]?.transaction_hash)
            setLastClaimHash_2(response.data.result[2]?.transaction_hash)
          })
          .catch(function (error) {
            console.error(error);
          });

        setLastAmount(0)
        setLastAmount_1(0)
        setLastPrice_1(0)
        setLastAmount_2(0)
        setLastPrice_2(0)
        setLoadingSpinner(true)
        let { lastBondedAt, totalAmount, bondInfo, bondingLength, claimablePoz } = await getBondingData(address)
        setLastBondedTime(lastBondedAt)
        setClaimablePozToken(claimablePoz)
        let parseBondingLength = parseInt(bondingLength)

        let lastBondingAmount = isTest ?
          parseInt(bondInfo[parseBondingLength - 1].amount) / (10 ** 18)
          :
          parseInt(bondInfo[parseBondingLength - 1].amount) / (10 ** 6)
        //for usdc
        setLastAmount(lastBondingAmount)
        let lastBondingAmount_1 = isTest ?
          parseInt(bondInfo[parseBondingLength - 2].amount) / (10 ** 18)
          :
          parseInt(bondInfo[parseBondingLength - 2].amount) / (10 ** 6)

        let lastBondingPrice_1 = isTest ?
          parseInt(bondInfo[parseBondingLength - 2].price) / (10 ** 18)
          :
          parseInt(bondInfo[parseBondingLength - 2].price) / (10 ** 30)

        setLastAmount_1(lastBondingAmount_1)
        setLastPrice_1(lastBondingPrice_1)
        let lastBondingAmount_2 = isTest ?
          parseInt(bondInfo[parseBondingLength - 3].amount) / (10 ** 18)
          :
          parseInt(bondInfo[parseBondingLength - 3].amount) / (10 ** 6)

        let lastBondingPrice_2 = isTest ?
          parseInt(bondInfo[parseBondingLength - 3].price) / (10 ** 18)
          :
          parseInt(bondInfo[parseBondingLength - 3].price) / (10 ** 30)

        setLastAmount_2(lastBondingAmount_2)
        setLastPrice_2(lastBondingPrice_2)
        setLoadingSpinner(false)


      } catch (e) {
        console.log("Got error on the rendering address")
        setLoadingSpinner(false)
      }
    })();
  }, [address])

  useEffect(() => {
    (async () => {
      try {
        let { lastBondedAt, totalAmount, bondInfo, bondingLength, claimablePoz } = await getBondingData(address)
        setLastBondedTime(lastBondedAt)
        let parseBondingLength = parseInt(bondingLength)
        setTxLength(parseBondingLength)
        setTotalPozAmount((totalAmount * pozPrice).toFixed(2))
        // setClaimablePozToken(claimablePoz)
      } catch (e) {
        console.log("Errors on getting data from contract", e)
      }
    })();
  }, [txLength, usdcComplete])

  useEffect(() => {
    (async () => {
      try {
        if (chain) {
          if (chain.id !== (isTest ? ChainID.mumbai : ChainID.polygon)) {
            switchNetwork?.(isTest ? ChainID.mumbai : ChainID.polygon)
            return;
          }
        }
        getPrice()
        getTreasureWalletBalance()

        const bonding = (await getContractData()).bondingContract;
        let { lastBondedAt, totalAmount, bondInfo, bondingLength, claimablePoz } = await getBondingData(address)
        // console.log("bondinfo is", parseInt(bondInfo[0].amount))
        const endTime = (parseInt(await bonding.LOCK_PERIOD()) * 1000)
        setLockPeriod(endTime)
        const tempPendingTime = lastBondedAt + endTime - Date.now()
        if (tempPendingTime < 0) { setUsdcLockTime(0); setPendingTime(0); setUsdcComplete(false); return; }
        setUsdcLockTime(tempPendingTime)
        setPendingTime(tempPendingTime)
        setUsdcComplete(false)

        if (claimablePozToken > 0) {
          setUsdcComplete(true)
          setUsdcLockTime(0)
          setPendingTime(0)
          return;
        }
        setTotalPozAmount(totalAmount * pozPrice)
        setClaimablePozToken(claimablePoz)

      } catch (e) {
        console.log("error on the first render", e)
        return;
      }
    })();
  }, [])

  // change network to testnet Mumbai
  const requestAccount = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const networkId = await window.ethereum.request({
        method: "net_version",
      });
      if (networkId !== [isTest ? ChainID.mumbai : ChainID.polygon]) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            { chainId: isTest ? '0x13881' : '0x89' } //chain id for MUMBAI HEX number
          ]
        });

      }
      // return accounts[0];
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain", //just for Mumbai testnet
            params: [
              {
                chainId: isTest ? '0x13881' : '0x89', //chain id for MUMBAI HEX number
                rpcUrls: [RPC_SERVER[isTest ? ChainID.mumbai : ChainID.polygon]],
                chainName: isTest ? 'Mumbai' : 'Polygon',
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18 //In number form
                },
              }
            ]
          });
        } catch (e) {
          console.log("error is", e)
        }

      }
    }

  }

  // get POZ price from conversion rate
  const getPrice = async () => {
    try {
      const conversionRate = (await getContractData()).conversionRate;
      // await conversionRate.setRatePerToken(USDT_TOKEN_address, ethers.utils.parseEther("1"));
      const price = await conversionRate.getRateOfToken(USDT_TOKEN_address)
      setPozPrice(isTest ? parseInt(price) / (10 ** 18) : parseInt(price) / (10 ** 30))
    } catch (e) {
      console.log('excenption:', e)
    }
  }

  const getTreasureWalletBalance = async () => {
    try {
      const pozContract = (await getContractData()).pozTokenContract;
      const balance = await pozContract.balanceOf(POZ_treasure_address)
      setTreasureBalance((parseInt(balance) / (10 ** 18)))
      // console.log("poz treasure balance is", (parseInt(balance) / (10 ** 18)))
    } catch (e) {

    }
  }

  const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const claimPOZ = async () => {
    if (window.ethereum) {
      claimPOZ_tx();
    } else {
      // window.addEventListener('ethereum#initialized', claimPOZ_tx(), {
      //   once: true,
      // });
      timeout(claimPOZ_tx(), 3000);
    }
  }

  const claimPOZ_tx = async () => {
    console.log("tx before")
    try {
      const bonding = new ethers.Contract(Bonding_address, JSON.stringify(isTest ? BONDING_ABI : BONDING_ABI_POLYGON), signer)
      // const bondingWithSigner = bonding.connect(signer)
      setModalState(1)
      setClaimingStatus(true)
      setClaimingModalStatus(true)
      let tx = await bonding.claimPOZ(USDT_TOKEN_address);
      await tx.wait();

      setClaimTxHash(tx.hash)

      toast.success("You have successfully claimed your POZ token.", {
        type: toast.TYPE.SUCCESS,
      });

      // find events by user addresses
      let purchaseFilterTopic = bonding.filters.POZ_purchased(address, null, null, null, null)?.topics
      let claimFilterTopic = bonding.filters.POZ_claimed(address, null, null, null)?.topics

      // console.log("tempbonding is", claimFilterTopic[0])

      const purchaseFilter = {
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/${Bonding_address}/logs`,
        params: {
          chain: isTest ? 'mumbai' : 'polygon',
          topic0: purchaseFilterTopic[0],
          topic1: purchaseFilterTopic[1],
        },
        headers: { accept: 'application/json', 'X-API-Key': process.env.MORALIS_API_KEY ? process.env.MORALIS_API_KEY : 'ndSbBCUm0rOUjj0wI2sShQHENCpHlv1geth2O41AqzZLbdsLEVSty7LkX5xLimwi' }
      };

      const claimFilter = {
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/${Bonding_address}/logs`,
        params: {
          chain: isTest ? 'mumbai' : 'polygon',
          topic0: claimFilterTopic[0],
          topic1: claimFilterTopic[1]
        },
        headers: {
          accept: 'application/json', 'X-API-Key': process.env.MORALIS_API_KEY ? process.env.MORALIS_API_KEY : 'ndSbBCUm0rOUjj0wI2sShQHENCpHlv1geth2O41AqzZLbdsLEVSty7LkX5xLimwi'
        }
      }

      axios
        .request(purchaseFilter)
        .then(function (response) {
        })
        .catch(function (error) {
          console.error(error);
        });

      axios
        .request(claimFilter)
        .then(function (response) {
          setLastClaimHash(tx.hash ? tx.hash : response.data.result[0]?.transaction_hash)
          setLastClaimHash_1(tx.hash ? response.data.result[1]?.transaction_hash : response.data.result[1]?.transaction_hash)
          setLastClaimHash_2(tx.hash ? response.data.result[2]?.transaction_hash : response.data.result[2]?.transaction_hash)
        })
        .catch(function (error) {
          console.error(error);
        });



      setClaimingStatus(false)
      setClaimablePozToken(0)
      console.log("tx after")
      // setClaimingModalStatus(false)
    } catch (e) {
      if (e.code == 'ACTION_REJECTED' || e.code == -32000) {
        toast.warning("The claiming transaction was rejected.", {
          type: toast.TYPE.WARNING,
        });
        setUsdcComplete(true);
        setClaimingStatus(false)
        setClaimingModalStatus(false)
        return;
      } else if (e.code == 'UNPREDICTABLE_GAS_LIMIT') {
        toast.warning("Not enough POZ available. Please contact our team on Discord to release more token.", {
          type: toast.TYPE.WARNING,
        });
        setUsdcComplete(true);
        setClaimingStatus(false)
        setClaimingModalStatus(false)
        return;
      }
      setUsdcComplete(true);
      setClaimingStatus(false)
      setClaimingModalStatus(false)
      toast.warning(`The error code is ${e.code}`, {
        type: toast.TYPE.WARNING,
      });
      return;
    }
    setUsdcComplete(false)
    setClaimingStatus(false)
    setUsdcLockTime(0)
    setPendingTime(0)
    return;
  }

  const bypozClick = async () => {
    if (!isConnected) {
      toast.warn("Please connect to wallet first", {
        type: toast.TYPE.ERROR,
      });
      openConnectModal()
      return;
    }
    setModalState(1);
    document.body.style.overflow = "hidden"

  }

  const purchase_POZ_tx = async (amount) => {

    // switch chain on modal
    // if (window.ethereum) {
    //   const networkId = await window.ethereum.request({
    //     method: "net_version",
    //   });
    //   if (networkId !== [isTest ? ChainID.mumbai : ChainID.polygon]) {
    //     await window.ethereum.request({
    //       method: "wallet_switchEthereumChain",
    //       params: [
    //         { chainId: isTest ? '0x13881' : '0x89' } //chain id for MUMBAI HEX number
    //       ]
    //     });
    //   }
    // }
    // console.log("chainID is", chain.id, ChainID.polygon, (isTest ? ChainID.mumbai : ChainID.polygon))

    if (chain) {
      if (chain.id !== (isTest ? ChainID.mumbai : ChainID.polygon)) {
        switchNetwork?.(isTest ? ChainID.mumbai : ChainID.polygon)
        return;
      }
    } else {
      openConnectModal()
      return;
    }


    setApproveStatus(true)
    setClaimingModalStatus(true)

    const usdtToken = new ethers.Contract(USDT_TOKEN_address, JSON.stringify(isTest ? MOCK_USDT_ABI : MOCK_USDT_ABI_POLYGON), signer);
    const Bonding = new ethers.Contract(Bonding_address, JSON.stringify(isTest ? BONDING_ABI : BONDING_ABI_POLYGON), signer)

    // do this for bonding app launch
    try {
      // const usdtContractWithSigner = usdtToken.connect(signer)
      const approveTx = await usdtToken.approve(Bonding.address, isTest ? ethers.utils.parseEther(amount) : amount * (10 ** 6))
      await approveTx.wait()
      setApproveStatus(false)
      setClaimingModalStatus(false)
      toast.success("Your approval for token spending was successful.", {
        type: toast.TYPE.SUCCESS,
      });
    } catch (e) {
      setApproveStatus(false)
      setClaimingModalStatus(false)
      // toast.warning("The approval for spending was rejected.", {
      //   type: toast.TYPE.WARNING,
      // });
      toast.warning(`The approval for spending was rejected for reason: ${e.code}.`, {
        type: toast.TYPE.WARNING,
      });
      return;
    }

    try {
      setBondingStatus(true)
      setClaimingModalStatus(true)
      // const bondingContractWithSigner = Bonding.connect(signer)
      const bondingTx = await Bonding.purchasePOZ(
        usdtToken.address,
        isTest ? ethers.utils.parseEther(amount) : amount * (10 ** 6)
      )
      // console.log("bondingTx is", bondingTx.hash)
      await bondingTx.wait()

      // find events by user addresses
      let purchaseFilterTopic = Bonding.filters.POZ_purchased(address, null, null, null, null)?.topics
      let claimFilterTopic = Bonding.filters.POZ_claimed(address, null, null, null)?.topics

      // console.log("tempbonding is", claimFilterTopic[0])

      const purchaseFilter = {
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/${Bonding_address}/logs`,
        params: {
          chain: isTest ? 'mumbai' : 'polygon',
          topic0: purchaseFilterTopic[0],
          topic1: purchaseFilterTopic[1],
        },
        headers: { accept: 'application/json', 'X-API-Key': process.env.MORALIS_API_KEY ? process.env.MORALIS_API_KEY : 'ndSbBCUm0rOUjj0wI2sShQHENCpHlv1geth2O41AqzZLbdsLEVSty7LkX5xLimwi' }
      };

      const claimFilter = {
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/${Bonding_address}/logs`,
        params: {
          chain: isTest ? 'mumbai' : 'polygon',
          topic0: claimFilterTopic[0],
          topic1: claimFilterTopic[1]
        },
        headers: {
          accept: 'application/json', 'X-API-Key': process.env.MORALIS_API_KEY ? process.env.MORALIS_API_KEY : 'ndSbBCUm0rOUjj0wI2sShQHENCpHlv1geth2O41AqzZLbdsLEVSty7LkX5xLimwi'
        }
      }

      await axios
        .request(purchaseFilter)
        .then(function (response) {
        })
        .catch(function (error) {
          console.error(error);
        });

      await axios
        .request(claimFilter)
        .then(function (response) {
          setLastClaimHash(response.data.result[0]?.transaction_hash)
          setLastClaimHash_1(response.data.result[0]?.transaction_hash)
          setLastClaimHash_2(response.data.result[1]?.transaction_hash)
        })
        .catch(function (error) {
          console.error(error);
        });


      try {

        setLastBondedTime(Date.now())
        const endTime = (parseInt(await Bonding.LOCK_PERIOD()) * 1000)
        setUsdcLockTime(endTime + latency);

        let { lastBondedAt, totalAmount, bondInfo, bondingLength, claimablePoz } = await getBondingData(address)
        setUsdcLockedTime(lastBondedAt + lockPeriod)

        console.log("usdclocktime after bonding is", lastBondedAt, lockPeriod, endTime)
        setPendingTime(lastBondedAt + endTime - Date.now());

        let parseBondingLength = parseInt(bondingLength)
        let lastBondingAmount = isTest ?
          parseInt(bondInfo[parseBondingLength - 1].amount) / (10 ** 18)
          :
          parseInt(bondInfo[parseBondingLength - 1].amount) / (10 ** 6)

        //for usdc
        setLastAmount(lastBondingAmount)
        let lastBondingAmount_1 = isTest ?
          parseInt(bondInfo[parseBondingLength - 2].amount) / (10 ** 18)
          :
          parseInt(bondInfo[parseBondingLength - 2].amount) / (10 ** 6)

        let lastBondingPrice_1 = isTest ?
          parseInt(bondInfo[parseBondingLength - 2].price) / (10 ** 18)
          :
          parseInt(bondInfo[parseBondingLength - 2].price) / (10 ** 30)

        setLastAmount_1(lastBondingAmount_1)
        setLastPrice_1(lastBondingPrice_1)

        let lastBondingAmount_2 = isTest ?
          parseInt(bondInfo[parseBondingLength - 3].amount) / (10 ** 18)
          :
          parseInt(bondInfo[parseBondingLength - 3].amount) / (10 ** 6)

        let lastBondingPrice_2 = isTest ?
          parseInt(bondInfo[parseBondingLength - 3].price) / (10 ** 18)
          :
          parseInt(bondInfo[parseBondingLength - 3].price) / (10 ** 30)

        setLastAmount_2(lastBondingAmount_2)
        setLastPrice_2(lastBondingPrice_2)
      } catch (e) {
        console.log("error on first purchase")
      }

      toast.success("Your POZ purchase was successful.", {
        type: toast.TYPE.SUCCESS,
      });
      setBondingStatus(false)
      setClaimingModalStatus(false)
    } catch (e) {
      setBondingStatus(false)
      setClaimingModalStatus(false)
      // toast.warning("POZ purchase transaction failed.", {
      //   type: toast.TYPE.WARNING,
      // });

      toast.warning(`POZ purchase transaction failed for reason: ${e.code}.`, {
        type: toast.TYPE.WARNING,
      });
      console.log("bonding error is", e)
      return;
    }
  }

  const BuyPOZwithUSDC = async (lockedname, amount) => {
    if (window.ethereum) {
      purchase_POZ_tx(amount)
    } else {
      // window.addEventListener('ethereum#initialized', purchase_POZ_tx(amount), {
      //   once: true,
      // });
      timeout(purchase_POZ_tx(amount), 3000);
    }

  }

  return (
    <>
      <div className="bonding-container">
        <div className='bonding-wrapper'>
          {!redirectModalState &&
            <>
              <div className="bonding-body">
                <a className='first-button' style={{ color: '#FFFFFF' }} target="_blank" href='https://pozzle-planet.gitbook.io/poz-purplepaper/stake-to-impact' rel="noopener noreferrer">
                  <div className='left-text flex align-items-center xs:justify-content-between'>
                    <div className='flex align-items-center font-bold text-sm leading-5 whitespace-nowrap'>
                      <img className='mr-2.5' src='/img/bonding/Polygon18Stroke.svg' />
                      {isGalaxy ? 'Rewards' : 'Community Rewards'}
                    </div>
                    <div className='flex align-items-center font-semibold ml-2 text-sm leading-5 color248 whitespace-nowrap'>
                      {'Coming Soon...'}
                      <img className='h-3 ml-3 mt-0.5 leading-5 sx:hidden cursor-pointer' src='/img/bonding/VectorStroke.png' />
                    </div>
                  </div>
                  <div className='flex align-items-center color875 right-text text-sm leading-5 cursor-pointer xs:hidden sx:block'>
                    <div className='w-full flex align-items-center'>Learn how to take part<img className='h-4 ml-3 leading-5' src='/img/bonding/righticon.png' /></div>
                  </div>
                </a>
                <div className='w-full font-bold text-2xl xs:mt-8 sx:mt-16 tracking-wider chevron-text'>PURCHASE POZ TO GAIN POZITIVITY <span className=''>REWARDS</span></div>
                <div className='w-full mt-3 font-semibold color25505 text-base'>By purchasing POZ, you participate in building the Pozzle Planet ecosystem. You will soon be enabled to stake POZ and get rewarded with Pozzles, which generate community rewards.</div>
                <div className='first-poz-value-block gradientbgcolor'>
                  <div className='reward-bd flex flex-col align-items-center bgcolor251 px-8 pt-3 rounded-2xl pb-3'>
                    <div className='w-full flex justify-content-between'>
                      <div className='w-2/4 flex justify-content-center align-itemd-center'><img className='w-16' src='/img/bonding/poztoken.svg' /></div>
                      <div className='w-2/4 textbar flex flex-col justify-content-evenly'>
                        <div className='text-left text'>
                          <span className='text-sm color25505 font-bold'>POZ Price</span>
                          <div className='mt-2 text-xl f-Hanson font-bold'>$ {1 / pozPrice}0</div>
                        </div>
                        <div className='text-left text'>
                          <span className='text-sm color25505 font-bold'>Pozzle IPY%</span>
                          <div className='mt-2 text-xl f-Hanson font-bold'>-</div>
                        </div>
                      </div>
                    </div>
                    <div className='w-full mt-3 line' />
                    {address ?
                      <div>
                        <div className='w-full mt-3 font-bold text-base f-OpenSans color248 text-left'>Your current positions</div>
                        {lastAmount > 0 ?
                          <div className='relative w-full mt-3 mb-1'>
                            <div className='block-wrapper'>
                              {lastAmount > 0 &&
                                <>
                                  <div className='line my-2' />
                                  <div className='flex w-full justify-content-between'>
                                    <div className='f-OpenSans font-semibold text-sm color248'>Purchased</div>
                                    <div className='flex max-w-[200px] w-full justify-content-between font-bold text-base f-Hanson'>
                                      <div className='flex align-items-center'>
                                        <div><img className='w-4' src='/img/bonding/usdc-token-logo.svg' /></div>
                                        <div className='ml-3'>
                                          {lastAmount < 1000 ?
                                            lastAmount.toFixed(2)
                                            :
                                            (lastAmount / 1000).toFixed(1) + 'K'
                                          }
                                        </div>
                                      </div>
                                      <div className='flex align-items-center'>
                                        <div><img src='/img/bonding/poztoken.svg' /></div>
                                        <div className='ml-3'>
                                          {lastAmount * pozPrice < 1000 ?
                                            (lastAmount * pozPrice).toFixed(2)
                                            :
                                            ((lastAmount * pozPrice) / 1000).toFixed(1) + 'K'
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className='mt-1.5 flex align-items-center color25505 justify-content-between'>
                                    <div className='flex'>
                                      <div>
                                        <img src='/img/bonding/clock.svg' />
                                      </div>
                                      <div className='ml-2.5 font-normal text-xs f-OpenSans'>
                                        {(usdcLockTime > 0 || claimablePozToken > 0) ? `Claimable after vesting time` : `Claimed`}
                                      </div>
                                    </div>
                                    {(usdcLockTime > 0 || claimablePozToken > 0) ?
                                      <></>
                                      :
                                      <a
                                        className="flex align-items-center cursor-pointer color875 font-normal text-xs"
                                        target="_blank"
                                        href={isTest ? `${process.env.MUMBAISCAN_URL}/tx/${lastClaimHash}` : `${process.env.POLYGONSCAN_URL}/tx/${lastClaimHash}`} rel="noopener noreferrer"
                                      >
                                        View <img className="ml6" src="/img/bonding/Vector2.png" />
                                      </a>
                                    }

                                  </div>
                                </>
                              }
                              {lastAmount_1 > 0 &&
                                <>
                                  <div className='line my-2' />
                                  <div className='flex w-full justify-content-between'>
                                    <div className='f-OpenSans font-semibold text-sm color248'>Purchased</div>
                                    <div className='flex max-w-[200px] w-full justify-content-between font-bold text-base f-Hanson'>
                                      <div className='flex align-items-center'>
                                        <div><img className='w-4' src='/img/bonding/usdc-token-logo.svg' /></div>
                                        <div className='ml-3'>
                                          {lastAmount_1 < 1000 ?
                                            lastAmount_1.toFixed(2)
                                            :
                                            (lastAmount_1 / 1000).toFixed(1) + 'K'
                                          }
                                        </div>
                                      </div>
                                      <div className='flex align-items-center'>
                                        <div><img src='/img/bonding/poztoken.svg' /></div>
                                        <div className='ml-3'>
                                          {lastAmount_1 * lastPrice_1 < 1000 ?
                                            (lastAmount_1 * lastPrice_1).toFixed(2)
                                            :
                                            ((lastAmount_1 * lastPrice_1) / 1000).toFixed(1) + 'K'
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className='mt-1.5 flex align-items-center color25505 justify-content-between'>
                                    <div className="flex">
                                      <div>
                                        <img src='/img/bonding/clock.svg' />
                                      </div>
                                      <div className='ml-2.5 font-normal text-xs f-OpenSans'>
                                        {`Claimed`}
                                      </div>
                                    </div>
                                    <a
                                      className="flex align-items-center cursor-pointer color875 font-normal text-xs"
                                      target="_blank"
                                      href={isTest ? `${process.env.MUMBAISCAN_URL}/tx/${lastClaimHash_1}` : `${process.env.POLYGONSCAN_URL}/tx/${lastClaimHash_1}`} rel="noopener noreferrer"
                                    >
                                      View <img className="ml6" src="/img/bonding/Vector2.png" />
                                    </a>
                                  </div>
                                </>
                              }
                              {lastAmount_2 > 0 &&
                                <>
                                  <div className='line my-2' />
                                  <div className='flex w-full justify-content-between'>
                                    <div className='f-OpenSans font-semibold text-sm color248'>Purchased</div>
                                    <div className='flex max-w-[200px] w-full justify-content-between font-bold text-base f-Hanson'>
                                      <div className='flex align-items-center'>
                                        <div><img className='w-4' src='/img/bonding/usdc-token-logo.svg' /></div>
                                        <div className='ml-3'>
                                          {lastAmount_2 < 1000 ?
                                            lastAmount_2.toFixed(2)
                                            :
                                            (lastAmount_2 / 1000).toFixed(1) + 'K'
                                          }
                                        </div>
                                      </div>
                                      <div className='flex align-items-center'>
                                        <div><img src='/img/bonding/poztoken.svg' /></div>
                                        <div className='ml-3'>
                                          {lastAmount_2 * lastPrice_2 < 1000 ?
                                            (lastAmount_2 * lastPrice_2).toFixed(2)
                                            :
                                            ((lastAmount_2 * lastPrice_2) / 1000).toFixed(1) + 'K'
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className='mt-1.5 flex align-items-center color25505 justify-content-between'>
                                    <div className="flex">
                                      <div>
                                        <img src='/img/bonding/clock.svg' />
                                      </div>
                                      <div className='ml-2.5 font-normal text-xs f-OpenSans'>
                                        {`Claimed`}
                                      </div>
                                    </div>
                                    <a
                                      className="flex align-items-center cursor-pointer color875 font-normal text-xs"
                                      target="_blank"
                                      href={isTest ? `${process.env.MUMBAISCAN_URL}/tx/${lastClaimHash_2}` : `${process.env.POLYGONSCAN_URL}/tx/${lastClaimHash_2}`} rel="noopener noreferrer"
                                    >
                                      View <img className="ml6" src="/img/bonding/Vector2.png" />
                                    </a>
                                  </div>
                                </>
                              }

                            </div>
                          </div>
                          :
                          <div>
                            {loadingSpinner ?
                              <>
                                <div className="flex align-items-center justify-content-center mt-3 mb-3">
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
                                      fill="#F8F8F8"
                                    />
                                    <path
                                      opacity={loadingOpacity[(loadingStep + 1) % 6]}
                                      d="M13.6686 54.1487C12.8548 54.6234 11.8055 54.3238 11.4156 53.4662C9.61889 49.5129 8.61816 45.1211 8.61816 40.4956C8.61816 35.8702 9.61889 31.4784 11.4156 27.5251C11.8054 26.6675 12.8548 26.3679 13.6686 26.8426L20.6816 30.9336C21.189 31.2295 21.501 31.7728 21.501 32.3602V48.6311C21.501 49.2185 21.189 49.7617 20.6816 50.0577L13.6686 54.1487Z"
                                      fill="#F8F8F8"
                                    />
                                    <path
                                      opacity={loadingOpacity[(loadingStep + 2) % 6]}
                                      d="M38.6785 70.1357C38.6785 71.0747 37.8953 71.829 36.9606 71.7392C27.5548 70.8353 19.362 65.7794 14.2368 58.4261C13.7054 57.6636 13.9672 56.6225 14.77 56.1542L21.9904 51.9423C22.5047 51.6423 23.1406 51.6423 23.6548 51.9423L37.859 60.2281C38.3665 60.5241 38.6785 61.0673 38.6785 61.6548V70.1357Z"
                                      fill="#F8F8F8"
                                    />
                                    <path
                                      opacity={loadingOpacity[(loadingStep + 3) % 6]}
                                      d="M65.2292 56.1461C66.0321 56.6144 66.2939 57.6556 65.7624 58.418C60.6373 65.7713 52.4445 70.8272 43.0387 71.7311C42.104 71.821 41.3208 71.0666 41.3208 70.1276V61.6467C41.3208 61.0593 41.6328 60.516 42.1402 60.22L56.3444 51.9343C56.8587 51.6343 57.4946 51.6343 58.0089 51.9342L65.2292 56.1461Z"
                                      fill="#F8F8F8"
                                    />
                                    <path
                                      opacity={loadingOpacity[(loadingStep + 4) % 6]}
                                      d="M66.3305 26.8429C67.1443 26.3682 68.1936 26.6677 68.5834 27.5254C70.3802 31.4787 71.3809 35.8704 71.3809 40.4959C71.3809 45.1214 70.3802 49.5131 68.5834 53.4664C68.1936 54.3241 67.1443 54.6236 66.3305 54.1489L59.3175 50.058C58.8101 49.762 58.498 49.2188 58.498 48.6313V32.3605C58.498 31.773 58.8101 31.2298 59.3175 30.9338L66.3305 26.8429Z"
                                      fill="#F8F8F8"
                                    />
                                    <path
                                      opacity={loadingOpacity[(loadingStep + 5) % 6]}
                                      d="M41.3208 10.8638C41.3208 9.92477 42.104 9.17044 43.0387 9.26026C52.4445 10.1642 60.6373 15.2201 65.7624 22.5733C66.2939 23.3358 66.0321 24.3769 65.2293 24.8453L58.0089 29.0571C57.4946 29.3571 56.8587 29.3571 56.3444 29.0571L42.1402 20.7714C41.6328 20.4754 41.3208 19.9321 41.3208 19.3447V10.8638Z"
                                      fill="#F8F8F8"
                                    />
                                    <path
                                      d="M38.3354 23.1336C39.364 22.5337 40.6358 22.5337 41.6643 23.1336L54.2169 30.456C55.2317 31.0479 55.8558 32.1344 55.8558 33.3093V47.6828C55.8558 48.8577 55.2317 49.9442 54.2169 50.5361L41.6643 57.8585C40.6358 58.4584 39.364 58.4584 38.3355 57.8585L25.7829 50.5361C24.7681 49.9442 24.144 48.8577 24.144 47.6828V33.3093C24.144 32.1344 24.7681 31.0479 25.7829 30.456L38.3354 23.1336Z"
                                      fill="#F8F8F8"
                                    />
                                  </svg>
                                </div>
                                <div className="flex align-items-center text-xs font-normal f-OpenSans color25505">
                                  Please wait while we fetch the data...
                                </div>
                              </>
                              :
                              <>
                                <div className='f-OpenSans-light text-sm color25505 mt-3 mb-3'>
                                  You currently don't have any open staking or purchase positions. Open your first position to start earning rewards.
                                </div>
                                <div className="flex align-items-center text-sm cursor-pointer color875">
                                  Learn more &gt;
                                </div>
                              </>
                            }




                          </div>
                        }
                        <div style={{ width: '300px' }}>
                          <Button
                            className='w-100 mt-2'
                            onClick={() => { bypozClick() }}
                          >
                            Buy POZ
                          </Button>
                        </div>
                      </div>
                      :
                      <div>
                        <div className='w-full mt-3 font-bold text-base f-OpenSans color248 text-left'>You're currently not connected.</div>
                        <div className='f-OpenSans-light text-sm color25505 mt-3 mb-3'>
                          Please connect your wallet to access your current position details and start earning Pozzle rewards by staking or buying POZ with our web application.
                        </div>
                      </div>
                    }
                  </div>
                </div>
                <div className='w-full h-13 xs:mt-10 sx:mt-20 relative flex justify-content-between text-center text-base f-OpenSans '>
                  {/* <Link href='/staking'>
                <button onClick={() => { setTabClick(true) }} className={`hovereffect w-50 pt-1 pb-3 cursor-pointer  ${tabClick ? 'border-bottom-gradient' : 'bbcolor223'}`}>Stake</button>
              </Link> */}
                  <Link href='/purchase#bondContainer'>
                    <button onClick={() => { setTabClick(false) }} className={`hovereffect w-100 relative pt-1 pb-3 bt1color875 cursor-pointer ${!tabClick ? 'border-bottom-gradient' : 'bbcolor223'}`}>
                      Buy
                    </button>
                  </Link>
                </div>
              </div>

              <div className='w-full'>
                <div className='bonding-body2 w-full flex-col align-items-center flex'>
                  <div className='flex justify-content-between w-full xs:justify-content-center'>
                    <RewardSlick>
                      {/* {
                    BondingTexts.rewardData.map((item, idx) => (
                      <RewardCard key={idx} item={item} />
                    ))
                  } */}
                      {(usdcLockTime > 0 || usdcComplete || claimablePozToken > 0) && address ?
                        <Container className='reward-container' pd={usdcComplete ? '2px' : '0px'} bg={usdcComplete ? true : false}>
                          <Wrapper>
                            <div className="logo-box w-100 flex align-items-center">
                              <img className='' src='/img/bonding/poztoken.svg' style={{ width: '30px' }} />
                              <div className="ml16 font-bold text-base f-Hanson">
                                New Rewards
                                {/* {usdcLockTime}, {usdcComplete ? 'true' : 'false'}, {claimablePozToken} */}
                              </div>
                            </div>
                            <div className="mt-2.5 text-sm color248 font-semibold OpenSans">You currently have POZ rewards ready to be claimed.</div>
                            <div className="w-100 mt-2.5 mb-2 flex justify-start text-normal text-sm">
                              {usdcLockTime > 0 ?
                                <>
                                  <img className="w-4" src="/img/bonding/clock.svg" />
                                  <div className="ml-2.5 color25505 font-semibold OpenSans flex">Next reward available in<CountdownComponent
                                    setComplete={setUsdcComplete}
                                    inputTime={usdcLockTime}
                                  />
                                  </div>
                                </>
                                :
                                <></>
                              }
                            </div>
                            <div className={`w-full whitespace-nowrap`}>
                              {(usdcLockTime > 0) &&
                                <Button
                                  hasBorder={false}
                                  disabled={true}
                                  className='w-full op60 flex justify-content-center whitespace-nowrap'
                                >Claimable in
                                  <CountdownComponent
                                    setComplete={setUsdcComplete}
                                    inputTime={usdcLockTime}
                                  />
                                </Button>
                              }
                              {
                                (usdcLockTime <= 0 && claimablePozToken > 0) &&
                                <Button
                                  hasBorder={true}
                                  className='w-full'
                                  onClick={() => { claimPOZ() }}
                                >
                                  {claimingText}
                                </Button>
                              }
                              {
                                (claimingStatus && usdcComplete) &&
                                <Button
                                  hasBorder={false}
                                  disabled={true}
                                  className='w-full op60 flex justify-content-center whitespace-nowrap'
                                >Claiming now...
                                </Button>
                              }
                            </div>
                          </Wrapper>
                        </Container>
                        :
                        lastAmount > 0 && address ?
                          <Container className='reward-container' pd={usdcComplete ? '2px' : '0px'} bg={usdcComplete ? true : false}>
                            <Wrapper>
                              <div className="logo-box w-100 flex align-items-center">
                                <img className='' src='/img/bonding/poztoken.svg' style={{ width: '30px' }} />
                                <div className="ml16 font-bold text-base f-Hanson">Purchased</div>
                              </div>
                              <div className="mt-2.5 text-sm color248 font-semibold OpenSans">You recently purchased {lastAmount * pozPrice} POZ and claimed the tokens.</div>
                              <div className="w-100 mt-2.5 mb-2 flex justify-start text-normal text-sm">
                                {
                                  <div className="flex justify-content-between align-items-center w-100">
                                    <div className="flex">
                                      <img className="w-4" src="/img/bonding/clock.svg" />
                                      <div className="ml-2.5 color25505 font-semibold OpenSans flex">
                                        You claimed your POZ tokens
                                      </div>
                                    </div>
                                    <div>
                                      <a
                                        className="flex align-items-center cursor-pointer color875"
                                        target="_blank"
                                        href={isTest ? `${process.env.MUMBAISCAN_URL}/tx/${lastClaimHash}` : `${process.env.POLYGONSCAN_URL}/tx/${lastClaimHash}`} rel="noopener noreferrer"
                                      >
                                        View <img className="ml6" src="/img/bonding/Vector2.png" />
                                      </a>
                                    </div>
                                  </div>

                                }
                              </div>
                              <div className={`w-full whitespace-nowrap`}>
                                {
                                  <Button
                                    hasBorder={false}
                                    disabled={true}
                                    className='w-full op60 flex justify-content-center whitespace-nowrap'
                                  >Claimed
                                  </Button>
                                }
                              </div>
                            </Wrapper>
                          </Container>
                          :
                          <></>
                      }
                      {(lastAmount_1 > 0 && address) &&
                        <Container className='reward-container' pd={usdcComplete ? '2px' : '0px'} bg={usdcComplete ? true : false}>
                          <Wrapper>
                            <div className="logo-box w-100 flex align-items-center">
                              <img className='' src='/img/bonding/poztoken.svg' style={{ width: '30px' }} />
                              <div className="ml16 font-bold text-base f-Hanson">Purchased</div>
                            </div>
                            <div className="mt-2.5 text-sm color248 font-semibold OpenSans">You recently purchased {lastAmount_1 * lastPrice_1} POZ and claimed the tokens.</div>
                            <div className="w-100 mt-2.5 mb-2 flex justify-start text-normal text-sm">
                              {
                                <div className="flex justify-content-between align-items-center w-100">
                                  <div className="flex">
                                    <img className="w-4" src="/img/bonding/clock.svg" />
                                    <div className="ml-2.5 color25505 font-semibold OpenSans flex">
                                      You claimed your POZ tokens
                                    </div>
                                  </div>
                                  <div>
                                    <a
                                      className="flex align-items-center cursor-pointer color875"
                                      target="_blank"
                                      href={isTest ? `${process.env.MUMBAISCAN_URL}/tx/${lastClaimHash_1}` : `${process.env.POLYGONSCAN_URL}/tx/${lastClaimHash_1}`} rel="noopener noreferrer"
                                    >
                                      View <img className="ml6" src="/img/bonding/Vector2.png" />
                                    </a>
                                  </div>
                                </div>

                              }
                            </div>
                            <div className={`w-full whitespace-nowrap`}>
                              {
                                <Button
                                  hasBorder={false}
                                  disabled={true}
                                  className='w-full op60 flex justify-content-center whitespace-nowrap'
                                >Claimed
                                </Button>
                              }
                            </div>
                          </Wrapper>
                        </Container>
                      }
                      {(lastAmount_2 > 0 && address) &&
                        <Container className='reward-container' pd={usdcComplete ? '2px' : '0px'} bg={usdcComplete ? true : false}>
                          <Wrapper>
                            <div className="logo-box w-100 flex align-items-center">
                              <img className='' src='/img/bonding/poztoken.svg' style={{ width: '30px' }} />
                              <div className="ml16 font-bold text-base f-Hanson">Purchased</div>
                            </div>
                            <div className="mt-2.5 text-sm color248 font-semibold OpenSans">You recently purchased {lastAmount_2 * lastPrice_2} POZ and claimed the tokens.</div>
                            <div className="w-100 mt-2.5 mb-2 flex justify-start text-normal text-sm">
                              {
                                <div className="flex justify-content-between align-items-center w-100">
                                  <div className="flex">
                                    <img className="w-4" src="/img/bonding/clock.svg" />
                                    <div className="ml-2.5 color25505 font-semibold OpenSans flex">
                                      You claimed your POZ tokens
                                    </div>
                                  </div>
                                  <div>
                                    <a
                                      className="flex align-items-center cursor-pointer color875"
                                      target="_blank"
                                      href={isTest ? `${process.env.MUMBAISCAN_URL}/tx/${lastClaimHash_2}` : `${process.env.POLYGONSCAN_URL}/tx/${lastClaimHash_2}`} rel="noopener noreferrer"
                                    >
                                      View <img className="ml6" src="/img/bonding/Vector2.png" />
                                    </a>
                                  </div>
                                </div>

                              }
                            </div>
                            <div className={`w-full whitespace-nowrap`}>
                              {
                                <Button
                                  hasBorder={false}
                                  disabled={true}
                                  className='w-full op60 flex justify-content-center whitespace-nowrap'
                                >Claimed
                                </Button>
                              }
                            </div>
                          </Wrapper>
                        </Container>
                      }
                    </RewardSlick>
                  </div>
                  <div className='mW800 xs:mt-10 sx:mt-16 f-OpenSans text-base' id="bondContainer">
                    <div className='w-full text-2xl f-Hanson'>BUY POZ USING SELECTED TOKENS & CLAIM IN <span className='color79'>5</span> MINS</div>
                    <div className='w-full mt-3 text-semibold color248'>You can purchase POZ tokens by exchanging with our curated list of options. Your POZ will then be claimable after a short vesting period.</div>
                    <Link href=''><div className='text-blod color875 f-OpenSans my-3 py-1 cursor-pointer'>Token pools available: 1</div></Link>
                  </div>
                </div>
                <div className='buycard-container w-full flex justify-content-center lg:mt-16'>
                  <div className='bonding-buyCard-wrapper'>
                    {
                      buyPOZ_data.map((item, idx) => (
                        <BuypozCard
                          key={idx}
                          BuyPOZwithUSDC={BuyPOZwithUSDC}
                          setComplete={item.setComplete}
                          complete={item.complete}
                          modalState={modalState}
                          setModalState={setModalState}
                          bypozClick={bypozClick}
                          silence={item.silence}
                          claimPOZ={claimPOZ}
                          datas={item.data}
                          times={item.time}
                          usdcLockTime={usdcLockTime}
                          claimingText={claimingText}
                          claimingStatus={claimingStatus}
                          claimTxHash={claimTxHash}
                          lastClaimHash={lastClaimHash}
                          lastAmount={lastAmount}
                          pozPrice={pozPrice}
                          totalPozAmount={totalPozAmount}
                          approveStatus={approveStatus}
                          bondingStatus={bondingStatus}
                          claimingModalStatus={claimingModalStatus}
                          claimablePozToken={claimablePozToken}
                          setClaimingModalStatus={setClaimingModalStatus}
                          treasureBalance={treasureBalance}
                          detectNFT={detectNFT}
                        />))
                    }
                  </div>
                </div>
              </div>
            </>
          }

          {redirectModalState &&
            <div className="bonding-modal-container">
              <div className="modal-wrapper">
                <RedirectModal
                  setRedirectModalState={setRedirectModalState}
                  deepLink={deepLink}
                >
                </RedirectModal>
              </div>
            </div>

          }
        </div>
      </div >
    </>
  )
}

export default Bonding;
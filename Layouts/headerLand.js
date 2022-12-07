/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import WalletButton from '../Components/WalletButton'
import { useAccount, useConnect, useNetwork, useProvider, useSigner, useSwitchNetwork, useDisconnect } from "wagmi";
import ClickAwayListener from "react-click-away-listener";
import getContractData from "../Components/Bonding/GetContractData";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMediaQuery } from 'react-responsive'
import {
  useConnectModal,
  useAccountModal,
  useChainModal,
} from '@rainbow-me/rainbowkit'
import RedirectModal from "../Components/Modal/redirectModal";
import ChainID from "../Blockchain/chainId";
import Moralis from "moralis";
import axios from "axios";
import { ethers, BigNumber } from "ethers";
import { toast } from "react-toastify";
import { stringify } from "postcss";

const isTest = process.env.ENVIRONMENT === "dev";

const mobileCheck = () => {
  let check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  return check; //returns true on mobile
};

const checkIOS = () => {
  const userAgent = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(userAgent)) {
    return true;
  }
  return false;
}

export default function Header({ elem }) {

  const routerlink = ["staking", "bond", "mint", "transfer", "nfts"];
  const [current, setCurrent] = useState(routerlink[0]);
  const [showMobileMenu, setMobileMenu] = useState(false);
  const [addBg, setBg] = useState(null);
  const [homeScreen, setHomeScreen] = useState(false);
  const getHeader = useRef("");
  const logOutMenu = useRef("");
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [logoModalShow, setLogoModalShow] = useState(false);
  const [pozBalance, setPozBalance] = useState(0);
  const [currentChain, setCurrentChain] = useState(0);
  const [detectNFT, setDetectNFT] = useState(false)
  const [imgUrl, setImgUrl] = useState('/img/header/noPozzleNFT.svg')
  const { disconnect } = useDisconnect();
  const [purchaseDeepUrl, setPurchaseDeepUrl] = useState('/purchase')

  const isMobile = useMediaQuery({
    query: '(max-width: 1024px)'
  })

  const isResponsive = useMediaQuery({ minWidth: 1025, maxWidth: 1200 })

  // console.log("present router is", router.pathname)
  const metaTitle = (router.pathname == "/purchase") ? 'Purchase POZ' : 'Pozzle Planet';
  const metaDescription = 'Pozzle Planet is an Impact-2-Earn protocol and mobile-app where you can earn POZ by joining and sharing positive actions via video';

  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();
  const { chain } = useNetwork()
  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork()

  const handleClickAway = () => {
    setLogoModalShow(false)
  };

  const getPozBalance = async () => {
    try {
      const pozContract = (await getContractData()).pozTokenContract;
      const balance = await pozContract.balanceOf(address)
      const pozValue = parseInt(balance) / (10 ** 18)
      setPozBalance((pozValue >= 1000) ? pozValue.toFixed(0) : pozValue.toFixed(2))
    } catch (e) {

    }
  }

  const logOut = async () => {
    // if (chain) {
    //   if (chain.id !== (isTest ? ChainID.mumbai : ChainID.polygon)) {
    //     toast.error(`Please switch your network to ${isTest ? 'Mumbai' : 'Polygon'}`, {
    //       type: toast.TYPE.ERROR,
    //     });
    //     switchNetwork?.(isTest ? ChainID.mumbai : ChainID.polygon)
    //     return;
    //   }
    // }
    try {
      openAccountModal()
    } catch (e) {
      toast.success("You have successfully logged out.", {
        type: toast.TYPE.SUCCESS,
      });
      disconnect()
      return;
    }
    console.log("logged out");

  };

  useEffect(() => {
    if (router.pathname == "/") {
      return setHomeScreen(true);
    }
    setHomeScreen(false);
    return () => { };
  }, [router]);

  useEffect(() => {
    if (router.pathname == "/purchase" && isConnected && pozBalance > 0) {
      logOutMenu?.current?.style?.height = "200px";
    } else if (router.pathname == "/purchase" && isConnected && pozBalance == 0) {
      logOutMenu?.current?.style?.height = "unset";
    } else {
      logOutMenu?.current?.style?.height = "unset";
    }
  }, [router])

  useEffect(() => {
    const isHash = router.asPath?.split("#");
    const uri = router.asPath?.split("/");
    if (isHash[1]) {
      setCurrent(isHash[1]);
    } else if (uri[1]) {
      setCurrent(uri[1]);
    } else {
      setCurrent("");
    }
    return () => { };
  }, [router]);

  useEffect(() => {
    getHeader.current = document.querySelector(elem);
    if (getHeader.current) {
      window.addEventListener("scroll", () => {
        const { y } = getHeader.current.getBoundingClientRect();
        if (y < 78) {
          setBg(true);
        } else {
          setBg(null);
        }
      });
      return window.removeEventListener("scroll", () => { });
    }
    return () => { };
  }, [elem]);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 32) {
        setBg(true);
      } else {
        setBg(false);
      }
    });
    // console.log("Iphone Check is, ", checkIOS())
    return () => { };
  }, []);

  useEffect(() => {
    (async () => {
      isConnected ? getPozBalance() : setPozBalance(0)
      setLogoModalShow(false)
      try {
        let nfts = []
        const currentChainID = ethers.utils.hexValue(BigNumber.from(chain.id))  //change chain id into hex value
        setCurrentChain(currentChainID)
        // console.log("current chain is", ethers.utils.hexValue(BigNumber.from(chain.id)))

        const options = {
          method: 'GET',
          url: `https://deep-index.moralis.io/api/v2/${address}/nft`,
          // url: `https://deep-index.moralis.io/api/v2/0xAc052bA295Ce556404526E9fFAafa0F177782148/nft`,
          params: { chain: currentChainID, format: 'decimal' },
          // params: { chain: 'polygon', format: 'decimal' },
          headers: { accept: 'application/json', 'X-API-Key': process.env.MORALIS_API_KEY ? process.env.MORALIS_API_KEY : 'ndSbBCUm0rOUjj0wI2sShQHENCpHlv1geth2O41AqzZLbdsLEVSty7LkX5xLimwi' }
        };

        axios
          .request(options)
          .then(function (response) {
            nfts = response.data.result
            nfts.map((nft, idx) => {
              let jsonMetadata = JSON.parse(nft.metadata)
              if (jsonMetadata?.name?.includes('Pozzle')) {
                setImgUrl(jsonMetadata.image)
                setDetectNFT(true)
                return;
              }
            })
            if (detectNFT) {
              // toast.success("You have Pozzlenaut NFTs in your wallet!", {
              //   type: toast.TYPE.SUCCESS,
              // });
            }
          })
          .catch(function (error) {
            console.error(error);
            setDetectNFT(false)
          });

      } catch (e) {
        setImgUrl('/img/header/noPozzleNFT.svg')
        // toast.error("You don't have any Pozzle NFTS in your wallet.", {
        //   type: toast.TYPE.ERROR,
        // });
        return
      }

    })()
  }, [address, isConnected, pozBalance, currentChain]);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div
        className={`header ${addBg ? "addblur" : "addblur"} ${homeScreen ? "home" : ""
          }`}
      >
        <Head>
          <title>{metaTitle}</title>
          <meta name="title" content={metaTitle} />
          <meta name="description" content={metaDescription} />
          <meta property="og:title" content={metaTitle} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={`${process.env.NEXT_PUBLIC_URL}/img/Welcome_preview.png`} />
          <meta property="og:description" content={metaDescription} />
          <meta name="theme-color" content="#FF0000" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_URL}/img/Welcome_preview.png`} />
        </Head>
        <div className="nav-bar d-flex justify-content-between">
          <div className="logo d-flex align-items-center">
            <Link href="/">
              <a className="yCenter">
                <img
                  className="d-none d-lg-flex"
                  src="/img/PozzlePlanet.svg"
                  width={320}
                  alt="img-lg"
                />
                <img
                  className="d-flex d-lg-none"
                  src="/img/PozzlePlanet-md.svg"
                  width={160}
                  alt="img-md"
                />
              </a>
            </Link>
          </div>
          <div
            className={`align-items-center links-cover`}
          >
            <ul className="d-flex mb-0">
              <li className={(router.pathname == "/purchase") ? 'header_link' : ''} style={{ cursor: "pointer" }}>
                <Link href={purchaseDeepUrl}>
                  {isResponsive ?
                    'Buy POZ'
                    :
                    'Purchase POZ'
                  }

                </Link>
              </li>
              <li className={(router.pathname == "/mint") ? 'header_link' : ''} style={{ cursor: "pointer" }}>
                <Link href="/mint">
                  {isResponsive ?
                    'Mint'
                    :
                    'Pozzlenauts Mint'
                  }
                </Link>
              </li>
              <li style={{ cursor: "pointer" }}>
                <a
                  href="https://pozzleplanet.medium.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Medium
                </a>
              </li>
              <li style={{ cursor: "pointer" }}>
                <a
                  href="https://pozzle-planet-1.gitbook.io/poz-purplepaper/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Purplepaper
                </a>
              </li>

            </ul>
          </div>
          <div className="wallet-button wallet-button-desktop">
            <div className="flex">
              <div className="navbar-connect-padding chain-icon">
                <div className="flex align-items-center navbar-connect-wallet">
                  <img src='/img/coins/Polygon.svg' alt="" />
                </div>
              </div>
              <WalletButton>
              </WalletButton>
            </div>
            {!address ?
              <img src='/img/bonding/noAccount.svg' className="vector" alt="" onClick={openConnectModal} /> :
              <></>
            }

            {(address && pozBalance) ?
              <>
                <img src='/img/header/hexagon_outside.svg' className="vector" />
                <img src={imgUrl} className="vector nft-img" alt="Pozzle" onClick={() => setLogoModalShow(!logoModalShow)} />
              </>
              :
              <></>
            }

            {(address && pozBalance == 0) ?
              <>
                <img src='/img/header/hexagon_outside.svg' className="vector" />
                <img src={imgUrl} className="vector nft-img" alt="Pozzle" onClick={() => setLogoModalShow(!logoModalShow)} />
              </>
              :
              <></>
            }
          </div>
          <button className="wallet-button wallet-button-mobile">
            <div className="flex">
              <div className="navbar-connect-padding">
                <div className="flex align-items-center navbar-connect-wallet">
                  <img src='/img/coins/Polygon.svg' alt="" />
                </div>
              </div>

            </div>
            {!address &&
              <img src='/img/bonding/noAccount.svg' className="vector" alt="" onClick={() => setLogoModalShow(!logoModalShow)} />
            }

            {(address && pozBalance > 0) &&
              <>
                <img src='/img/header/hexagon_outside.svg' className="vector" />
                <img src={imgUrl} className="vector nft-img" alt="" onClick={() => setLogoModalShow(!logoModalShow)} />
              </>
            }

            {(address && pozBalance == 0) &&
              <>
                <img src='/img/header/hexagon_outside.svg' className="vector" />
                <img src={imgUrl} className="vector nft-img" alt="" onClick={() => setLogoModalShow(!logoModalShow)} />
              </>
            }
          </button>
        </div>
        {(isMobile || isConnected) &&
          <div className="logo-menu">
            <div>
              <div ref={logOutMenu} className={`logOut-menu ${logoModalShow ? 'show-modal' : 'hide-modal'}`} style={{ height: pozBalance > 0 ? '' : 'unset' }}>
                {pozBalance > 0 &&
                  <div className="flex-bar">
                    <img src="/img/header/poztoken.svg" />
                    <span className="ml10 color25505">{pozBalance} POZ</span>
                  </div>
                }
                {
                  (router.pathname == "/purchase") ?
                    <></>
                    :
                    <div className={`flex-bar ${pozBalance > 0 ? 'mt20' : ''}`}>
                      <img src="/img/header/cash.svg" style={{ marginLeft: '3px' }} />
                      <div className="ml14" onClick={() => router.push('/purchase')}>Buy POZ</div>
                    </div>
                }
                <div className={`flex-bar ${((isConnected && pozBalance > 0) || router.pathname !== "/purchase") ? 'mt20' : 'mt0'}`}>
                  <img src="/img/header/logout.svg" />
                  {isConnected ?
                    <div className="ml10" onClick={logOut}>Log out
                    </div>
                    :
                    <div className="ml10" onClick={openConnectModal}>Connect
                    </div>
                  }
                </div>
                <div className="flex-line" />
                <div className="flex-bar">
                  <img src="/img/header/interrogation.svg" />
                  <div className="ml10 gradcolor" onClick={() => router.push('https://discord.gg/wgc8hjGmR5')}>Help</div>
                </div>
              </div>
            </div>
          </div>
        }

      </div >
    </ClickAwayListener>
  );
}
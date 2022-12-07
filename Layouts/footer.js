/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { FaTelegramPlane, FaTwitter, FaGithub } from "react-icons/fa";
import { BsDiscord } from "react-icons/bs";
import ClickAwayListener from 'react-click-away-listener';
import { useMediaQuery } from 'react-responsive';
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

const Body = styled.div`
  background: linear-gradient(135deg, rgba(42, 208, 202, 0.1) 0%, rgba(126, 225, 155, 0.1) 9.19%, rgba(225, 246, 100, 0.1) 20.05%, rgba(254, 176, 254, 0.1) 39.84%, rgba(171, 179, 252, 0.1) 62.24%, rgba(93, 247, 164, 0.1) 80.99%, rgba(88, 196, 246, 0.1) 100%);
  border-top: 0.5px solid rgba(223, 212, 255, 0.08);
  backdrop-filter: blur(30px);
  @media (max-width: 480px){
    background: rgba(54, 37, 102, 0.05);
    backdrop-filter: blur(30px);
  }
`

export default function Footer() {

  const [purchaseDeepUrl, setPurchaseDeepUrl] = useState('/purchase')
  const [handleState, setHandleState] = useState(false);
  const mySidepanel = useRef();
  const router = useRouter();

  // check if viewpoint is desktop or mobile
  const isMobile = useMediaQuery({
    query: '(max-width: 1024px)'
  })

  const menudata = [
    { imgurl: '/img/footer/foot7.svg', text: 'Mint', url: '/mint' },
    { imgurl: '/img/footer/foot8.svg', text: 'Purchase POZ', url: `${purchaseDeepUrl}` },
    // {imgurl: '/img/footer/foot4.svg', text: 'Stake', url: '/staking'},
    { imgurl: '/img/footer/foot3.svg', text: 'Purplepaper', url: 'https://pozzle-planet.gitbook.io/poz-purplepaper/' },
    // {imgurl: '/img/footer/foot2.svg', text: 'Community', url: ''},
    { imgurl: '/img/footer/foot1.svg', text: 'Pozzle Planet App', url: 'https://appdistribution.firebase.dev/i/0843056d6a009256' }
  ]

  useEffect(() => {
    if (handleState) {
      mySidepanel.current.style.height = `${menudata.length * 62 + 64}px`;
      mySidepanel.current.style.marginTop = "25px";
      mySidepanel.current.style.WebkitBackdropFilter = "blur(32px)";
      mySidepanel.current.style.backdropFilter = "blur(32px)";
    } else {
      mySidepanel.current.style.height = "0px";
      mySidepanel.current.style.margin = "0px";
    }
  }, [handleState])

  useEffect(() => {
    // console.log("!isMObile || handleState display status", (!isMobile || handleState))
    setHandleState(false)
  }, [])

  const menuHidden = () => {
    mySidepanel.current.style.height = "0px";
    mySidepanel.current.style.margin = "0px";
    setHandleState(false)
  }

  return (
    <div className="foot-container">
      <ClickAwayListener onClickAway={menuHidden}>
        <div className="w-full flex flex-col align-items-center ">
          <div className="foot-main-div">
            <button onClick={() => setHandleState(!handleState)} className="foot-main-img" src="/img/footer/menu-icon.svg" />
          </div>
          <div ref={mySidepanel} id='mySidepanel' className="sidepanel">
            {
              menudata.map((item, idx) => (
                <a
                  key={idx}
                  className='flex align-items-center footer-buttons'
                  style={{ background: (item.url == router.pathname) ? '#875CFF' : '' }}
                >
                  <div
                    onClick={() => router.push(item.url)}
                    className="flex align-items-center"
                  >
                    <div className="foot-item-img"><img src={item.imgurl} /></div>
                    {item.text}
                  </div>
                </a>
              ))
            }
          </div>
        </div>
      </ClickAwayListener>

      <Body className="footer">
        <div className="icons">
          <a
            className="color-white mx-3"
            href="https://discord.gg/bQtWMh5HBa"
            target="_blank"
            rel="noreferrer"
          >
            <BsDiscord style={{ width: "25px", height: "auto" }} />
          </a>
          <a
            className="color-white mx-3"
            target="_blank"
            href="https://github.com/PozzlePlanet/"
            rel="noreferrer"
          >
            <FaGithub style={{ width: "25px", height: "auto" }} />
          </a>
          <div
            className="main-img"
            style={{
              display: (handleState)
                ? 'none'
                : 'block'
            }}
          >

          </div>
          <a className="d-none color-white" target="_blank">
            <img className="" src="/img/footer/menu-icon.svg" alt="polyy" />
          </a>
          <a
            className="color-white mx-3"
            target="_blank"
            href="https://twitter.com/PozzlePlanet"
            rel="noreferrer"
          >
            <FaTwitter style={{ width: "25px", height: "auto" }} />
          </a>
          <a
            className="color-white mx-3"
            target="_blank"
            href="https://t.me/pozzleplanet"
            rel="noreferrer"
          >
            <FaTelegramPlane
              style={{ width: "25px", height: "auto" }}
              className="mr-0"
            />
          </a>
        </div>
      </Body>
    </div>
  );
}

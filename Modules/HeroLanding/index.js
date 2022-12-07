import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useMediaQuery } from 'react-responsive'
import Image from "next/image"
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import axios from "axios";
import Lottie from "lottie-react";
import RotatingEarth from './../../Components/Animation/Rotating_Earth_Foreground.json';
import MovingStarsBackground from './../../Components/Animation/Moving_Stars_Background.json'

// https://testapi.pozzleplanet.com/v1/engagement/alltime

const getStatusData = async () => {
  try {
    const response = await axios.get(`${process.env.BACKEND_API_URL}/engagement/alltime`);
    if (response) {
      return response.data
    }
  } catch (error) {
    console.error(error);
  }
}

const HeroLanding = () => {

  const router = useRouter();
  const { isConnected, address } = useAccount();
  const isMobile = useMediaQuery({
    query: '(max-width: 1024px)',
  })
  const [statusData, setStatusData] = useState({
    pozzleVideos: '...',
    POZEarned: '...',
    countOfPledges: '...',
    pozitiveStamps: '...'
  })
  useEffect(() => {
    const interval = setInterval(async () => {
      const positiveValue = await getStatusData();
      setStatusData({
        pozzleVideos: positiveValue ? positiveValue.pozzleVideos : 0,
        POZEarned: positiveValue ? positiveValue.POZEarned.toFixed(2) : 0,
        countOfPledges: positiveValue ? positiveValue.countOfPledges : 0,
        pozitiveStamps: positiveValue ? positiveValue.pozitiveStamps : 0
      })
    }, 15000);
    return () => clearInterval(interval);

  }, [statusData])

  useEffect(() => {
    (async () => {
      const positiveValue = await getStatusData();
      setStatusData({
        pozzleVideos: positiveValue ? positiveValue.pozzleVideos : 0,
        POZEarned: positiveValue ? positiveValue.POZEarned.toFixed(2) : 0,
        countOfPledges: positiveValue ? positiveValue.countOfPledges : 0,
        pozitiveStamps: positiveValue ? positiveValue.pozitiveStamps : 0
      })
    })()
  }, [])

  return (
    <div className="homePage">
      {/* <div className="homePage_background">
        <Lottie animationData={MovingStarsBackground} loop={true} />
      </div> */}
      <div className="homePage_body">
        <div className="relative h-100">
          <div className="h-100 homePage_wrapper">
            <div className="hero_left_section">
              <div className="hero_left_wrapper">
                <div className="hero_main_text_with_emoji">
                  🔴 RECORD <br />🤏 SOMETHING <br />🌍 POZITIVE.
                </div>
                {/* <img src="img/home/hero_main_text.svg" className="origin_text" />
                <img src="img/home/hero_main_text_mobile.svg" className="mobile_text" /> */}
                <div className="left_text">
                  Pozzle Planet is a fun, simple and pozitive way to join activities with friends and people all over the world. Record yourself doing a pozitive activity and get rewarded for it by earning POZ, our new currency for a pozitive world.
                </div>
                <div className="app_button_group">
                  <a className="apple_app_btn" target="_blank" href='https://apps.apple.com/us/app/pozzle-planet/id1611343323' rel="noopener noreferrer">
                    <img className="app_btn" src="img/home/apple_badge.svg" />
                  </a>
                  <a className="google_play_btn" target="_blank" href='https://play.google.com/store/apps/details?id=com.pozzleplanet' rel="noopener noreferrer">
                    <img className="app_btn" src="img/home/google_badge.svg" />
                  </a>
                </div>
              </div>
            </div>
            <div className="hero_right_section">
              <div className="hero_right_wrapper">
                <div className="phone_wrapper">
                  <img src="img/home/iphone_container.png" className="iphone_container" />
                  <div className="inner_text_wrapper">
                    <div className="inner_text_content">
                      <img className="inner_icons" src="img/home/add_pozzle_icon.svg" />
                      <div className="inner_value">{statusData.pozzleVideos}</div>
                      <div className="inner_title">Pozzles Added</div>
                    </div>
                    <div className="inner_text_content mt-3">
                      <img className="inner_icons" src="img/home/poz_token_icon.svg" />
                      <div className="inner_value">{statusData.POZEarned}</div>
                      <div className="inner_title">POZ Earned</div>
                    </div>
                    <div className="inner_text_content mt-3">
                      <img className="inner_icons" src="img/home/pledge_icon.svg" />
                      <div className="inner_value">{statusData.countOfPledges}</div>
                      <div className="inner_title">Pledges Made</div>
                    </div>
                    <div className="inner_text_content mt-3">
                      <img className="inner_icons" src="img/home/pozitive_stamp_icon.svg" />
                      <div className="inner_value">{statusData.pozitiveStamps}</div>
                      <div className="inner_title">Stamps Given</div>
                    </div>
                  </div>
                </div>

              </div>
              <div className="bottom_earth">
                <div className="lottie_wrapper">
                  <Lottie animationData={RotatingEarth} loop={true} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

export default HeroLanding;
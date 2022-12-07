import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import Button from "../Button";
import { ethers } from "ethers";
import { useRouter } from 'next/router'

const RedirectModal = ({
  setRedirectModalState,
  deepLink
}) => {

  return (
    <div style={{
      overflow: 'auto',
      background: '#F8F8F8',
      borderRadius: '16px',
      borderWidth: '1px 1px 0px 1px',
      borderStyle: 'solid',
      borderColor: 'rgba(223, 212, 255, 0.08)',
      boxShadow: '0px -6px 24px rgba(0, 0, 0, 0.25)',
      userSelect: 'none',
      maxWidth: '640px'
    }}
      className="w-full my-1"
    >
      <div className="wallet_union">
        <img src='/img/bonding/pozzleplanet_union.svg' />
      </div>
      <div className="popup_title">
        Go To Your Wallet Web Browser
      </div>
      <div className="popup_content">
        To continue to purchase POZ, please open our website from inside your wallet's in-app browser.
        <br /><br />
        You can copy and paste the address to continue:
        <br /><br />
      </div>
      <div className="popup_purple_button">
        <Button
          variant='purple'
          className='w-full flex justify-content-center whitespace-nowrap'
          onClick={() => window.location.replace(deepLink)}
        >
          Go to Wallet
        </Button>
      </div>
      <div className="popup_white_button">
        <Button
          variant='white'
          className='w-full flex justify-content-center whitespace-nowrap'
          onClick={() => setRedirectModalState(false)}
        >
          Close
        </Button>
      </div>
    </div>
  )
}

export default RedirectModal
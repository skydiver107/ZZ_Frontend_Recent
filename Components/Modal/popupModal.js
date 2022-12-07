import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import Button from "../Button";
import { useRouter } from 'next/router'

const PopupModal = ({
  setNoBalancePopupModalStatus
}) => {
  const [deepUrlLink, setDeepUrlLink] = useState('')

  useEffect(() => {
    let connectedWallet = window.localStorage.getItem("wagmi.wallet")
    let connectedStatus = window.localStorage.getItem("wagmi.connected")

    let publicUrl = ''
    publicUrl = process.env.NEXT_PUBLIC_URL
    const NEXT_DAPP_URL = publicUrl?.slice(8)
    const metaMaskDeepUrl = `https://metamask.app.link/dapp/${NEXT_DAPP_URL}`
    const trustWalletDeepUrl = `https://link.trustwallet.com/open_url?coin_id=966&url=${process.env.NEXT_PUBLIC_URL}`   //coin id == 966 equals to Matic, 60 equals to Eth

    if (JSON.parse(connectedWallet) == "metaMask" && connectedStatus) {
      setDeepUrlLink(metaMaskDeepUrl)

    } else if (JSON.parse(connectedWallet) == "trustWallet" && connectedStatus) {
      setDeepUrlLink(trustWalletDeepUrl)
    }

  }, [])

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
        <img src='/img/bonding/wallet_union.svg' />
      </div>
      <div className="popup_title">
        Oops! Not enough USDC Available!
      </div>
      <div className="popup_content">
        Unfortunately it appears you have insufficient USDC funds to purchase POZ. To get some USDC please go to your wallet app and top up.
        <br /><br />
      </div>
      <div className="popup_purple_button">
        <Button
          variant='purple'
          className='w-full flex justify-content-center whitespace-nowrap'
          onClick={() => window.location.replace(deepUrlLink)}
        >
          Go to Wallet
        </Button>
      </div>
      <div className="popup_white_button">
        <Button
          variant='white'
          className='w-full flex justify-content-center whitespace-nowrap'
          onClick={() => setNoBalancePopupModalStatus(false)}
        >
          Close
        </Button>
      </div>
    </div>
  )
}

export default PopupModal
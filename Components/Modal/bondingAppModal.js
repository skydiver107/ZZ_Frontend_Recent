import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import Button from "../Button";
import { ethers } from "ethers";

import CountdownComponent from "../CountDown/Countdown";
import getContractData from "../Bonding/GetContractData";
import { Web3ModalContext } from '../../Contexts/Web3ModalProvider';
import { useAccount, useConnect, useNetwork, useProvider, useSigner, useSwitchNetwork } from "wagmi";
import ClaimingTxModal from "./claimingTxModal";
import ChainID from "../../Blockchain/chainId";
import { useMediaQuery } from 'react-responsive'
import PopupModal from "./popupModal";

import {
  USDT_TOKEN_address,
  Bonding_address
} from "../../Blockchain/addresses";
const isTest = process.env.ENVIRONMENT === "dev";
// const isTest = false
const BondingModal = ({
  BuyPOZwithUSDC,
  setModalState,
  setComplete,
  modalState,
  claimPOZ,
  complete,
  silence,
  time,
  usdcLockTime,
  lastAmount,
  pozPrice,
  totalPozAmount,
  claimingText,
  approveStatus,
  bondingStatus,
  claimingStatus,
  claimingModalStatus,
  claimablePozToken,
  claimTxHash,
  lastClaimHash,
  setClaimingModalStatus,
  treasureBalance,
  detectNFT
}) => {

  const [usdtAmount, setUsdtAmount] = useState('');
  const [pozAmount, setPozAmount] = useState(0);
  const [usdtBalance, setUsdtBalance] = useState(0);
  const { isConnected, address } = useAccount();
  const [discount, setDiscount] = useState(0);
  const [errorText, setErrorText] = useState('');
  const [errorStatus, setErrorStatus] = useState(false);
  const [lock_period, setLockPeriod] = useState(0);
  const [claimablePoz, setClaimablePoz] = useState(0);
  const [loadingText, setLoadingText] = useState('');
  const [fundMaxStatus, setFundMaxStatus] = useState(false)
  const [newBondingStatus, setNewBondingStatus] = useState('')
  const [noBalancePopupModalStatus, setNoBalancePopupModalStatus] = useState(false)

  const isMobile = useMediaQuery({
    query: '(max-width: 1024px)'
  })

  const priceinputChange = (e) => {
    e.preventDefault();
    let inputUsdtValue = e.target.value

    if (1000000 < parseInt(inputUsdtValue * pozPrice)) {
      setErrorStatus(true)
      setErrorText("You can't buy more than 1,000,000 Poz.")
      return;
    }

    if (1000000 >= parseInt(inputUsdtValue * pozPrice)) {
      setErrorStatus(false)
      setErrorText('');
    }

    setUsdtAmount(inputUsdtValue);

  }

  const getUSDTBalance = async () => {
    try {
      setLoadingText('Please wait...')
      const usdtContract = (await getContractData()).usdtContract;
      const balance = await usdtContract.balanceOf(address)
      // console.log("usdtContract is", usdtContract, balance, parseInt(balance), "12" * (10 ** 6))

      setUsdtBalance(isTest ? (parseInt(balance) / (10 ** 18)) : parseInt(balance) / (10 ** 6))
      if (balance == 0) setLoadingText('0.00')
    } catch (e) {
      setLoadingText('0.00')
      return;
    }
  }

  const getMaxAmount = async () => {
    if (usdtBalance <= 1000000) {
      // console.log("usdtBalance is", usdtBalance)
      setPozAmount(usdtBalance * pozPrice)
      setUsdtAmount(usdtBalance)
      setErrorText('')
      setErrorStatus(false)
    } else {
      setPozAmount(1000000)
      setUsdtAmount(100000)
      setErrorText('')
      setErrorStatus(false)
    }

  }

  const claimStatusChange = () => {
    setClaimingModalStatus(!claimingModalStatus);
  }

  useEffect(() => {
    if (usdtAmount) {
      setPozAmount(usdtAmount * pozPrice)
    }
  }, [usdtAmount]);

  useEffect(() => {
    (async () => {
      const txStatus = window.localStorage.getItem('bondingModal')
      setNewBondingStatus(txStatus)
      // console.log("txstatus is", newBondingStatus == 'open')
      getUSDTBalance()
      try {
        const bonding = (await getContractData()).bondingContract;
        let getClaimablePoz = await bonding.getClaimablePoz(address, USDT_TOKEN_address)
        const cPoz = parseInt(getClaimablePoz) / (10 ** 18)
        setClaimablePoz(cPoz)
        const discountData = await bonding.BOND_DISCOUNT();
        setDiscount(parseInt(discountData))
        const lock_period = await bonding.LOCK_PERIOD()
        setLockPeriod(parseInt(lock_period))
        // console.log("pozamount data", pozAmount)
      } catch (e) {
        return;
      }
    })();
  }, []);


  const handleClose = () => {
    setModalState(0);
    // setNewBondingStatus(true)
    window.localStorage.setItem('bondingModal', 'close')
    document.body.style.overflow = "auto";
  }

  const buyPozHandle = async () => {
    // console.log("usdtAmount", (usdtAmount) > (usdtBalance))
    window.localStorage.setItem('bondingModal', 'open')
    const txStatus = window.localStorage.getItem('bondingModal')
    setNewBondingStatus(txStatus)
    if (isNaN(usdtAmount)) {
      setErrorText("Please input a valid number.")
      setErrorStatus(true)
      return;
    }

    if (usdtBalance == 0) {
      setErrorText("Your balance is insufficient.")
      setErrorStatus(true)
      setNoBalancePopupModalStatus(true)
      return;
    }

    if ((usdtAmount) > (usdtBalance)) {
      setErrorText("Your balance is insufficient.")
      setErrorStatus(true)
      return;
    }



    if (usdtAmount) {
      if (modalState === 1) {
        BuyPOZwithUSDC('USDC', usdtAmount);
      } else if (modalState === 2) {
        BuyPOZwithUSDC('BCT', usdtAmount);
      } else if (modalState === 3) {
        BuyPOZwithUSDC('SLR', usdtAmount);
      }
    } else {
      setErrorText("Please input value");
      setErrorStatus(true)
    }
  }

  // execute buypozhandle event when pressing enter key
  const handleEnterKeyDown = async (event) => {
    if (event.key === 'Enter') {
      window.localStorage.setItem('bondingModal', 'open')
      const txStatus = window.localStorage.getItem('bondingModal')
      setNewBondingStatus(txStatus)
      if (isNaN(usdtAmount)) {
        setErrorText("Please input a valid number.")
        setErrorStatus(true)
        return;
      }

      if (parseInt(usdtAmount) > parseInt(usdtBalance)) {
        setErrorText("Your balance is insufficient.")
        setErrorStatus(true)
        return;
      }

      if (usdtAmount) {
        if (modalState === 1) {
          BuyPOZwithUSDC('USDC', usdtAmount);
        } else if (modalState === 2) {
          BuyPOZwithUSDC('BCT', usdtAmount);
        } else if (modalState === 3) {
          BuyPOZwithUSDC('SLR', usdtAmount);
        }
      } else {
        setErrorText("Please input value");
        setErrorStatus(true)
      }
    }
  }

  return (
    <div className="bonding-modal-container">
      <div className="modal-wrapper">
        {!claimingModalStatus && !noBalancePopupModalStatus &&
          <div style={{
            overflow: 'auto',
            background: 'linear-gradient(11.52deg, #362566 41.52%, #22134D 97.29%)',
            borderRadius: '16px',
            borderWidth: '1px 1px 0px 1px',
            borderStyle: 'solid',
            borderColor: 'rgba(223, 212, 255, 0.08)',
            boxShadow: '0px -6px 24px rgba(0, 0, 0, 0.25)',
            userSelect: 'none'
          }}
            className="w-full my-1"
          >
            <div className="modal-header w-full bgcolor251 modal-header">
              <div className="flex align-items-center f-OpenSans text-lg">
                <img className="w-6 mr-2" src={silence.imgurl} />
                {silence.name}/POZ
              </div>
              <Link href='#'>
                <div onClick={handleClose} className="color875 font-bold text-lg cursor-pointer">
                  Done
                </div>
              </Link>
            </div>
            <div className="modal-body">
              <div className="leftsection gradbgcolor">
                <div className="p-3 rounded-4 bgcolor251 text-sm leftsign">
                  <div className="flex align-items-center justify-content-between">
                    <div className="flex align-items-center">
                      <img className="w-8" src={silence.imgurl} />
                      <div className="ml16 f-OpenSans font-semibold">
                        <div className="text-base">{silence.name}</div>
                        <div className="text-sm color248">{silence.subname}</div>
                      </div>
                    </div>
                    {time && !complete ?
                      <div className={`flex align-items-center color25505`}>
                        Locked
                        <img className="ml-2" src="/img/bonding/lock.svg" />
                      </div> : <></>
                    }
                    {
                      complete ?
                        <div className={`flex align-items-center color4ff`}>
                          Unlocked
                          <img className="ml-2" src="/img/bonding/unlock.svg" />
                        </div> : <></>
                    }
                  </div>
                  <div className="w-full bdcolor223 mt-3 mb-3"></div>
                  <div>
                    <div className="flex justify-content-between align-items-center">
                      {time ? <div>Bond price</div> : <div>POZ price</div>}
                      <div className="f-Hanson font-bold text text-xl lh21">$ {1 / pozPrice}0</div>
                    </div>
                    <div className="flex justify-content-between align-items-center textgradcolor mt-1 font-bold">
                      <div className="flex align-items-center  font-bold">
                        Discount (%)
                        {time ?
                          <img className="ml6" src="/img/bonding/info.svg" /> : ''}
                      </div>
                      <div className=" font-bold">
                        {
                          detectNFT ?
                            <>1.50%</>
                            :
                            <>-</>
                        }
                      </div>
                    </div>
                    {complete ?
                      <div className={` font-bold flex justify-content-between align-items-center mt-1 color4ff`}>
                        <div>Claimable tokens</div>
                        <div>{lastAmount * pozPrice} POZ</div>
                      </div> : <></>}
                    {time > 0 && !complete ?
                      <div className=" font-bold flex justify-content-between align-items-center color875 mt-1">
                        <div>Currently locked</div>
                        <div>{lastAmount * pozPrice} POZ</div>
                      </div> : <></>}
                    {time > 0 ?
                      <div className=" font-bold flex justify-content-between align-items-center color25505 mt-1">
                        <div>Total exchanged</div>
                        <div>{(totalPozAmount / pozPrice).toFixed(2)} USDC</div>
                      </div> : <></>}

                    <div className=" font-bold flex justify-content-between align-items-center color25505 mt-1">
                      <div>Duration</div>
                      <div>5 MINS</div>
                    </div>
                    {time > 0 ?
                      <div className=" font-bold flex justify-content-between align-items-center color25505 mt-1">
                        <div>Bonding end</div>
                        <div className="flex ">
                          {time > 0 && !complete ? <CountdownComponent
                            setComplete={setComplete}
                            inputTime={usdcLockTime}
                          /> : <>0 </>}
                        </div>
                      </div> : <></>}
                    <div className=" font-bold flex justify-content-between align-items-center color25505 mt-1">
                      <div>Available for purchase</div>
                      <div>{treasureBalance.toFixed(2)} POZ</div>
                    </div>
                    <div className=" font-bold flex justify-content-between align-items-center color25505 mt-1">
                      <div>Contract</div>
                      <a
                        className="flex align-items-center cursor-pointer color875"
                        target="_blank"
                        href={
                          isTest ?
                            `${process.env.MUMBAISCAN_URL}/address/${Bonding_address}`
                            :
                            `${process.env.POLYGONSCAN_URL}/address/${Bonding_address}`
                        }
                        rel="noopener noreferrer"
                      >
                        View <img className="ml6" src="/img/bonding/Vector2.png" />
                      </a>
                    </div>
                    <div className="w-full mt-3">
                      {(usdcLockTime > 0) &&
                        <Button
                          hasBorder={false}
                          disabled={true}
                          className='w-full op60 flex justify-content-center whitespace-nowrap'
                        >Claimable in
                          <CountdownComponent
                            setComplete={setComplete}
                            inputTime={time}
                          />
                        </Button>
                      }
                      {
                        ((usdcLockTime <= 0 && claimablePozToken > 0)) &&
                        <Button
                          hasBorder={true}
                          className='w-full'
                          onClick={() => { claimPOZ(); setComplete(false) }}
                        >
                          {claimingText}
                        </Button>
                      }
                      {
                        (claimingStatus && complete) &&
                        <Button
                          hasBorder={false}
                          disabled={true}
                          className='w-full op60 flex justify-content-center whitespace-nowrap'
                        >Claiming now...
                        </Button>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="rightsection f-OpenSans">
                <div className="font-semibold text-base text-center color248">
                  {(!complete && claimablePozToken == 0 && time <= 0) && 'Swap your USDC tokens to buy POZ and claim in 5 mins.'}
                  {(((time > 0 && !complete) || (time <= 0 && claimablePozToken > 0 && !claimingStatus)) && (newBondingStatus === 'close')) && 'Swap your USDC tokens to buy POZ and claim in 5 mins.'}
                  {(time > 0 && !complete && (newBondingStatus === 'open')) && 'You successfully purchased POZ! Your tokens are now vesting and will be claimable soon.'}
                  {(time <= 0 && claimablePozToken > 0 && !claimingStatus && (newBondingStatus === 'open')) && 'Vesting period is over. You can now claim your POZ!'}
                </div>
                {(!((time > 0 && !complete) || (claimablePozToken > 0 && !claimingStatus))) &&
                  <>
                    <div className="flex justify-content-between color25505 font-normal text-xs mt-3">
                      <span className="f-OpenSans-medium">Exchange USDC</span>
                      <span className="f-OpenSans-medium">USDC available:&nbsp;{usdtBalance > 0 ? usdtBalance.toFixed(2) : loadingText}</span>
                    </div>
                    <div className="rect1 flex justify-content-between border-2 rounded-4 p-3" style={{ borderColor: errorStatus ? '#FF9075' : '' }}>
                      <div className="flex align-items-center text-base font-bold">
                        <img className="w-6 mr-2" src="/img/bonding/usdc-logo32.svg" />
                        <input
                          type='number'
                          value={usdtAmount}
                          className="price-input"
                          placeholder={isMobile ? 'Please input...' : 'Please input value'}
                          onChange={e => { priceinputChange(e); e.preventDefault() }}
                          // disabled={complete && !claimingStatus}
                          onKeyDown={handleEnterKeyDown}
                        />
                      </div>
                      <div className="textgradcolor fund-max-value" style={{ WebkitTextFillColor: errorStatus ? '#FF9075' : '' }} >
                        <div className="fund-max-title" onClick={() => { getMaxAmount() }}>Fund Max</div>
                      </div>
                    </div>
                    <div className="text-xs font-light mt-1 color-error">{errorText}</div>
                  </>
                }

                {(((time > 0 && !complete) || (claimablePozToken > 0 && !claimingStatus)) && (newBondingStatus === 'close')) &&
                  <>
                    <div className="flex justify-content-between color25505 font-normal text-xs mt-3">
                      <span className="f-OpenSans-medium">Exchange USDC</span>
                      <span className="f-OpenSans-medium">USDC available:&nbsp;{usdtBalance > 0 ? usdtBalance.toFixed(2) : loadingText}</span>
                    </div>
                    <div className="rect1 flex justify-content-between border-2 rounded-4 p-3" style={{ borderColor: errorStatus ? '#FF9075' : '' }}>
                      <div className="flex align-items-center text-base font-bold">
                        <img className="w-6 mr-2" src="/img/bonding/usdc-logo32.svg" />
                        <input
                          type='number'
                          value={usdtAmount}
                          className="price-input"
                          placeholder={isMobile ? 'Please input...' : 'Please input value'}
                          onChange={e => { priceinputChange(e); e.preventDefault() }}
                        // disabled={complete && !claimingStatus}
                        />
                      </div>
                      <div className="textgradcolor fund-max-value" style={{ WebkitTextFillColor: errorStatus ? '#FF9075' : '' }} onClick={() => { getMaxAmount() }}>
                        Fund Max
                      </div>
                    </div>
                    <div className="text-xs font-light mt-1 color-error">{errorText}</div>
                  </>
                }


                <div className="rect2 border-2">
                  <div className="flex justify-content-between items-start">
                    <div className="flex flex-col items-center">
                      <img src="/img/bonding/circle-usdc-logo.svg" />
                      <div className="text-box text-center f-Hanson leading-4 mt-3 text-base">
                        <div className="text-center">{usdtAmount ? usdtAmount : 0}</div>
                        <div>USDC</div>
                      </div>
                    </div>
                    <div className="h-12 flex justify-content-center items-center">
                      <img src="/img/bonding/center-circle.svg" />
                    </div>
                    <div className="text-box flex flex-col items-center">
                      <img src="/img/bonding/circle-poz-logo.svg" />
                      <div className="text2 text-center f-Hanson leading-4 mt-3 text-base">
                        <div className="textgradcolor">{pozAmount.toFixed(2)}</div>
                        <div className="textgradcolor">POZ</div>
                      </div>
                    </div>
                  </div>
                </div>

                {(!((time > 0 && !complete) || (time <= 0 && claimablePozToken > 0 && !claimingStatus))) &&
                  <div className="buypoz-btn">
                    <Button
                      variant='purple'
                      className={`w-full f-OpenSans font-bold text-lg ${errorStatus ? 'op60' : ''}`}
                      onClick={() => {
                        buyPozHandle();
                      }}
                      disabled={errorStatus ? true : false}
                    >
                      Buy POZ with USDC
                    </Button>
                  </div>
                }

                {(((time > 0 && !complete) || (time <= 0 && claimablePozToken > 0 && !claimingStatus)) && (newBondingStatus === 'close')) &&
                  <div className="buypoz-btn">
                    <Button
                      variant='purple'
                      className={`w-full f-OpenSans font-bold text-lg ${errorStatus ? 'op60' : ''}`}
                      onClick={() => {
                        buyPozHandle();
                      }}
                      disabled={errorStatus ? true : false}
                    >
                      Buy POZ with USDC
                    </Button>
                  </div>
                }

              </div>
            </div>
          </div>
        }
        {
          !claimingModalStatus && noBalancePopupModalStatus &&
          <PopupModal
            setNoBalancePopupModalStatus={setNoBalancePopupModalStatus}>

          </PopupModal>
        }

        {(claimingModalStatus) &&
          <ClaimingTxModal
            claimingModalStatus={claimingModalStatus}
            setClaimingModalStatus={setClaimingModalStatus}
            setModalState={setModalState}
            usdtAmount={usdtAmount}
            pozAmount={pozAmount}
            pozPrice={pozPrice}
            lastAmount={lastAmount}
            approveStatus={approveStatus}
            bondingStatus={bondingStatus}
            claimingStatus={claimingStatus}
            claimablePozToken={claimablePozToken}
            claimTxHash={claimTxHash}
          ></ClaimingTxModal>
        }
      </div>
    </div>
  )
}

export default BondingModal;
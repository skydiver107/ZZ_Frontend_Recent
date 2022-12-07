import { useEffect, useState, useContext } from 'react';
import styled from "styled-components";
import Button from "../../Button";
import BondingModal from '../../Modal/bondingAppModal';
import CountdownComponent from '../../CountDown/Countdown';
import { toast } from 'react-toastify';
import { useAccount, useConnect, useNetwork, useProvider, useSigner, useSwitchNetwork } from "wagmi";
import { Bonding_address } from '../../../Blockchain/addresses';

const CardContainer = styled.div`
  max-width: 350px;
  width: 100%;
  height: fit-content;
  margin: 5px 5px 0px;
  @media (max-width: 1024px){
    margin: 0px;
    margin-top: 32px;
  }
  @media (max-width: 480px){
    margin: 16px 0px;
  }
`
const isTest = process.env.ENVIRONMENT === "dev";
// const isTest = false
const BuypozCard = ({
  BuyPOZwithUSDC,
  bypozClick,
  setComplete,
  complete,
  modalState,
  setModalState,
  claimPOZ,
  silence,
  times,
  usdcLockTime,
  datas,
  claimingText,
  claimingStatus,
  lastAmount,
  pozPrice,
  totalPozAmount,
  approveStatus,
  bondingStatus,
  claimingModalStatus,
  claimablePozToken,
  claimTxHash,
  lastClaimHash,
  setClaimingModalStatus,
  treasureBalance,
  detectNFT
}) => {

  const [isLock, setIsLock] = useState(0);
  const { isConnected, address } = useAccount();

  useEffect(() => {
    if (times) {
      setIsLock(true);
    }
  }, [modalState]);

  return (
    // <div className='w-full flex justify-content-between'>
    <CardContainer className={`mw350 p-3 bgcolor251 rounded-4 btcolor875`}>
      {
        modalState ?
          <BondingModal
            BuyPOZwithUSDC={BuyPOZwithUSDC}
            setModalState={setModalState}
            setComplete={setComplete}
            modalState={modalState}
            lastAmount={lastAmount}
            pozPrice={pozPrice}
            totalPozAmount={totalPozAmount}
            complete={complete}
            claimPOZ={claimPOZ}
            silence={silence}
            isLock={isLock}
            time={times}
            usdcLockTime={usdcLockTime}
            approveStatus={approveStatus}
            bondingStatus={bondingStatus}
            claimingText={claimingText}
            claimingStatus={claimingStatus}
            claimingModalStatus={claimingModalStatus}
            claimablePozToken={claimablePozToken}
            claimTxHash={claimTxHash}
            lastClaimHash={lastClaimHash}
            setClaimingModalStatus={setClaimingModalStatus}
            treasureBalance={treasureBalance}
            detectNFT={detectNFT}
          /> : ''
      }
      <div className="f-OpenSans font-semibold text-base">
        <div className="flex justify-content-between">
          <div className="flex align-items-center">
            <div><img className="w-8" src={silence.imgurl} /></div>
            <div className="ml16 font-semibold">
              <div className='text-base'>{silence.name}</div>
              <div className="color25505 text-sm">{silence.subname}</div>
            </div>
          </div>
          {isLock ?
            <div className="flex align-items-center text-sm color25505">
              Locked
              <img className="ml-3" src="/img/bonding/Path4774.png" />
            </div> : <></>
          }
        </div>
        {/* line */}
        <div className="w-full h-0 bdcolor223 mt-3"></div>
        <div className="mt-3">
          <div className="flex justify-content-between font-bold text-sm mt-1 lh21">
            {usdcLockTime || complete ? <div>Bond price</div> : <div>POZ price</div>}
            <div className="text-xl f-Hanson flex" style={{ alignItems: 'center' }}>$ {1 / pozPrice}0</div>
          </div>
          <div className="flex justify-content-between font-bold text-sm mt-1 textgradcolor">
            <div className="flex align-items-center">
              <div>Discount (%)</div>
              {usdcLockTime || complete ? <img className='ml-1' src='/img/bonding/info.svg' /> : <></>}
            </div>
            <div>
              {
                detectNFT ?
                  <>1.50%</>
                  :
                  <>-</>
              }

            </div>
          </div>
          {usdcLockTime > 0 || complete ? <div className="flex justify-content-between font-bold text-sm mt-1 color875">
            <div>Currently locked</div>
            <div>{lastAmount * pozPrice} POZ</div>
          </div> : <></>}
          {usdcLockTime > 0 || complete ? <div className="flex justify-content-between font-bold text-sm mt-1 color25505">
            <div>Total purchase</div>
            <div>{(totalPozAmount / pozPrice).toFixed(2)} USDC</div>
          </div> : <></>}
          <div className="flex justify-content-between font-bold text-sm mt-1 color25505">
            <div>Duration</div>
            <div>5 MINS</div>
          </div>
          {complete ? <div className="flex justify-content-between font-bold text-sm mt-1 color25505">
            <div>Next POZ claim</div>
            <div>-</div>
          </div> : <></>}
          {usdcLockTime > 0 || complete ?
            <div className="flex justify-content-between font-bold text-sm mt-1 color25505">
              <div>Bonding end</div>
              <div className="flex ">
                {times && !complete ? <CountdownComponent
                  setComplete={setComplete}
                  inputTime={times}
                /> : <>0 </>}
              </div>
            </div>
            : <></>
          }
          <div className="flex justify-content-between font-bold text-sm mt-1 color25505">
            <div>Available for purchase</div>
            <div>{treasureBalance.toFixed(2)} POZ</div>
          </div>
          <div className="flex justify-content-between font-bold text-sm mt-1 color25505">
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
          {/* Buttons */}
          <Button
            onClick={() => {
              bypozClick()
            }}
            variant={'purple'}
            className='w-full my-2 h-16'
          >
            Buy POZ with USDC
          </Button>
          {(usdcLockTime > 0) &&
            <Button
              hasBorder={false}
              disabled={true}
              className='w-full op60 flex justify-content-center whitespace-nowrap'
            >
              Claimable in
              <CountdownComponent
                inputTime={usdcLockTime}
                setComplete={setComplete}
              />
            </Button>
          }
          {
            ((usdcLockTime <= 0 && claimablePozToken > 0) && address) &&
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
    </CardContainer>
    // </div>
  )
}

export default BuypozCard;
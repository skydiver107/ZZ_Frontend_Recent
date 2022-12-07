import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import Button from "../Button";
import { ethers } from "ethers";
import { useRouter } from 'next/router'

import CountdownComponent from "../CountDown/Countdown";
import getContractData from "../Bonding/GetContractData";
import { Web3ModalContext } from '../../Contexts/Web3ModalProvider';
import { useAccount, useConnect, useNetwork, useProvider, useSigner, useSwitchNetwork } from "wagmi";
import ChainID from "../../Blockchain/chainId";

import {
  USDT_TOKEN_address,
  POZ_TOKEN_address,
} from "../../Blockchain/addresses";

const isTest = process.env.ENVIRONMENT === "dev";
// const isTest = false

const ClaimingTxModal = (props) => {

  const {
    claimingModalStatus,
    setClaimingModalStatus,
    setModalState,
    usdtAmount,
    pozAmount,
    pozPrice,
    lastAmount,
    approveStatus,
    bondingStatus,
    claimingStatus,
    claimablePozToken,
    claimTxHash
  } = props;
  const router = useRouter();

  // Loading Spinner
  const loadingOpacity = [0.88, 0.5, 0.2, 0.2, 0.2, 0.88];
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((loadingStep + 1) % 6);
    }, 120);
    return () => clearInterval(interval);
  }, [loadingStep]);

  return (
    <>
      <div style={{
        overflow: 'auto',
        background: 'linear-gradient(11.52deg, #362566 41.52%, #22134D 97.29%)',
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
        <div className="modal-header w-full bgcolor251 modal-header">
          <div className="flex align-items-center f-OpenSans text-lg">
            <img className="w-6 mr-2" src='/img/bonding/usdc-logo32.svg' />
            USDC/POZ
          </div>
          {((!approveStatus && !bondingStatus) && !claimingStatus) &&
            <Link href='#'>
              <div onClick={() => { setClaimingModalStatus(false) }} className="color875 font-bold text-lg cursor-pointer">
                Done
              </div>
            </Link>
          }
        </div>
        <div className="modal-body">
          <div className="rightsection f-OpenSans" style={{ maxWidth: '100%' }}>
            {approveStatus ?
              <>
                <div className='flex justify-content-center mb12'>
                  <img src='/img/bonding/approve_usdc_step.svg' />
                </div>
                <div className="flex justify-content-center font-semibold text-base colorf8">
                  Approval & Purchase
                </div>
                <div className="flex justify-content-center font-light text-base color248 mt-2 font-400" style={{ textAlign: 'center' }}>
                  Check your wallet app to approve token spending...
                </div>
                <div className="justify-content-center flex mt-5 mb-5">
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
              </>
              :
              <>
              </>
            }
            {bondingStatus ?
              <>
                <div className='flex justify-content-center mb12'>
                  <img src='/img/bonding/purchase_poz_step.svg' />
                </div>
                <div className="flex justify-content-center font-semibold text-base colorf8">
                  Purchase POZ Transaction
                </div>
                <div className="flex justify-content-center font-light text-base color248 mt-2 font-400" style={{ textAlign: 'center' }}>
                  Check your wallet app to validate your POZ purchase and confirm the transaction.
                </div>
                <div className="justify-content-center flex mt-5 mb-5">
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
              </>
              :
              <>
              </>
            }
            {((!approveStatus && !bondingStatus) && claimingStatus) &&
              <>
                <div className="font-semibold text-base colorf8">
                  Claiming POZ
                </div>
                <div className="font-light text-base color248 mt-2 font-400">
                  Your transaction to claim your POZ is underway.
                </div>
                <div className="justify-content-center flex mt-5 mb-5">
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
              </>
            }
            {((!approveStatus && !bondingStatus) && !claimingStatus) &&
              <>
                <div className="font-semibold text-base colorf8">
                  Success!
                </div>
                <div className="font-light text-base color248 mt-2 font-400 normal-style">
                  You have successfully claimed your POZ tokens! You will soon be able to stake your POZ to participate in community rewards!
                </div>
                <div className=" font-bold flex justify-content-between align-items-center color25505 mt-1 mb-2">
                  <div> </div>
                  <a target="_blank" href={isTest ? `https://mumbai.polygonscan.com/tx/${claimTxHash}` : `https://polygonscan.com/tx/${claimTxHash}`} rel="noopener noreferrer">
                    <div className="flex align-items-center cursor-pointer color875 normal-style">
                      View Transaction<img className="ml6" src="/img/bonding/Vector2.png" />
                    </div>
                  </a>
                </div>
              </>
            }
            <div className="rect2 border-2">
              <div className="flex justify-content-between items-start">
                <div className="flex flex-col items-center">
                  <img src="/img/bonding/circle-usdc-logo.svg" />
                  <div className="text-box text-center f-Hanson leading-4 mt-3 text-base">
                    <div className="text-center">
                      {(approveStatus || bondingStatus) &&
                        usdtAmount
                      }
                      {(!approveStatus && !bondingStatus) &&
                        lastAmount
                      }
                    </div>
                    <div>USDC</div>
                  </div>
                </div>
                <div className="h-12 flex justify-content-center items-center">
                  <img src="/img/bonding/center-circle.svg" />
                </div>
                <div className="text-box flex flex-col items-center">
                  <img src="/img/bonding/circle-poz-logo.svg" />
                  <div className="text2 text-center f-Hanson leading-4 mt-3 text-base">
                    <div className="textgradcolor">
                      {(approveStatus || bondingStatus) &&
                        pozAmount.toFixed(2)
                      }
                      {(!approveStatus && !bondingStatus) &&
                        lastAmount * pozPrice
                      }
                    </div>
                    <div className="textgradcolor">POZ</div>
                  </div>
                </div>
              </div>
            </div>
            {approveStatus &&
              <div className="buypoz-btn">
                <Button
                  variant='purple'
                  disabled={true}
                  className='w-full op60 flex justify-content-center whitespace-nowrap'
                >
                  Approving USDC spending
                </Button>
              </div>
            }

            {bondingStatus &&
              <div className="buypoz-btn">
                <Button
                  variant='purple'
                  disabled={true}
                  className='w-full op60 flex justify-content-center whitespace-nowrap'
                >
                  Purchasing POZ now...
                </Button>
              </div>
            }
            {((!approveStatus && !bondingStatus) && claimingStatus) &&
              <div className="buypoz-btn">
                <Button
                  variant='purple'
                  disabled={true}
                  className='w-full op60 flex justify-content-center whitespace-nowrap'
                >
                  Claiming POZ...
                </Button>
              </div>
            }
            {((!approveStatus && !bondingStatus) && !claimingStatus) &&
              <>
                {/* <div className="buypoz-btn">
                  <Button
                    variant='purple'
                    className='w-full flex justify-content-center whitespace-nowrap'
                  >
                    Stake POZ
                  </Button>
                </div> */}
                <div className="buypoz-btn">
                  <Button
                    variant='white'
                    className='w-full flex justify-content-center whitespace-nowrap'
                    onClick={() => {
                      setClaimingModalStatus(false);
                      setModalState(0);
                      document.body.style.overflow = "auto";
                    }}
                  >
                    Go to Homepage
                  </Button>
                </div>
              </>
            }

          </div>
        </div>
      </div>
    </>
  )
}

export default ClaimingTxModal;
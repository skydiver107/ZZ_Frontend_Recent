import { useEffect, useState } from 'react';
import styled from "styled-components";
import Button from "../../Button";
// import CountdownComponent from "../../CountDown/Countdown";

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

const RewardCard = ({item}) => {

  return (
    <Container className='reward-container' pd={item.claim ? '2px' : '0px'} bg={item.claim ? true : false}>
      <Wrapper>
        <div className="logo-box w-100 flex align-items-center">
          <img className='' src={item.imgurl}/>
          <div className="ml16 font-bold text-base f-Hanson">{item.text}</div>
        </div>
        <div className="mt-2.5 text-sm color248 font-semibold OpenSans">{item.text1}</div>
        <div className="w-100 mt-2.5 mb-2 flex justify-start text-normal text-sm">
          <img className="w-4" src="/img/bonding/clock.svg"/>
          <div className="ml-2.5 color25505 font-semibold OpenSans">{item.text2}</div>
        </div>
        <div className={`w-full whitespace-nowrap`}>
          {/* {item.claim ? */}
            <Button disabled={item.claim ? `` : true} className='w-full flex justify-content-center' hasBorder={item.claim ? true : ''}>
              Claim POZ
            </Button>
             {/* : <></>
          } */}
          {/* {item.claim ? '' : propsTimer}             */}
        </div>
      </Wrapper>
    </Container>
  )
}

export default RewardCard;
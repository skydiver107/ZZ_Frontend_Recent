/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import styled from "styled-components";
import { Avatar } from "../../Components/Image/Img";
import Row from "../../Components/Layouts/Row";
import Column from "../../Components/Layouts/Column";
import Text from "../../Components/Text";
import { theme } from "../../styles/styles";
import { IconInput } from "../../Components/Inputs/Input";
import RadioButton from "../../Components/RadioButton/RadioButton";

const StyledMain = styled.div`
  padding-top: 48px;
  background-image: url("/img/bg-fast-poz.png");
  width: 100vw;
  height: 100%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  font-family: "Open Sans", sans-serif !important;
`;
const Header = styled.div`
  height: 48px;
  padding: 9.5px 20px;
  border-radius: 12px 12px 0 0;
  background-color: ${({ theme }) => theme.bg.indigo};
`;
const Body = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px 54px 20px;
  gap: 19px;
  background: linear-gradient(
    to bottom,
    ${({ theme }) => theme.bg.darkindigo},
    ${({ theme }) => theme.bg.indigo}
  );
`;
const TokenContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  gap: 10px;
  overflow-x: scroll;
`;
const MaxBtn = styled.button`
  background: transparent;
  border: 1px solid transparent;
  &:active {
    border: 1px solid ${({ theme }) => theme.border.indigo};
    border-radius: 12px;
  }
`;
const NumberBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;
const NumberBtn = styled.button`
  display: flex;
  border: 0;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: 1px solid transparent;
  &:active {
    border: 1px solid ${({ theme }) => theme.border.indigo};
    border-radius: 12px;
  }
`;
const FundBtn = styled.button`
  border: 0;
  border-radius: 20px;
  padding: 16px 112px;
  background-color: ${({ theme }) => theme.bg.lightindigo};
  &:active {
    background-color: ${({ theme }) => theme.bg.indigo};
  }
`;

const tokens = [
  {
    src: "/img/poz.svg",
    name: "POZ",
  },
  {
    src: "/img/tucan.svg",
    name: "TUCAN",
  },
  {
    src: "/img/solar.svg",
    name: "SOLAR",
  },
];
const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0];

const FastPoz = () => {
  const [selectedToken, setToken] = useState("POZ");
  const [inputNum, setInputNum] = useState(1);
  const [inputVal, setInputValue] = useState("");
  const selectToken = (name) => {
    setToken(name);
  };
  const onKeyClick = (key) => {
    setInputValue((inputVal) => inputVal + key);
    console.log(inputVal);
  };
  const onBackOne = () => {
    setInputValue(inputVal.slice(0, -1));
  };
  return (
    <StyledMain>
      <Header>
        <Text color={theme.text.re} size="18px">
          Done
        </Text>
      </Header>
      <Body>
        <Row justify="space-between" align="center" gap="64px">
          <Text color={theme.text.re} size="18px">
            Fund my POZ-Pouch with Crypto Wallet
          </Text>
          <Avatar size="40px" src="/img/avatar.svg" />
        </Row>
        <Column gap="5px">
          <Row justify="space-between">
            <Text size="12px" color={theme.text.darkgray}>
              to POZ-Pouch
            </Text>
            <Text size="12px" color={theme.text.darkgray}>
              Pouch Balance: 12.458
            </Text>
          </Row>
          <IconInput
            border={inputNum == 1}
            value={inputNum == 1 ? inputVal : ""}
            onClickHandler={() => {
              setInputNum(1);
              if (inputNum != 1) setInputValue("");
            }}
          >
            <Row gap="7px">
              <img src="/img/poz-input.svg" alt="img" />
              <Text size="18px" color={theme.text.lightgray}>
                POZ
              </Text>
            </Row>
          </IconInput>
        </Column>
        <Column gap="5px">
          <Row justify="space-between">
            <Text size="12px" color={theme.text.darkgray}>
              from Crypto Wallet
            </Text>
            <Text size="12px" color={theme.text.darkgray}>
              TUCAN Available: 12.458
            </Text>
          </Row>
          <IconInput
            border={inputNum == 2}
            value={inputNum == 2 ? inputVal : ""}
            onClickHandler={() => {
              setInputNum(2);
              if (inputNum != 2) setInputValue("");
            }}
          >
            <Row gap="7px">
              <img src="/img/tucan.svg" alt="img" />
              <Text size="18px" color={theme.text.lightgray}>
                TUCAN
              </Text>
            </Row>
          </IconInput>
          <TokenContainer>
            {tokens.map((token, index) => (
              <RadioButton
                src={token.src}
                name={token.name}
                active={selectedToken == token.name}
                onSetToken={selectToken}
                key={index}
              />
            ))}
          </TokenContainer>
        </Column>
        <MaxBtn>
          <Text color={theme.text.indigo} size="16px">
            Fund Max
          </Text>
        </MaxBtn>
        <NumberBoard>
          {keys.map((key, index) => (
            <NumberBtn key={index} onClick={() => onKeyClick(key)}>
              <Text size="36px" color="white">
                {key}
              </Text>
            </NumberBtn>
          ))}
          <NumberBtn onClick={() => onBackOne()}>
            <img src="/img/x.svg" alt="img" />
          </NumberBtn>
        </NumberBoard>
        <FundBtn>
          <Text color="white" size="18px">
            Add Fund
          </Text>
        </FundBtn>
      </Body>
    </StyledMain>
  );
};

export default FastPoz;

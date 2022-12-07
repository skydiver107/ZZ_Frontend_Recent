/* eslint-disable @next/next/no-img-element */
import styled from "styled-components";
import { theme } from "../../styles/styles";
import Row from "../Layouts/Row";
import Text from "../Text";

const RadioButtonStyle = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  padding: 15px 17px;
  border-radius: 12px;
  border: 0;
  background-color: ${({ theme }) => theme.bg.mdindigo};
`;
const Radio = styled.div`
  padding: 8px;
  border-radius: 100%;
  border: 6px solid
    ${({ active, theme }) => (active ? theme.border.indigo : "#584a7d")};
  background-color: ${({ active }) => (active ? "white" : "#584a7d")};
`;
const RadioButton = ({ src, name, active, onSetToken }) => {
  const handleChange = () => {
    onSetToken(name);
  };
  return (
    <RadioButtonStyle onClick={handleChange}>
      <Row gap="13px">
        <img src={src} alt="img" />
        <Text color={theme.text.white} size="16px">
          {name}
        </Text>
      </Row>
      <Radio active={active} />
    </RadioButtonStyle>
  );
};

export default RadioButton;

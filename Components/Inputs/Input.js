import styled from "styled-components";

const Input = styled.input`
  width: 100%;
  padding: 10px 16px;
  border-radius: 12px;
  outline: none;
  color: ${({ theme, border }) =>
    border ? theme.text.white : theme.text.darkgray};
  font-size: ${({ size }) => size};
  text-align: ${({ align }) => align};
  border: 2px solid
    ${({ theme, border }) =>
      border ? theme.bg.lightindigo : theme.bg.mdindigo};
  background-color: ${({ theme }) => theme.bg.mdindigo};
  caret-color: ${({ theme }) => theme.text.lightgray};
`;
const StyledIconInput = styled.div`
  position: relative;
`;
const RightIcon = styled.div`
  position: absolute;
  top: 50%;
  right: 22px;
  transform: translate(0, -50%);
`;
export const IconInput = ({ children, border, value, onClickHandler }) => {
  return (
    <StyledIconInput>
      <Input value={value} border={border} onClick={onClickHandler} />
      <RightIcon>{children}</RightIcon>
    </StyledIconInput>
  );
};

export default Input;

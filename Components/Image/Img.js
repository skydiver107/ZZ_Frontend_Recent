import styled from "styled-components";

const ImgStyle = styled.img`
  width: ${({ width }) => width};
  height: auto;
`;
export const Avatar = styled.img`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 12px;
  border: 3px solid transparent;
  background: linear-gradient(#05121b, #05121b) padding-box,
    linear-gradient(45deg, #fff, #caa7d1) border-box;
`;

export default ImgStyle;

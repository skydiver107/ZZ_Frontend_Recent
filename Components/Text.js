import styled from "styled-components";

const Text = styled.p`
  color: ${({ color }) => color};
  font-size: ${({ size }) => size};
  font-weight: ${({ weight }) => weight};
  font-family: ${({ family }) => family};
  text-align: ${({ align }) => align};
  text-transform: ${({ transform }) => transform};
`;

export default Text;

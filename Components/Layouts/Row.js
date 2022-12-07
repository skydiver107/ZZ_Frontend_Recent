import styled from "styled-components";

const Row = styled.div`
  display: flex;
  flex-wrap: ${({ wrap }) => wrap};
  justify-content: ${({ justify }) => justify};
  align-items: ${({ align }) => align};
  gap: ${({ gap }) => gap};
`;

export default Row;

import styled from "styled-components";

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: ${({ justify }) => justify};
  align-items: ${({ align }) => align};
  gap: ${({ gap }) => gap};
`;

export default Column;

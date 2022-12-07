import styled from "styled-components";

const StyledModal = styled.div`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  position: fixed;
  // top: 50vh;
  // left: 50vw;
  justify-content: center;
  align-items: center;
  width: 100vw; /* Full width */
  height: 100vh; /* Full height */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
  // transform: translate(-50%, -50%);
  // backdrop-filter: blur(4px);
  z-index: 1;
`;
const StyledContent = styled.div`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  background-color: #fefefe;
  padding: 16px 23px;
  border: 1px solid #888;
  border-radius: 20px;
  width: 324px;
`;
const Modal = ({ isOpen, onClose, children, className }) => {
  return (
    <StyledModal
      isOpen={isOpen | false}
      onClick={onClose}
      className={`modal ${className}`}
    >
      <StyledContent
        isOpen={isOpen}
        onClick={(e) => e.stopPropagation()}
        className="modal-content"
      >
        {children}
      </StyledContent>
    </StyledModal>
  );
};

export default Modal;

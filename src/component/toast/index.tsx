import { useMemo } from 'react';
import styled from 'styled-components';

const StyledToast = styled.div`
  border-radius: 16px;
  /* border: 1px solid #303030;
  background: #1b1b1b; */
  padding: 18px;
  display: flex;
  gap: 10px;
  width: 288px;
  align-items: center; 
  margin-left: -40px;
  @media (max-width: 768px) {
    width: calc(100vw - 32px);
  }
`;
const StyledContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
`;
const StyledDesc = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const StyledTitle = styled.div`
  /* color: #fff; */
  font-family: Gantari;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  align-items: center;
`;
const StyledSecondaryText = styled.div`
  color: #8e8e8e;
  font-family: Gantari;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;
const StyledCloseWrapper = styled.div`
  cursor: pointer;
  line-height: 22px;
  flex-shrink: 0;
`;
const IconWrapper = styled.div`
  flex-shrink: 0;
  padding-top: 0;
`;

export default function Toast({ type, title, text, tx, chainId, closeToast }: any) {

  return (
    <StyledToast className='toast-content'>
      <IconWrapper>
        {type === 'success' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="8" fill="#33FFDA"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5611 5.43072C11.8756 5.74103 11.879 6.24755 11.5687 6.56206L7.0578 11.1341L4.43482 8.52303C4.12169 8.21133 4.12054 7.7048 4.43225 7.39167C4.74395 7.07854 5.25048 7.07738 5.56361 7.38909L7.04759 8.86631L10.4297 5.43833C10.74 5.12381 11.2466 5.12041 11.5611 5.43072Z" fill="#00022C"/>
          </svg>
        )}
        {type === 'error' && (
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M7.10016 1.17139C7.86996 -0.161947 9.79446 -0.161946 10.5643 1.17139L17.3935 13C18.1633 14.3333 17.201 16 15.6614 16H2.00298C0.463382 16 -0.498867 14.3333 0.270933 13L7.10016 1.17139ZM7.91793 6.39996C7.91793 5.89501 8.32727 5.48567 8.83221 5.48567C9.33716 5.48567 9.7465 5.89501 9.7465 6.39996V10.0571C9.7465 10.562 9.33716 10.9714 8.83221 10.9714C8.32727 10.9714 7.91793 10.562 7.91793 10.0571V6.39996ZM8.83221 11.8857C8.32727 11.8857 7.91793 12.295 7.91793 12.8C7.91793 13.3049 8.32727 13.7142 8.83221 13.7142C9.33716 13.7142 9.7465 13.3049 9.7465 12.8C9.7465 12.295 9.33716 11.8857 8.83221 11.8857Z" fill="#FF2C0F"/>
          </svg>
        )}
      </IconWrapper>
      {/* {type === 'pending' && <Loading />} */}
      <StyledContent>
        <StyledDesc>
          <StyledTitle>{title}</StyledTitle>
          {text && (<StyledSecondaryText>{text}</StyledSecondaryText>)}
        </StyledDesc>
        <StyledCloseWrapper onClick={closeToast}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M7.73284 6.00004L11.7359 1.99701C12.0368 1.696 12.0882 1.2593 11.8507 1.0219L10.9779 0.14909C10.7404 -0.0884124 10.3043 -0.0363122 10.0028 0.264491L6.00013 4.26743L1.99719 0.264591C1.69619 -0.036712 1.25948 -0.0884125 1.02198 0.14939L0.149174 1.0223C-0.0882277 1.2594 -0.0368271 1.6961 0.264576 1.99711L4.26761 6.00004L0.264576 10.0033C-0.0363271 10.3041 -0.0884277 10.7405 0.149174 10.978L1.02198 11.8509C1.25948 12.0884 1.69619 12.0369 1.99719 11.736L6.00033 7.73276L10.0029 11.7354C10.3044 12.037 10.7405 12.0884 10.978 11.8509L11.8508 10.978C12.0882 10.7405 12.0368 10.3041 11.736 10.0029L7.73284 6.00004Z"
              fill="white"
            />
          </svg>
        </StyledCloseWrapper>
      </StyledContent>
    </StyledToast>
  );
}

import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const LoaderCircle = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid blue;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const Loader = () => {
  return (
    <LoaderWrapper>
      <LoaderCircle />
    </LoaderWrapper>
  );
};

export default Loader;

import React, { createContext, useContext, useState } from 'react';

const ClaimContext = createContext();

export const ClaimProvider = ({ children }) => {
  const [currentClaimNumber, setCurrentClaimNumber] = useState('');

  const setClaimNumber = (claimNumber) => {
    setCurrentClaimNumber(claimNumber);
  };

  return (
    <ClaimContext.Provider value={{ currentClaimNumber, setClaimNumber }}>
      {children}
    </ClaimContext.Provider>
  );
};

export const useClaimContext = () => {
  return useContext(ClaimContext);
};

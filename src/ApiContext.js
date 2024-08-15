// ApiContext.js
import React, { createContext, useContext, useState } from 'react';

// Create the context
const ApiContext = createContext();

// Provider component
export const ApiProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    featureBatchSize: 20,
    maxTokens: 8000,
    apiProvider: 'groq',
  });

  const updateSettings = (newSettings) => {
    setSettings((prevSettings) => ({ ...prevSettings, ...newSettings }));
    console.log('Settings updated:', newSettings);
  };

  return (
    <ApiContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ApiContext.Provider>
  );
};

// Hook to use the context
export const useApi = () => useContext(ApiContext);

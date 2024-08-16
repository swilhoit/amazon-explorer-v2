// ApiContext.js
import React, { createContext, useContext, useState } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    featureBatchSize: 20,
    maxTokens: 8000,
    apiProvider: 'groq',  // Default to 'groq'
  });

  const updateSettings = (newSettings) => {
    setSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      if (prevSettings.apiProvider !== newSettings.apiProvider) {
        console.log('API provider changed');
        console.log(`Old API Provider: ${prevSettings.apiProvider}`);
        console.log(`New API Provider: ${newSettings.apiProvider}`);
        console.log('Updated Settings:', updatedSettings);
      }
      return updatedSettings;
    });
  };

  return (
    <ApiContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);

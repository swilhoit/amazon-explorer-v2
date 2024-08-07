import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  settings: {},
  updateSettings: () => {},
  subscriptionPlan: 'Free', // Default subscription
  updateSubscriptionPlan: () => {}
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState({
    featureBatchSize: 20,
    maxTokens: 8000,
    apiProvider: 'groq'
  });
  const [subscriptionPlan, setSubscriptionPlan] = useState('Free');

  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      setIsAuthenticated(true);
    }

    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedPlan = localStorage.getItem('subscriptionPlan');
    if (savedPlan) {
      setSubscriptionPlan(savedPlan);
    }
  }, []);

  const login = (token, plan) => {
    localStorage.setItem('sessionToken', token);
    localStorage.setItem('subscriptionPlan', plan);
    setIsAuthenticated(true);
    setSubscriptionPlan(plan);
  };

  const logout = () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('subscriptionPlan');
    setIsAuthenticated(false);
    setSubscriptionPlan('Free');
  };

  const updateSettings = (newSettings) => {
    setSettings(prevSettings => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, settings, updateSettings, subscriptionPlan, updateSubscriptionPlan: setSubscriptionPlan }}>
      {children}
    </AuthContext.Provider>
  );
};

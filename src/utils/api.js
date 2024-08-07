// api.js
import * as groqApi from './groq';
import * as gptApi from './gpt';
import * as rainforestApi from './rainforest';

let currentSettings = {
  featureBatchSize: 20,
  maxTokens: 8000,
  apiProvider: 'groq',
};

const apiProviders = {
  groq: groqApi,
  openai: gptApi,
};

console.log('API Provider before calling:', currentSettings.apiProvider);

export const updateSettings = (newSettings) => {
  currentSettings = { ...currentSettings, ...newSettings };
  console.log('Settings updated:', currentSettings);
};

const getApiProvider = () => {
  console.log('Current API provider:', currentSettings.apiProvider);
  return apiProviders[currentSettings.apiProvider];
};

export const fetchSegmentedFeatures = async (products) => {
  const api = getApiProvider();
  console.log('Action: fetchSegmentedFeatures');
  return await api.fetchSegmentedFeatures(products, currentSettings.featureBatchSize, currentSettings.maxTokens);
};

export const generateKeywords = async (keyword) => {
  const api = getApiProvider();
  console.log('Query:', keyword);
  return await api.generateKeywords(keyword, currentSettings.maxTokens);
};

export const generateMoreKeywords = async (originalKeyword, newKeyword) => {
  const api = getApiProvider();
  console.log(`Action: generateMoreKeywords: ${originalKeyword}, ${newKeyword}`);
  return await api.generateMoreKeywords(originalKeyword, newKeyword, currentSettings.maxTokens);
};

export const fetchFeatureSummaryWithBackoff = async (featureBullets, attributes, images) => {
  const api = getApiProvider();
  console.log('Action: fetchFeatureSummaryWithBackoff');
  return await api.fetchFeatureSummaryWithBackoff(featureBullets, attributes, images, currentSettings.maxTokens);
};

export const fetchCombinedFeatureSummaryWithBackoff = async (allFeatures) => {
  const api = getApiProvider();
  console.log('Action: fetchCombinedFeatureSummaryWithBackoff');
  return await api.fetchCombinedFeatureSummaryWithBackoff(allFeatures, currentSettings.maxTokens);
};

export const fetchProductDetails = async (asins) => {
  console.log(`Action: fetchProductDetails: ${asins.join(', ')}`);
  return await rainforestApi.fetchProductDetails(asins);
};

export const { fetchWithExponentialBackoff } = rainforestApi;
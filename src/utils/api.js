// api.js
// api.js
import { 
  fetchSegmentedFeatures as groqFetchSegmentedFeatures, 
  generateKeywords as groqGenerateKeywords, 
  generateMoreKeywords as groqGenerateMoreKeywords
} from './groq';

import { 
  fetchSegmentedFeatures as openAIFetchSegmentedFeatures, 
  generateKeywords as openAIGenerateKeywords, 
  generateMoreKeywords as openAIGenerateMoreKeywords,
  fetchFeatureSummaryWithBackoff as openAIFetchFeatureSummaryWithBackoff,
  fetchCombinedFeatureSummaryWithBackoff as openAIFetchCombinedFeatureSummaryWithBackoff
} from './gpt';

const serverUrl = 'http://localhost:3000'; // Use your server URL

// Helper function to make server requests
const fetchFromServer = async (endpoint, body) => {
  console.log(`Sending request to ${endpoint} with body:`, body);
  try {
    const response = await fetch(`${serverUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`Received response from ${endpoint}:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

// Helper function to create message payloads
const createMessagePayload = (systemContent, userContent) => ([
  { role: "system", content: systemContent },
  { role: "user", content: userContent },
]);

// Consolidated fetch function for OpenAI chat completion
const fetchChatCompletion = async (systemContent, userContent, maxTokens) => {
  const messages = createMessagePayload(systemContent, userContent);
  return await fetchFromServer('/api/openai/chat', { messages, maxTokens });
};

// Fetch segmented features using the appropriate API provider
export const fetchSegmentedFeatures = async (products, featureBatchSize, maxTokens, apiProvider) => {
  console.log(`Fetching segmented features using ${apiProvider}`);
  switch(apiProvider) {
    case 'groq':
      return await groqFetchSegmentedFeatures(products, featureBatchSize, maxTokens);
    case 'openai':
      return await openAIFetchSegmentedFeatures(products, featureBatchSize, maxTokens);
    default:
      throw new Error(`Unsupported API provider: ${apiProvider}`);
  }
};

// Generate keywords using the appropriate API provider
export const generateKeywords = async (keywords, maxTokens, apiProvider) => {
  console.log(`Generating keywords using ${apiProvider}`);
  switch(apiProvider) {
    case 'groq':
      return await groqGenerateKeywords(keywords[0], maxTokens);
    case 'openai':
      return await openAIGenerateKeywords(keywords, maxTokens);
    default:
      throw new Error(`Unsupported API provider: ${apiProvider}`);
  }
};

// Generate more keywords using the appropriate API provider
export const generateMoreKeywords = async (originalKeyword, newKeyword, maxTokens, apiProvider) => {
  console.log(`Generating more keywords using ${apiProvider}`);
  switch(apiProvider) {
    case 'groq':
      return await groqGenerateMoreKeywords(originalKeyword, newKeyword, maxTokens);
    case 'openai':
      return await openAIGenerateMoreKeywords(originalKeyword, newKeyword, maxTokens);
    default:
      throw new Error(`Unsupported API provider: ${apiProvider}`);
  }
};

// Feature summary function
export const fetchFeatureSummaryWithBackoff = async (featureBullets, attributes, images, apiProvider) => {
  console.log(`Fetching feature summary using ${apiProvider}`);
  const featureText = featureBullets.join('\n');
  const attributeText = attributes.map(attr => `${attr.name}: ${attr.value}`).join('\n');
  const imageText = images.map(img => (typeof img === 'string' ? img : img.url || img.link)).join('\n');
  const userContent = `What are the 3 most important defining features of this product that make it unique? Focus on what makes this product different and unique from the others such as materials and features. Do not write full sentences, abbreviate to list the traits in list format. Don't list any traits that are the same for multiple items, only include features that are completely unique to each item. Do not use dashes, only bullet points. The purpose of this section is to compare the items against each other to determine which features make them unique.:\n\nImages:\n${imageText}\n\nFeatures:\n${featureText}\n\nAttributes:\n${attributeText}\n\nSummary:`;
  
  switch(apiProvider) {
    case 'groq':
      // Implement Groq version if available, or use OpenAI as fallback
      return await openAIFetchFeatureSummaryWithBackoff(featureBullets, attributes, images, 8000);
    case 'openai':
      return await openAIFetchFeatureSummaryWithBackoff(featureBullets, attributes, images, 8000);
    default:
      throw new Error(`Unsupported API provider: ${apiProvider}`);
  }
};

export const fetchCombinedFeatureSummaryWithBackoff = async (allFeatures, apiProvider) => {
  console.log(`Fetching combined feature summary using ${apiProvider}`);
  
  switch(apiProvider) {
    case 'groq':
      // Implement Groq version if available, or use OpenAI as fallback
      return await openAIFetchCombinedFeatureSummaryWithBackoff(allFeatures, 8000);
    case 'openai':
      return await openAIFetchCombinedFeatureSummaryWithBackoff(allFeatures, 8000);
    default:
      throw new Error(`Unsupported API provider: ${apiProvider}`);
  }
};

// Simulate API call to fetch product details
export const fetchProductDetails = async (asins, apiProvider) => {
  console.log(`Fetching details for ASINs: ${asins.join(', ')} using ${apiProvider}`);
  
  // Simulating an API call with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return dummy data for demonstration
  return asins.map(asin => ({
    asin,
    price: Math.random() * 100 + 10,
    revenue: Math.random() * 1000 + 100,
    // Add other relevant fields here
  }));
};

// Fetch with exponential backoff
export const fetchWithExponentialBackoff = async (fetchFunction, args = [], retries = 5, delay = 1000) => {
  try {
    return await fetchFunction(...args);
  } catch (error) {
    if (error.response && (error.response.status === 429 || error.response.status >= 500) && retries > 0) {
      const jitter = Math.random() * 1000; // Add random jitter to spread out requests
      console.log('Rate limit or server error. Retrying in', delay + jitter, 'ms');
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      return fetchWithExponentialBackoff(fetchFunction, args, retries - 1, delay * 2);
    } else {
      throw error;
    }
  }
};

export default {
  fetchSegmentedFeatures,
  generateKeywords,
  generateMoreKeywords,
  fetchFeatureSummaryWithBackoff,
  fetchCombinedFeatureSummaryWithBackoff,
  fetchProductDetails,
  fetchWithExponentialBackoff,
};
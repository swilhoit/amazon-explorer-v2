// gpt.js

import { fetchFromServer } from './api';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

const createChatCompletion = async (messages, maxTokens, temperature = 0.3, topP = 0.8, retries = 5) => {
  console.log('OpenAI API called with messages:', messages);
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages,
          max_tokens: maxTokens,
          temperature,
          top_p: topP,
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.warn(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('OpenAI API response:', data);
      return data.choices[0].message.content;
    } catch (error) {
      if (attempt === retries - 1) {
        console.error('Error calling OpenAI API:', error);
        throw error;
      }
    }
  }
};

export const fetchSegmentedFeatures = async (products, featureBatchSize, maxTokens) => {
  const allResults = [];

  for (let i = 0; i < products.length; i += featureBatchSize) {
      const batch = products.slice(i, i + featureBatchSize);
      const prompt = `Group similar products into segments based on their defining features found in the title. ... \n${batch.map((p) => `${p.title} (ASIN: ${p.asin})`).join('\n')}`;

      const response = await fetchFromServer('/api/openai/chat', {
          messages: [
              { role: "system", content: "You are an assistant for analyzing product titles..." },
              { role: "user", content: prompt },
          ],
          maxTokens,
      });

      allResults.push(response);
  }

  const finalPrompt = `Convert the following segmented product list to JSON format... \n\n${allResults.join('\n\n')}`;
  const jsonResult = await fetchFromServer('/api/openai/chat', {
      messages: [
          { role: "system", content: "You are an assistant for converting product segments to JSON format." },
          { role: "user", content: finalPrompt },
      ],
      maxTokens,
  });

  return JSON.parse(jsonResult);
};

export const generateKeywords = async (keyword, maxTokens) => {
  console.log('OpenAI API called for generateKeywords');
  const content = await createChatCompletion([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: `Generate at least 25 types of products related to the keyword "${keyword}":` },
  ], maxTokens);

  return content;
};

export const generateMoreKeywords = async (originalKeyword, newKeyword, maxTokens) => {
  console.log('OpenAI API called for generateMoreKeywords');
  const content = await createChatCompletion([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: `Generate at least 25 types of products related to the keywords "${originalKeyword}" and "${newKeyword}":` },
  ], maxTokens);

  return content;
};

export const fetchFeatureSummaryWithBackoff = async (featureBullets, attributes, images, maxTokens) => {
  console.log('OpenAI API called for fetchFeatureSummaryWithBackoff');
  const featureText = featureBullets.join('\n');
  const attributeText = attributes.map(attr => `${attr.name}: ${attr.value}`).join('\n');
  const imageText = images.map(img => (typeof img === 'string' ? img : img.url || img.link)).join('\n');

  const content = await createChatCompletion([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: `What are the 3 most important defining features of this product that make it unique? Focus on what makes this product different and unique from the others such as materials and features. Do not write full sentences, abbreviate to list the traits in list format. Don't list any traits that are the same for multiple items, only include features that are completely unique to each item. Do not use dashes, only bullet points. The purpose of this section is to compare the items against each other to determine which features make them unique.:\n\nImages:\n${imageText}\n\nFeatures:\n${featureText}\n\nAttributes:\n${attributeText}\n\nSummary:` }
  ], maxTokens);

  return content.trim().split('\n').filter(point => point.length > 0);
};

export const fetchCombinedFeatureSummaryWithBackoff = async (allFeatures, maxTokens) => {
  console.log('OpenAI API called for fetchCombinedFeatureSummaryWithBackoff');
  const content = await createChatCompletion([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: `What are the differences between each of these products? Find common attribute types that can be compared. Focus on what makes each product different and unique from the others. The purpose of this section is to compare the items against each other to determine which features make them unique. Limit this to 100 words:\n\n${allFeatures.join('\n\n')}\n\nSummary:` }
  ], maxTokens);

  return content.trim().split('\n').filter(point => point.length > 0);
};
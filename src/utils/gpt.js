// gpt.js

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
          model: "gpt-4",
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
  console.log('OpenAI API called for fetchSegmentedFeatures');
  const fetchBatch = async (batch) => {
    const prompt = `Group similar products into segments based on their defining features that make them unique found in the title. Ensure all products in this list are assigned a segment. There should be a maximum of 10 segments total with a minimum of 2 products in each segment. Combine any segments that are very similar to avoid redundancy.\n${batch.map((p) => `${p.title} (ASIN: ${p.asin})`).join('\n')}\n\nProvide the result as a list of segments, where each segment includes a name and the list of products (titles and ASINs) that belong to it.`;

    return await createChatCompletion([
      {
        role: "system",
        content: "You are an assistant for analyzing product titles in order to group a list of products into segments based on their defining features.",
      },
      { role: "user", content: prompt },
    ], maxTokens);
  };

  const batchProducts = [];
  for (let i = 0; i < products.length; i += featureBatchSize) {
    batchProducts.push(products.slice(i, i + featureBatchSize));
  }

  const allResults = [];

  const processBatches = async (batches) => {
    const batchPromises = [];
    while (batches.length > 0) {
      if (batchPromises.length < 10) { // Adjust the number of concurrent requests
        const batch = batches.shift();
        const batchPromise = fetchBatch(batch)
          .then((result) => {
            allResults.push(result);
            batchPromises.splice(batchPromises.indexOf(batchPromise), 1);
          })
          .catch((error) => {
            console.error("Error processing batch:", error);
          });
        batchPromises.push(batchPromise);
      } else {
        await Promise.race(batchPromises);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Reduce requests per minute
    }
    await Promise.all(batchPromises);
  };

  await processBatches(batchProducts);

  // Convert results to JSON format
  const jsonPrompt = `Convert the following segmented product list to JSON format, including segment names and lists of products with their titles and ASINs:\n\n${allResults.join('\n\n')}`;

  const jsonResult = await createChatCompletion([
    {
      role: "system",
      content: "You are an assistant for converting product segments to JSON format.",
    },
    { role: "user", content: jsonPrompt },
  ], maxTokens);

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

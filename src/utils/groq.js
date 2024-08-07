import Groq from "groq-sdk";

// Initialize the Groq client with the API key
const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Function to fetch segmented features
export const fetchSegmentedFeatures = async (products, featureBatchSize, maxTokens) => {
  const fetchBatch = async (batch, retries = 5) => {
    const prompt = `Group similar products into segments based on their defining features that make them unique found in the title. Ensure all products in this list are assigned a segment. There should be a maximum of 10 segments total with a minimum of 2 products in each segment. Combine any segments that are very similar to avoid redundancy.\n${batch.map((p) => `${p.title} (ASIN: ${p.asin})`).join('\n')}\n\nProvide the result as a list of segments, where each segment includes a name and the list of products (titles and ASINs) that belong to it.`;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are an assistant for analyzing product titles in order to group a list of products into segments based on their defining features. Group similar products into segments based on their defining features. Ensure all products in this list are assigned a segment. There should be a maximum of 10 segments total with a minimum of 2 products in each segment. Your responses should only include the requested results with no extra words.",
            },
            { role: "user", content: prompt },
          ],
          model: "llama-3.1-70b-versatile",
          temperature: 0.3,
          max_tokens: maxTokens,
          top_p: 0.8,
          stream: false,
        });

        if (!response.choices[0]?.message?.content) {
          throw new Error("Invalid response from GROQ. Missing content.");
        }

        console.log("Batch result:", response.choices[0].message.content);
        return response.choices[0].message.content;
      } catch (error) {
        if (i < retries - 1) {
          const delay = Math.pow(2, i) * 1000;
          console.warn(`Retrying in ${delay / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error(`Error fetching batch: ${error.message}`);
          throw error;
        }
      }
    }
  };

  const batchProducts = [];
  for (let i = 0; i < products.length; i += featureBatchSize) {
    batchProducts.push(products.slice(i, i + featureBatchSize));
  }

  const allResults = [];

  const processBatches = async (batches) => {
    const batchPromises = [];
    while (batches.length > 0) {
      if (batchPromises.length < 20) {
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
      await new Promise((resolve) => setTimeout(resolve, 60000 / 100)); // 100 requests per minute
    }
    await Promise.all(batchPromises);
  };

  await processBatches(batchProducts);

  // Convert results to JSON format
  const jsonPrompt = `Convert the following segmented product list to JSON format, including segment names and lists of products with their titles and ASINs:\n\n${allResults.join('\n\n')}`;

  const jsonResponse = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an assistant for converting product segments to JSON format.",
      },
      { role: "user", content: jsonPrompt },
    ],
    model: "llama-3.1-70b-versatile",
    temperature: 0.3,
    max_tokens: maxTokens,
    top_p: 0.8,
    response_format: { type: "json_object" },
    stream: false,
  });

  const jsonResult = JSON.parse(jsonResponse.choices[0].message.content);
  console.log(`JSON Result: ${JSON.stringify(jsonResult, null, 2)}`);
  return jsonResult;
};

// Function to generate keywords
export const generateKeywords = async (keyword, maxTokens) => {
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: `Generate at least 25 types of products related to the keyword "${keyword}":` },
    ],
    model: "llama-3.1-70b-versatile",
    temperature: 0.3,
    max_tokens: maxTokens,
    top_p: 0.8,
    stream: false,
  });

  return response.choices[0].message.content;
};

// Function to generate more keywords
export const generateMoreKeywords = async (originalKeyword, newKeyword, maxTokens) => {
  const response = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: `Generate at least 25 types of products related to the keywords "${originalKeyword}" and "${newKeyword}":` },
    ],
    model: "llama-3.1-70b-versatile",
    temperature: 0.3,
    max_tokens: maxTokens,
    top_p: 0.8,
    stream: false,
  });

  return response.choices[0].message.content;
};
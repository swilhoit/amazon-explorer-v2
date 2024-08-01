import axios from 'axios';
import Groq from "groq-sdk";

// Base URLs for different APIs
const JUNGLE_SCOUT_API_BASE_URL = 'https://developer.junglescout.com/api/keywords/keywords_by_keyword_query';
const RAINFOREST_API_BASE_URL = 'https://api.rainforestapi.com/request';
const GPT_API_BASE_URL = 'https://api.openai.com/v1/chat/completions';

// API keys from environment variables
const jungleScoutApiKey = process.env.REACT_APP_JUNGLE_SCOUT_API_KEY;
const jungleScoutKeyName = process.env.REACT_APP_JUNGLE_SCOUT_KEY_NAME;
const rainforestApiKey = process.env.REACT_APP_RAINFOREST_API_KEY;
const gptApiKey = process.env.REACT_APP_OPENAI_API_KEY;

const groq = new Groq({ 
    apiKey: process.env.REACT_APP_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

// Headers for different APIs
const jungleScoutHeaders = {
    'Authorization': `${jungleScoutKeyName}:${jungleScoutApiKey}`,
    'X-API-Type': 'junglescout',
    'Accept': 'application/vnd.junglescout.v1+json',
    'Content-Type': 'application/vnd.api+json',
};

const gptHeaders = {
    'Authorization': `Bearer ${gptApiKey}`,
    'Content-Type': 'application/json',
};

console.log('GPT Headers:', gptHeaders);

// Function to handle exponential backoff for API requests
const fetchWithExponentialBackoff = async (fetchFunction, args = [], retries = 5, delay = 1000) => {
    try {
        return await fetchFunction(...args);
    } catch (error) {
        if (error.response && (error.response.status === 429 || error.response.status >= 500) && retries > 0) {
            const jitter = Math.random() * 1000; // Add random jitter to spread out requests
            console.error('Rate limit or server error. Retrying in', delay + jitter, 'ms');
            await new Promise(resolve => setTimeout(resolve, delay + jitter));
            return fetchWithExponentialBackoff(fetchFunction, args, retries - 1, delay * 2);
        } else {
            throw error;
        }
    }
};

// Function to generate keywords using OpenAI API
export const generateKeywords = async (keyword) => {
    const payload = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Generate at least 25 types of products related to the keyword "${keyword}":` }
        ],
        max_tokens: 200,
    };

    return await axios.post(GPT_API_BASE_URL, payload, { headers: gptHeaders });
};

// Function to generate more keywords using OpenAI API
export const generateMoreKeywords = async (originalKeyword, newKeyword) => {
    const payload = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Generate at least 25 types of products related to the keywords "${originalKeyword}" and "${newKeyword}":` }
        ],
        max_tokens: 200,
    };

    return await axios.post(GPT_API_BASE_URL, payload, { headers: gptHeaders });
};

// Fetch top keywords using Jungle Scout API
export const fetchTopKeywords = async (keywords) => {
    const url = `${JUNGLE_SCOUT_API_BASE_URL}?marketplace=us&sort=-monthly_search_volume_exact&page[size]=50`;
    const payload = {
        data: {
            type: "keywords_by_keyword_query",
            attributes: {
                search_terms: [keywords], // Ensure this is an array
                categories: [
                    // List of categories
                ],
                min_monthly_search_volume_exact: 1,
                max_monthly_search_volume_exact: 99999,
                min_monthly_search_volume_broad: 1,
                max_monthly_search_volume_broad: 99999,
                min_word_count: 1,
                max_word_count: 99999,
                min_organic_product_count: 1,
                max_organic_product_count: 99999
            }
        }
    };

    try {
        console.log(`Fetching top keywords for: ${keywords}`);
        const response = await axios.post(url, payload, { headers: jungleScoutHeaders });
        console.log("Response data:", response.data);

        // Process the response data to match the DataTable structure
        const processedData = response.data.data.map(item => ({
            id: item.id,
            type: item.type,
            attributes: item.attributes
        }));

        return processedData;
    } catch (error) {
        console.error("Error fetching top keywords:", error);
        if (error.response) {
            console.error("Error response data:", error.response.data);
        }
        throw error;
    }
};


// Fetch data for keywords using Jungle Scout API
export const fetchDataForKeywords = async (keywords) => {
    const messages = [
        { role: "system", content: "You are an assistant for fetching data for keywords." },
        { role: "user", content: `Fetch data for the following keywords: ${keywords.join(', ')}` }
    ];

    try {
        console.log(`Fetching data for keywords: ${keywords.join(', ')}`);
        const response = await groq.chat.completions.create({
            messages: messages,
            model: "llama3-8b-8192",
            temperature: 0.3,
            max_tokens: 1024,
            top_p: 0.8,
            stop: null,
            stream: false
        });

        const data = JSON.parse(response.choices[0]?.message?.content);
        console.log(`Data for keywords: ${JSON.stringify(data, null, 2)}`);
        return data;
    } catch (error) {
        console.error('Error in fetchDataForKeywords:', error);
        throw error;
    }
};

// Fetch product details from Rainforest API
export const fetchProductDetailsFromRainforest = async (asin) => {
    try {
        const response = await axios.get(RAINFOREST_API_BASE_URL, {
            params: {
                api_key: rainforestApiKey,
                type: "product",
                asin: asin,
                amazon_domain: "amazon.com",
                include: "attributes,feature_bullets"
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching product details for ASIN: ${asin}`, error);
        throw new Error(`Failed to fetch product details for ASIN: ${asin}`);
    }
};

// Fetch segmented features using Groq
export const fetchSegmentedFeatures = async (titles, batchSize = 10, concurrency = 1) => {
    const schema = {
        type: "object",
        properties: {
            products: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        features: { type: "array", items: { type: "string" } },
                        attributes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    value: { type: "string" }
                                },
                                required: ["name", "value"]
                            }
                        },
                        images: { type: "array", items: { type: "string" } },
                        sales: { type: "number" },
                        revenue: { type: "number" }
                    },
                    required: ["features", "attributes", "images", "sales", "revenue"]
                }
            }
        },
        required: ["products"]
    };

    const prettyPrintedSchema = JSON.stringify(schema, null, 4);

    const fetchBatch = async (batch, retries = 5) => {
        console.log(`Fetching batch: ${batch.join(', ')}`);
        const prompt = `Segment these products by their defining features for the following titles:\n${batch.join('\n')}\nProvide the result as a JSON object that follows this schema exactly:\n${prettyPrintedSchema}`;

        for (let i = 0; i < retries; i++) {
            try {
                const response = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: `You are an assistant for segmenting a list of products by their defining features. The JSON object must use the following schema:\n${prettyPrintedSchema}` },
                        { role: "user", content: `Segment these products by their defining features and provide the result in JSON format that follows the provided schema:\n${prompt}` }
                    ],
                    model: "llama-3.1-70b-versatile",
                    temperature: 0.3,
                    max_tokens: 8000,
                    top_p: 0.8,
                    response_format: { type: "json_object" },
                    stream: false
                });

                console.log(`Response from GROQ: ${JSON.stringify(response, null, 2)}`);

                if (!response.choices[0]?.message?.content) {
                    throw new Error("Invalid response from GROQ. Missing content.");
                }

                const result = JSON.parse(response.choices[0].message.content);

                if (!result.products || !Array.isArray(result.products) || result.products.length === 0) {
                    throw new Error("Invalid response or missing products from fetchSegmentedFeatures");
                }

                return result;
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    const retryAfter = error.response.headers['retry-after'] || 1;
                    console.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                } else if (i < retries - 1) {
                    const delay = Math.pow(2, i) * 1000;
                    console.warn(`Retrying in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error(`Error fetching batch: ${error.message}`);
                    throw error;
                }
            }
        }
    };

    const generateSegmentName = async (sharedAttribute, sharedValue) => {
        const prompt = `Generate a unique and descriptive JSON name for a product segment where all products share the attribute '${sharedAttribute}: ${sharedValue}'`;

        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant that generates unique and descriptive JSON names for product segments." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-70b-versatile",
            temperature: 0.7,
            max_tokens: 150,
            top_p: 0.8,
            response_format: { type: "json_object" },
            stream: false
        });

        console.log(`Segment name response from GROQ: ${JSON.stringify(response, null, 2)}`);
        return response.choices[0]?.message?.content.trim() || "Unnamed Segment";
    };

    const batchTitles = [];
    for (let i = 0; i < titles.length; i += batchSize) {
        batchTitles.push(titles.slice(i, i + batchSize));
    }

    const allResults = [];

    const processBatches = async (batches) => {
        const batchPromises = [];
        while (batches.length > 0) {
            if (batchPromises.length < concurrency) {
                const batch = batches.shift();
                const batchPromise = fetchBatch(batch).then(async result => {
                    console.log(`Result from batch: ${JSON.stringify(result, null, 2)}`);
                    if (result && result.products && Array.isArray(result.products)) {
                        const groupedSegments = {};
                        for (const segment of result.products) {
                            if (segment && segment.features && segment.attributes) {
                                for (const attr of segment.attributes) {
                                    if (attr && attr.name && attr.value) {
                                        const key = `${attr.name}:${attr.value}`;
                                        if (!groupedSegments[key]) {
                                            groupedSegments[key] = [];
                                        }
                                        groupedSegments[key].push(segment);
                                    }
                                }
                            }
                        }

                        console.log("Grouped segments before filtering:", groupedSegments);

                        for (const [key, segments] of Object.entries(groupedSegments)) {
                            if (segments.length >= 3) {
                                const [sharedAttribute, sharedValue] = key.split(':');
                                const segmentName = await generateSegmentName(sharedAttribute, sharedValue);
                                console.log(`Generated segment name: ${segmentName}`);
                                if (!groupedSegments[segmentName]) {
                                    groupedSegments[segmentName] = {
                                        segment_name: segmentName,
                                        products: []
                                    };
                                }
                                groupedSegments[segmentName].products.push(...segments);
                            }
                        }

                        console.log("Merged significant segments:", groupedSegments);

                        const processedSegments = Object.values(groupedSegments).map(segment => ({
                            segment_name: segment.segment_name,
                            products: (segment.products || []).map(product => ({
                                features: product.features || [],
                                attributes: product.attributes || [],
                                images: product.images || [],
                                sales: product.sales || 0,
                                revenue: product.revenue || 0
                            }))
                        }));

                        allResults.push(...processedSegments);
                    } else {
                        console.warn("Invalid or empty result from fetchBatch");
                    }

                    batchPromises.splice(batchPromises.indexOf(batchPromise), 1);
                }).catch(error => {
                    console.error("Error processing batch:", error);
                });
                batchPromises.push(batchPromise);
            } else {
                await Promise.race(batchPromises);
            }
            await new Promise(resolve => setTimeout(resolve, 60000 / 100)); // 100 requests per minute
        }
        await Promise.all(batchPromises);
    };

    await processBatches(batchTitles);

    console.log(`All results combined: ${JSON.stringify(allResults, null, 2)}`);
    return { products: allResults };
};

// Fetch feature summary with exponential backoff using Groq
export const fetchFeatureSummaryWithBackoff = async (featureBullets, attributes, images, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const featureText = featureBullets.join('\n');
            const attributeText = attributes.map(attr => `${attr.name}: ${attr.value}`).join('\n');
            const imageText = images.map(img => (typeof img === 'string' ? img : img.url || img.link)).join('\n');

            const messages = [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: `What are the 3 most important defining features of this product that make it unique? Focus on what makes this product different and unique from the others such as materials and features. Do not write full sentences, abbreviate to list the traits in list format. Don't list any traits that are the same for multiple items, only include features that are completely unique to each item. Do not use dashes, only bullet points. The purpose of this section is to compare the items against each other to determine which features make them unique.:\n\nImages:\n${imageText}\n\nFeatures:\n${featureText}\n\nAttributes:\n${attributeText}\n\nSummary:` }
            ];

            console.log(`Attempt ${i + 1}: Sending request to GROQ for feature summary...`);
            const response = await groq.chat.completions.create({
                messages: messages,
                model: "llama3-8b-8192",
                temperature: 0.3,
                max_tokens: 1024,
                top_p: 0.8,
                stop: null,
                stream: false
            });

            const summary = response.choices[0]?.message?.content.trim().split('\n').filter(point => point.length > 0);
            console.log(`Response from GROQ: ${JSON.stringify(summary, null, 2)}`);
            return Array.isArray(summary) ? summary : [];
        } catch (error) {
            if (i === retries - 1) throw error;
            const jitter = Math.random() * 1000;
            console.error(`Retry ${i + 1}/${retries} failed: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i) + jitter));
        }
    }
};

// Fetch combined feature summary with exponential backoff using Groq
export const fetchCombinedFeatureSummaryWithBackoff = async (allFeatures, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const messages = [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: `What are the differences between each of these products? Find common attribute types that can be compared. Focus on what makes each product different and unique from the others. The purpose of this section is to compare the items against each other to determine which features make them unique. Limit this to 100 words:\n\n${allFeatures.join('\n\n')}\n\nSummary:` }
            ];

            console.log(`Attempt ${i + 1}: Sending request to GROQ for combined feature summary...`);
            const response = await groq.chat.completions.create({
                messages: messages,
                model: "llama3-8b-8192",
                temperature: 0.3,
                max_tokens: 1024,
                top_p: 0.8,
                stop: null,
                stream: false
            });

            const summary = response.choices[0]?.message?.content.trim().split('\n').filter(point => point.length > 0);
            console.log(`Response from GROQ: ${JSON.stringify(summary, null, 2)}`);
            return Array.isArray(summary) ? summary : [];
        } catch (error) {
            if (i === retries - 1) throw error;
            const jitter = Math.random() * 1000;
            console.error(`Retry ${i + 1}/${retries} failed: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i) + jitter));
        }
    }
};

export {
    fetchWithExponentialBackoff
};

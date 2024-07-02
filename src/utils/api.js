import axios from 'axios';

// Base URLs for different APIs
const JUNGLE_SCOUT_API_BASE_URL = 'https://developer.junglescout.com/api/keywords/keywords_by_keyword_query';
const RAINFOREST_API_BASE_URL = 'https://api.rainforestapi.com/request';
const GPT_API_BASE_URL = 'https://api.openai.com/v1/chat/completions';

// API keys from environment variables
const jungleScoutApiKey = process.env.REACT_APP_JUNGLE_SCOUT_API_KEY;
const jungleScoutKeyName = process.env.REACT_APP_JUNGLE_SCOUT_KEY_NAME;
const rainforestApiKey = process.env.REACT_APP_RAINFOREST_API_KEY;
const gptApiKey = process.env.REACT_APP_OPENAI_API_KEY;

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

    const headers = {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
    };

    console.log('Headers:', headers);

    return await axios.post(GPT_API_BASE_URL, payload, { headers });
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

    const headers = {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
    };

    console.log('Headers:', headers);

    return await axios.post(GPT_API_BASE_URL, payload, { headers });
};

// Other existing functions

export const fetchTopKeywords = async (keywords) => {
    const url = `${JUNGLE_SCOUT_API_BASE_URL}?marketplace=us&sort=-monthly_search_volume_exact&page[size]=50`;
    const payload = {
        data: {
            type: "keywords_by_keyword_query",
            attributes: {
                search_terms: keywords,
                categories: [
                    "Appliances",
                    "Arts, Crafts & Sewing",
                    "Automotive",
                    "Baby",
                    "Beauty & Personal Care",
                    "Camera & Photo",
                    "Cell Phones & Accessories",
                    "Clothing, Shoes & Jewelry",
                    "Computers & Accessories",
                    "Electronics",
                    "Grocery & Gourmet Food",
                    "Health & Household",
                    "Home & Kitchen",
                    "Industrial & Scientific",
                    "Kitchen & Dining",
                    "Musical Instruments",
                    "Office Products",
                    "Patio, Lawn & Garden",
                    "Pet Supplies",
                    "Software",
                    "Sports & Outdoors",
                    "Tools & Home Improvement",
                    "Toys & Games",
                    "Video Games"
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

export const fetchDataForKeywords = async (keywords) => {
    try {
        const response = await axios.get(`${JUNGLE_SCOUT_API_BASE_URL}/products`, {
            headers: jungleScoutHeaders,
            params: { keywords }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching data for keywords:', error);
        throw error;
    }
};

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

export const fetchFeatureSummary = async (featureBullets, attributes) => {
    const featureText = featureBullets.join('\n');
    const attributeText = attributes.map(attr => `${attr.name}: ${attr.value}`).join('\n');

    const messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": `Summarize the following features and attributes in 3-5 concise bullet points:\n\nFeatures:\n${featureText}\n\nAttributes:\n${attributeText}\n\nSummary:`}
    ];

    const payload = {
        model: "gpt-4",
        messages: messages,
    };

    try {
        const response = await axios.post(GPT_API_BASE_URL, payload, { headers: gptHeaders });
        const summary = response.data.choices[0].message.content.trim().split('\n').filter(point => point.length > 0);
        return Array.isArray(summary) ? summary : [];
    } catch (error) {
        console.error('Error fetching feature summary:', error);
        throw new Error('Failed to fetch feature summary');
    }
};

export const fetchCombinedFeatureSummary = async (productFeatures) => {
    const messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": `Compare and summarize the following features and attributes from multiple products. Highlight key differences in 3-5 concise bullet points:\n\n${productFeatures.join('\n\n')}\n\nSummary:`}
    ];

    const payload = {
        model: "gpt-4",
        messages: messages,
    };

    try {
        const response = await axios.post(GPT_API_BASE_URL, payload, { headers: gptHeaders });
        const summary = response.data.choices[0].message.content.trim().split('\n').filter(point => point.length > 0);
        return Array.isArray(summary) ? summary : [];
    } catch (error) {
        console.error('Error fetching combined feature summary:', error);
        throw new Error('Failed to fetch combined feature summary');
    }
};

// Exporting functions with exponential backoff
export const fetchFeatureSummaryWithBackoff = async (featureBullets, attributes, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log('GPT Headers in fetchFeatureSummaryWithBackoff:', gptHeaders);
            const featureText = featureBullets.join('\n');
            const attributeText = attributes.map(attr => `${attr.name}: ${attr.value}`).join('\n');
            const response = await axios.post(GPT_API_BASE_URL, {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: `Summarize the following features and attributes in 3-5 concise bullet points. Focus on what makes this product different and unique from the others:\n\nFeatures:\n${featureText}\n\nAttributes:\n${attributeText}\n\nSummary:` }
                ]
            }, {
                headers: gptHeaders
            });
            const summary = response.data.choices[0].message.content.trim().split('\n').filter(point => point.length > 0);
            return Array.isArray(summary) ? summary : [];
        } catch (error) {
            if (i === retries - 1) throw error;
            const jitter = Math.random() * 1000; // Add random jitter to spread out requests
            console.error(`Retry ${i + 1}/${retries} failed: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i) + jitter));
        }
    }
};

export const fetchCombinedFeatureSummaryWithBackoff = async (allFeatures, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log('GPT Headers in fetchCombinedFeatureSummaryWithBackoff:', gptHeaders);
            const response = await axios.post(GPT_API_BASE_URL, {
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: `Summarize the following features from multiple compared products in 3-5 concise bullet points. Focus on what makes each product different and unique from the others:\n\n${allFeatures.join('\n\n')}\n\nSummary:` }
                ]
            }, {
                headers: gptHeaders
            });
            const summary = response.data.choices[0].message.content.trim().split('\n').filter(point => point.length > 0);
            return Array.isArray(summary) ? summary : [];
        } catch (error) {
            if (i === retries - 1) throw error;
            const jitter = Math.random() * 1000; // Add random jitter to spread out requests
            console.error(`Retry ${i + 1}/${retries} failed: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i) + jitter));
        }
    }
};

export { fetchWithExponentialBackoff };

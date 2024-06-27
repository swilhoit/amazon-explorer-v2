import axios from 'axios';

const JUNGLE_SCOUT_API_BASE_URL = 'https://developer.junglescout.com/api/keywords/keywords_by_keyword_query';
const RAINFOREST_API_BASE_URL = 'https://api.rainforestapi.com/request';

const jungleScoutApiKey = process.env.REACT_APP_JUNGLE_SCOUT_API_KEY;
const jungleScoutKeyName = process.env.REACT_APP_JUNGLE_SCOUT_KEY_NAME;
const rainforestApiKey = process.env.REACT_APP_RAINFOREST_API_KEY;

const jungleScoutHeaders = {
    'Authorization': `${jungleScoutKeyName}:${jungleScoutApiKey}`,
    'X-API-Type': 'junglescout',
    'Accept': 'application/vnd.junglescout.v1+json',
    'Content-Type': 'application/vnd.api+json',
};

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
            console.error("Error response data:", error.response.data); // Log the error response data
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

import axios from 'axios';

// Constants for API
const JUNGLE_SCOUT_API_BASE_URL = 'https://developer.junglescout.com/api/product_database_query';
const jungleScoutApiKey = process.env.REACT_APP_JUNGLE_SCOUT_API_KEY;
const jungleScoutKeyName = process.env.REACT_APP_JUNGLE_SCOUT_KEY_NAME;
const jungleScoutHeaders = {
    'Authorization': `${jungleScoutKeyName}:${jungleScoutApiKey}`,
    'Accept': 'application/vnd.junglescout.v1+json',
    'Content-Type': 'application/vnd.api+json',
};

// Function to fetch data based on keywords
export const fetchDataForKeywords = async (keywords) => {
    const url = `${JUNGLE_SCOUT_API_BASE_URL}?marketplace=us`;
    let allResults = [];

    for (const keyword of keywords) {
        const payload = {
            data: {
                type: "product_database_query",
                attributes: {
                    include_keywords: [keyword],
                    exclude_unavailable_products: true
                }
            }
        };

        try {
            const response = await axios.post(url, payload, { headers: jungleScoutHeaders });
            if (response.data && Array.isArray(response.data.data)) {
                const results = response.data.data.map(item => processJungleScoutItem(item)).filter(item => item !== null);
                allResults = [...allResults, ...results];
            }
        } catch (error) {
            console.error("API request failed:", error);
        }
    }

    return allResults;
};

// Function to process each JungleScout item
const processJungleScoutItem = (item) => {
    if (!item) {
        console.error("Received null item in processJungleScoutItem");
        return null; // Return null here intentionally if item is undefined or null
    }

    return {
        asin: item.asin || '',
        title: item.title || '',
        brand: item.brand || '',
        price: parseFloat(item.price || 0),
        reviews: parseInt(item.reviews || 0),
        rating: parseFloat(item.rating || 0),
        sales: parseInt(item.sales || 0),
        revenue: parseFloat(item.revenue || 0),
        sellerType: item.sellerType || '',
        dateFirstAvailable: item.dateFirstAvailable || '',
        category: item.category || '',
        imageUrl: item.imageUrl || '',
        amazonUrl: item.amazonUrl || ''
    };
};

// Example usage
fetchDataForKeywords(['example keyword']).then(processedData => {
    console.log('Processed Data:', processedData);
}).catch(e => console.error('Error processing data:', e));

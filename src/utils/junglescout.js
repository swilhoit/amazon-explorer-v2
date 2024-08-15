import axios from 'axios';

// API key and header configurations
const apiKey = process.env.REACT_APP_JUNGLE_SCOUT_API_KEY;
const keyName = process.env.REACT_APP_JUNGLE_SCOUT_KEY_NAME;

const headers = {
    'Authorization': `${keyName}:${apiKey}`,
    'X-API-Type': 'junglescout',
    'Accept': 'application/vnd.junglescout.v1+json',
    'Content-Type': 'application/vnd.api+json'
};

// Function to fetch product database query results
export const fetchProductDatabaseQuery = async (searchParams) => {
  const baseUrl = 'https://developer.junglescout.com/api/product_database_query';
  const queryParams = new URLSearchParams({
    marketplace: searchParams.marketplace || 'us',
    sort: searchParams.sort || 'name',
    'page[size]': searchParams.pageSize || 50,
  });

  const url = `${baseUrl}?${queryParams.toString()}`;

  const payload = {
    data: {
      type: "product_database_query",
      attributes: {
        include_keywords: searchParams.includeKeywords || [],
        exclude_unavailable_products: searchParams.excludeUnavailableProducts || true,
        "min_sales": 1,
      }
    }
  };

  try {
    const response = await axios.post(url, payload, { headers });
    console.log('API Request Successful:', response);
    return response.data;
  } catch (error) {
    console.error("Error fetching product database query results:", error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
};


export const fetchDataForKeywords = async (keywords) => {
    const url = `https://developer.junglescout.com/api/keywords/keywords_by_keyword_query`;
    const queryParams = new URLSearchParams({
        marketplace: 'us',
        sort: '-monthly_search_volume_exact',
        'page[size]': '50'
    });
    let allResults = [];

    for (const keyword of keywords) {
        const payload = {
            data: {
                type: "keywords_by_keyword_query",
                attributes: {
                    search_terms: keyword
                }
            }
        };

        try {
            const response = await axios.post(`${url}?${queryParams.toString()}`, payload, { headers });
            if (response.data && Array.isArray(response.data.data)) {
                const results = response.data.data.map(item => ({
                    keyword: item.attributes.name,
                    search_volume: item.attributes.monthly_search_volume_exact,
                    relevancy_score: item.attributes.relevancy_score,
                    monthly_trend: item.attributes.monthly_trend,
                    quarterly_trend: item.attributes.quarterly_trend,
                    recommended_promotions: item.attributes.recommended_promotions,
                    ppc_bid_broad: item.attributes.ppc_bid_broad,
                    ppc_bid_exact: item.attributes.ppc_bid_exact,
                    organic_product_count: item.attributes.organic_product_count,
                    sponsored_product_count: item.attributes.sponsored_product_count
                })).filter(item => item !== null);
                allResults = [...allResults, ...results];
            }
        } catch (error) {
            console.error("API request failed:", error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
        }
    }

    return allResults;
};

export const fetchRelatedKeywords = async (keyword) => {
    const url = `https://developer.junglescout.com/api/keywords/keywords_by_keyword_query`;
    const queryParams = new URLSearchParams({
        marketplace: 'us',
        sort: '-monthly_search_volume_exact',
        'page[size]': '50'
    });
    const payload = {
        data: {
            type: "keywords_by_keyword_query",
            attributes: {
                search_terms: keyword
            }
        }
    };

    try {
        const response = await axios.post(`${url}?${queryParams.toString()}`, payload, { headers });
        return response.data.data.map(item => ({
            keyword: item.attributes.name,
            search_volume: item.attributes.monthly_search_volume_exact,
            relevancy_score: item.attributes.relevancy_score,
            monthly_trend: item.attributes.monthly_trend,
            quarterly_trend: item.attributes.quarterly_trend,
            recommended_promotions: item.attributes.recommended_promotions,
            ppc_bid_broad: item.attributes.ppc_bid_broad,
            ppc_bid_exact: item.attributes.ppc_bid_exact,
            organic_product_count: item.attributes.organic_product_count,
            sponsored_product_count: item.attributes.sponsored_product_count
        }));
    } catch (error) {
        console.error("Error fetching related keywords:", error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        throw error;
    }
};

export const fetchHistoricalData = async (keyword) => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setFullYear(endDate.getFullYear() - 1);

    const url = `https://developer.junglescout.com/api/keywords/historical_search_volume`;
    const queryParams = new URLSearchParams({
        marketplace: 'us',
        keyword: keyword,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
    });

    try {
        const response = await axios.get(`${url}?${queryParams.toString()}`, { headers });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching historical data:", error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        throw error;
    }
};

export const fetchKeywordData = async (keyword) => {
    try {
        const relatedKeywordsData = await fetchRelatedKeywords(keyword);
        const historicalData = await fetchHistoricalData(keyword);

        return {
            relatedKeywords: relatedKeywordsData,
            historicalData: historicalData
        };
    } catch (error) {
        console.error("Error fetching keyword data:", error);
        throw error;
    }
};
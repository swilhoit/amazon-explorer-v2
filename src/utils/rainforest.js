import axios from 'axios';

const RAINFOREST_API_KEY = process.env.REACT_APP_RAINFOREST_API_KEY;
const RAINFOREST_API_URL = 'https://api.rainforestapi.com/request';

export const fetchProductDetails = async (asins) => {
  console.log(`Fetching details for ASINs: ${asins.join(', ')}`);
  
  if (!RAINFOREST_API_KEY) {
    console.error('Rainforest API key is not set. Please check your environment variables.');
    throw new Error('Rainforest API key is not configured');
  }

  const results = [];

  for (const asin of asins) {
    try {
      const response = await axios.get(RAINFOREST_API_URL, {
        params: {
          api_key: RAINFOREST_API_KEY,
          type: 'product',
          amazon_domain: 'amazon.com',
          asin: asin
        }
      });

      if (response.data && response.data.product) {
        const product = response.data.product;
        results.push({
          asin: product.asin,
          title: product.title,
          price: parseFloat(product.buybox_price) || 0,
          rating: product.rating,
          reviews: product.ratings_total,
          images: product.images,
          feature_bullets: product.feature_bullets,
          attributes: product.specifications || []
        });
      } else {
        console.error(`No product data found for ASIN: ${asin}`);
        console.error('API Response:', JSON.stringify(response.data, null, 2));
      }
    } catch (error) {
      console.error(`Error fetching details for ASIN ${asin}:`, error.message);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error', error.message);
      }
      console.error('Error config:', error.config);
    }
  }

  return results;
};

export const fetchWithExponentialBackoff = async (fetchFunction, args = [], retries = 5, delay = 1000) => {
  try {
    return await fetchFunction(...args);
  } catch (error) {
    if (error.response && (error.response.status === 429 || error.response.status >= 500) && retries > 0) {
      const jitter = Math.random() * 1000;
      console.log(`Rate limit or server error. Retrying in ${delay + jitter} ms`);
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      return fetchWithExponentialBackoff(fetchFunction, args, retries - 1, delay * 2);
    } else {
      throw error;
    }
  }
};
// rainforest.js

// Simulate API call to fetch product details
export const fetchProductDetails = async (asins) => {
    console.log(`Fetching details for ASINs: ${asins.join(', ')}`);
    
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
  
  // Function to handle exponential backoff for API requests
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
/* eslint-env worker */

onmessage = (event) => {
    const { data, products } = event.data;
    console.log("Received data for processing:", JSON.stringify(data, null, 2));
    console.log("Received products for processing:", JSON.stringify(products, null, 2));
  
    if (!Array.isArray(products) || products.length === 0) {
      console.error("Invalid input products. Must be a non-empty array.");
      postMessage({ error: "Invalid input products. Must be a non-empty array." });
      return;
    }
  
    const processedSegments = processSegments(products);
    console.log("Processed segments to send back to main script:", processedSegments);
    postMessage(processedSegments);
  };
  
  function processSegments(products) {
    console.log('Processing segments - Input products:', JSON.stringify(products, null, 2));
  
    const segments = {};
    let totalRevenue = 0;
  
    products.forEach((segment) => {
      let segmentName = 'Unknown Segment';
      if (segment && typeof segment.segment_name === 'string') {
        try {
          const parsedName = JSON.parse(segment.segment_name);
          segmentName = parsedName.segment_name || 'Unknown Segment';
        } catch (e) {
          segmentName = segment.segment_name;
        }
      }
  
      segmentName = (typeof segmentName === 'string') ? 
        segmentName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
        'Unknown Segment';
  
      if (!segments[segmentName]) {
        segments[segmentName] = {
          segment_name: segmentName,
          products: [],
          totalRevenue: 0,
          averagePrice: 0,
        };
      }
  
      if (Array.isArray(segment.products)) {
        segments[segmentName].products.push(...segment.products);
        segments[segmentName].totalRevenue = segment.products.reduce((sum, product) => sum + (product.revenue || 0), 0);
        totalRevenue += segments[segmentName].totalRevenue;
      }
    });
  
    const processedSegments = Object.values(segments)
      .filter(segment => segment.products.length > 0)
      .map(segment => ({
        ...segment,
        averagePrice: segment.totalRevenue / segment.products.length,
        percentOfTotalRevenue: totalRevenue > 0 ? (segment.totalRevenue / totalRevenue) * 100 : 0,
      }));
  
    if (processedSegments.length === 0) {
      console.warn("No segments were processed. This could be due to insufficient data.");
      return { warning: "No segments were processed", details: { segments: segments } };
    }
  
    return processedSegments;
  }
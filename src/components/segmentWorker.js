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

  const result = processSegments(products);
  console.log("Processed segments to send back to main script:", result);
  postMessage(result);
};

function processSegments(products) {
  console.log('Processing segments - Input products:', JSON.stringify(products, null, 2));

  const segments = {};
  let unassignedProducts = [...products]; // Create a copy of all products

  products.forEach((product) => {
    let segmentName = 'Unknown Segment';
    if (product && typeof product.segment_name === 'string') {
      try {
        const parsedName = JSON.parse(product.segment_name);
        segmentName = parsedName.segment_name || 'Unknown Segment';
      } catch (e) {
        segmentName = product.segment_name;
      }
    }

    segmentName = (typeof segmentName === 'string') ?
      segmentName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
      'Unknown Segment';

    if (!segments[segmentName]) {
      segments[segmentName] = {
        name: segmentName,
        products: [],
      };
    }

    if (Array.isArray(product.products) && product.products.length > 0) {
      segments[segmentName].products.push(...product.products);
      
      // Remove assigned products from unassignedProducts array
      unassignedProducts = unassignedProducts.filter(p => !product.products.includes(p));
    } else {
      console.warn(`Product ${JSON.stringify(product)} could not be assigned to any segment and will be added to 'Miscellaneous'.`);
      if (!segments['Miscellaneous']) {
        segments['Miscellaneous'] = {
          name: 'Miscellaneous',
          products: [],
        };
      }
      segments['Miscellaneous'].products.push(product);
      // Remove this product from unassignedProducts array
      unassignedProducts = unassignedProducts.filter(p => p !== product);
    }
  });

  console.log(`Number of products not assigned to any segment: ${unassignedProducts.length}`);
  console.log('Unassigned products:', JSON.stringify(unassignedProducts, null, 2));

  // Ensure all products are assigned a segment
  if (unassignedProducts.length > 0) {
    console.log(`Number of products not initially assigned a segment: ${unassignedProducts.length}`);
  } else {
    console.log("All products were successfully assigned to segments.");
  }

  const processedSegments = Object.values(segments)
    .filter(segment => segment.products.length > 0);

  if (processedSegments.length === 0) {
    console.warn("No segments were processed. This could be due to insufficient data.");
    return { 
      warning: "No segments were processed", 
      details: { segments: segments },
      unassignedProducts 
    };
  }

  return { 
    processedSegments,
    unassignedProducts
  };
}
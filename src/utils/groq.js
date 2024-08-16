import Groq from "groq-sdk";

// Initialize the Groq client with the API key
const groq = new Groq({
  apiKey: process.env.REACT_APP_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Function to fetch segmented features
export const fetchSegmentedFeatures = async (products, featureBatchSize, maxTokens) => {
  console.log(`Starting fetchSegmentedFeatures with ${products.length} products, batch size: ${featureBatchSize}, max tokens: ${maxTokens}`);
  const totalProducts = products.length;
  const totalBatches = Math.ceil(totalProducts / featureBatchSize);
  console.log(`Total batches to process: ${totalBatches}`);

  const sendBatch = async (batch, batchIndex, retries = 5) => {
    console.log(`Processing batch ${batchIndex + 1} of ${totalBatches}`);
    const prompt = `This is batch ${batchIndex + 1} of ${totalBatches}. Store these products for later analysis:\n\n${batch.map((p, index) => 
      `${index + 1}. Title: ${p.title}\nASIN: ${p.asin}\nCategory: ${p.category || 'N/A'}\nPrice: ${p.price || 'N/A'}\nDescription: ${p.description || 'N/A'}\n`
    ).join('\n')}`;
    console.log(`Batch ${batchIndex + 1} prompt:`, prompt);

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Sending batch ${batchIndex + 1} to Groq (attempt ${i + 1})`);
        const response = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are an assistant for storing product information. Do not analyze or segment the products yet. Simply acknowledge receipt of each batch.",
            },
            { role: "user", content: prompt },
          ],
          model: "llama-3.1-70b-versatile",
          temperature: 0.1,
          max_tokens: 50,  // We only need a short acknowledgment
          top_p: 1,
          stream: false,
        });

        if (!response.choices[0]?.message?.content) {
          throw new Error("Invalid response from GROQ. Missing content.");
        }

        console.log(`Batch ${batchIndex + 1} stored successfully`);
        return "Batch received";
      } catch (error) {
        console.error(`Error in batch ${batchIndex + 1}, attempt ${i + 1}:`, error);
        if (i < retries - 1) {
          const delay = Math.pow(2, i) * 1000;
          console.warn(`Retrying batch ${batchIndex + 1} in ${delay / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error(`All retries failed for batch ${batchIndex + 1}`);
          throw error;
        }
      }
    }
  };

  const createFinalSegments = async () => {
    console.log("Creating final segments based on all products");
    const finalPrompt = `Analyze and segment the following ${totalProducts} products. Divide the list into segments based on the product unique features, charictaristics, and attributes provided in the product details. Focus on what makes each segment of products different to give insight on the market landscape. Ensure ALL products are assigned to a segment. There should be a maximum of 12 segments total with a minimum of 2 products in each segment. Combine any segments that are very similar to avoid redundancy and don't allow any duplicate segments. Your response should be a list of segment names, each followed by the index numbers of the products that belong to that segment. Use the following format:

**Segment 1: [Specific Segment Name Based on Actual Product Details]**
1, 2, 5, 10, 15

**Segment 2: [Another Specific Segment Name Based on Actual Product Details]**
3, 4, 6, 7, 8, 9

... and so on for all segments.

Important: Use the actual product details provided to create relevant and specific segment names. Do not generate generic category names if they don't match the actual products.

Here are the products:

${products.map((p, index) => 
  `${index + 1}. Title: ${p.title}\nASIN: ${p.asin}\nCategory: ${p.category || 'N/A'}\nPrice: ${p.price || 'N/A'}\nDescription: ${p.description || 'N/A'}\n`
).join('\n')}`;

    console.log("Final segmentation prompt:", finalPrompt);

    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an assistant for analyzing and segmenting a list of products based on their features. Ensure every product is assigned to a segment using its index number.",
          },
          { role: "user", content: finalPrompt },
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.3,
        max_tokens: maxTokens,
        top_p: 0.8,
        stream: false,
      });

      console.log("Final segmentation response:", response.choices[0].message.content);
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error in creating final segments:", error);
      throw error;
    }
  };

  const processSegmentationResult = (result, originalProducts) => {
    console.log("Processing segmentation result");
    console.log("Raw segmentation result:", result);
    
    if (!result || typeof result !== 'string') {
      console.error("Invalid segmentation result:", result);
      return { segments: [{ name: "All Products", products: originalProducts }] };
    }

    try {
      // Check if the result contains the expected segment format
      if (!result.includes('**Segment')) {
        console.warn("Unexpected segmentation result format. Returning all products in a single segment.");
        return { segments: [{ name: "All Products", products: originalProducts }] };
      }

      const segments = result.split('**Segment').filter(Boolean);
      console.log(`Found ${segments.length} potential segments`);
      
      const segmentedProducts = segments.map(segment => {
        const [nameAndIndices, ...rest] = segment.split('\n').filter(Boolean);
        const name = nameAndIndices.split(':')[1]?.trim() || "Unnamed Segment";
        console.log(`Processing segment: ${name}`);
        
        const indicesStr = rest.join(' ');
        if (!indicesStr) {
          console.warn(`No product indices found for segment: ${name}`);
          return { name, products: [] };
        }
        
        const indices = indicesStr.split(',')
          .flatMap(range => range.split(' '))
          .map(i => i.trim())
          .filter(i => !isNaN(parseInt(i)))
          .map(i => parseInt(i) - 1);
        
        console.log(`Segment ${name} has ${indices.length} product indices`);
        const products = indices
          .map(index => {
            const product = originalProducts[index];
            if (!product) {
              console.warn(`No product found for index ${index} in segment ${name}`);
            }
            return product;
          })
          .filter(Boolean);
        console.log(`Segment ${name} has ${products.length} valid products`);
        return { name, products };
      }).filter(segment => segment.products.length > 0);

      if (segmentedProducts.length === 0) {
        console.warn("No valid segments found, returning all products in a single segment");
        return { segments: [{ name: "All Products", products: originalProducts }] };
      }

      console.log(`Final segmentation result: ${segmentedProducts.length} segments`);
      segmentedProducts.forEach(segment => {
        console.log(`- ${segment.name}: ${segment.products.length} products`);
      });

      return { segments: segmentedProducts };
    } catch (error) {
      console.error("Error processing segmentation result:", error);
      return { segments: [{ name: "All Products", products: originalProducts }] };
    }
  };

  // Send all batches, then create final segments
  console.log("Starting to send batches...");
  for (let i = 0; i < totalBatches; i++) {
    const start = i * featureBatchSize;
    const end = Math.min((i + 1) * featureBatchSize, totalProducts);
    const batch = products.slice(start, end);
    
    await sendBatch(batch, i);
    await new Promise((resolve) => setTimeout(resolve, 60000 / 100)); // 100 requests per minute
  }
  
  console.log("All batches sent. Creating final segments...");
  const segmentationResult = await createFinalSegments();

  const finalResult = processSegmentationResult(segmentationResult, products);
  console.log("Final processed result:", JSON.stringify(finalResult, null, 2));
  return finalResult;
};

// Function to generate keywords
export const generateKeywords = async (keyword, maxTokens) => {
  console.log(`Generating keywords for: "${keyword}"`);
  try {
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

    console.log("Generated keywords:", response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating keywords:", error);
    throw error;
  }
};

// Function to generate more keywords
export const generateMoreKeywords = async (originalKeyword, newKeyword, maxTokens) => {
  console.log(`Generating more keywords for: "${originalKeyword}" and "${newKeyword}"`);
  try {
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

    console.log("Generated additional keywords:", response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating additional keywords:", error);
    throw error;
  }
};
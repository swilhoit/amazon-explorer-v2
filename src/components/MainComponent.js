// MainComponent.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography, Box, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Container, Checkbox, Slider, Collapse, IconButton, Link, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMore, ExpandLess, Delete } from '@mui/icons-material';
import DataTable from './DataTable';
import { ScatterPlot, PieCharts, TimelineChart } from './Charts';
import ProductComparison from './ProductComparison';
import { fetchProductDetails, fetchSegmentedFeatures } from '../utils/api';
import { fetchDataForKeywords } from '../utils/junglescout';
import { updateSummary, getPriceSegments, processData, formatNumberWithCommas } from '../utils/dataProcessing';
import FeatureSegments from './FeatureSegments';
import { useApi } from '../ApiContext';
import Settings from './settings';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.common.black,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const marks = [
  { value: 5, label: '$5' },
  { value: 10, label: '$10' },
  { value: 15, label: '$15' },
  { value: 20, label: '$20' },
  { value: 25, label: '$25' },
  { value: 30, label: '$30' },
  { value: 35, label: '$35' },
  { value: 40, label: '$40' },
  { value: 45, label: '$45' },
  { value: 50, label: '$50' },
];

const MAX_CACHE_ENTRIES = 50;
const MAX_CACHE_SIZE = 4 * 1024 * 1024; // 4MB
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const MainComponent = ({ uploadedData, activeTab, handleTabChange, keywords, triggerSearch}) => {
  const { settings, updateSettings } = useApi();
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const [priceSegmentIncrement, setPriceSegmentIncrement] = useState(5);
  const [expandedSegments, setExpandedSegments] = useState({});
  const [winningProducts, setWinningProducts] = useState([]);
  const [comparisonProducts, setComparisonProducts] = useState([]);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');
  const [currentSegment, setCurrentSegment] = useState(null);
  const [featureSegments, setFeatureSegments] = useState(null);

  const [cache, setCache] = useState(() => {
    try {
      const storedCache = JSON.parse(localStorage.getItem('keywordCache')) || {};
      const now = Date.now();
      // Filter out expired entries
      const validCache = Object.entries(storedCache).reduce((acc, [key, value]) => {
        if (now - value.timestamp < CACHE_EXPIRATION) {
          acc[key] = value;
        }
        return acc;
      }, {});
      return validCache;
    } catch (error) {
      console.error('Error parsing cache from localStorage:', error);
      return {};
    }
  });

  useEffect(() => {
    const saveToCache = () => {
      try {
        const serializedCache = JSON.stringify(cache);
        if (serializedCache.length <= MAX_CACHE_SIZE) {
          localStorage.setItem('keywordCache', serializedCache);
        } else {
          console.warn('Cache size exceeds limit, not saving to localStorage');
        }
      } catch (error) {
        console.error('Error saving cache to localStorage:', error);
      }
    };

    saveToCache();
  }, [cache]);

  const handleFeatureSegmentation = useCallback(async (dataToSegment) => {
    const { featureBatchSize, maxTokens, apiProvider } = settings;
    let apiResponse;
    try {
      setLoading(true);
      console.log("Data being sent for segmentation:", dataToSegment);
      
      apiResponse = await fetchSegmentedFeatures(dataToSegment, featureBatchSize, maxTokens, apiProvider);
      console.log("Full API response:", JSON.stringify(apiResponse, null, 2));

      if (!apiResponse || typeof apiResponse !== 'object') {
        throw new Error("Invalid API response structure");
      }

      let rawContent;
      if (apiResponse.choices && apiResponse.choices[0] && apiResponse.choices[0].message) {
        rawContent = apiResponse.choices[0].message.content;
      } else if (apiResponse.segments) {
        rawContent = JSON.stringify(apiResponse.segments);
      } else {
        throw new Error("Unable to extract content from API response");
      }

      console.log("Raw content from API:", rawContent);

      const parsedSegments = parseTextSegments(rawContent);
      console.log("Parsed segments:", parsedSegments);

      const enhancedSegments = processSegments(parsedSegments, dataToSegment);
      console.log("Enhanced segments:", enhancedSegments);

      // Calculate total sales and revenue across all segments
      const totalSalesAll = enhancedSegments.reduce((sum, segment) => sum + segment.totalSales, 0);
      const totalRevenueAll = enhancedSegments.reduce((sum, segment) => sum + segment.totalRevenue, 0);

      // Add percentage calculations
      const finalSegments = enhancedSegments.map(segment => ({
        ...segment,
        percentOfTotalSales: (segment.totalSales / totalSalesAll) * 100,
        percentOfTotalRevenue: (segment.totalRevenue / totalRevenueAll) * 100
      }));

      setFeatureSegments({ segments: finalSegments });
    } catch (error) {
      console.error("Error processing segmented features:", error);
      console.error("Error stack:", error.stack);
      console.error("API Response:", apiResponse);
      setErrorMessage(`Error processing segmented features: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  function parseTextSegments(content) {
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        console.error("Error parsing JSON string:", e);
        return [];
      }
    }

    if (Array.isArray(content)) {
      return content.map(segment => ({
        name: segment.name,
        products: segment.products || []
      }));
    }

    console.error("Invalid content structure:", content);
    return [];
  }

  function processSegments(parsedSegments, dataToSegment) {
    if (!Array.isArray(parsedSegments) || parsedSegments.length === 0) {
      console.error("Invalid parsedSegments data:", parsedSegments);
      return [];
    }

    console.log("Starting to process segments. Data to segment:", dataToSegment);

    const totalSalesAll = dataToSegment.reduce((sum, item) => sum + (Number(item.sales) || 0), 0);
    const totalRevenueAll = dataToSegment.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);

    return parsedSegments.map(segment => {
      if (!segment || typeof segment !== 'object' || !Array.isArray(segment.products)) {
        console.warn("Invalid segment data:", segment);
        return null;
      }

      console.log("Processing segment:", segment.name);

      const enhancedProducts = segment.products.map(product => {
        const asinData = dataToSegment.find(item => item.asin === product.asin) || {};
        console.log("ASIN data for", product.asin, ":", asinData);
        return {
          ...product,
          revenue: Math.round(Number(asinData.revenue) || 0),
          sales: Number(asinData.sales) || 0,
          price: Number(asinData.price) || 0,
          reviews: Number(asinData.reviews) || 0,
          rating: Number(asinData.rating) || 0,
          imageUrl: asinData.imageUrl || '',
        };
      });

      const totalRevenue = enhancedProducts.reduce((sum, product) => sum + product.revenue, 0);
      const totalSales = enhancedProducts.reduce((sum, product) => sum + product.sales, 0);
      const averagePrice = enhancedProducts.length > 0 ? 
        enhancedProducts.reduce((sum, product) => sum + product.price, 0) / enhancedProducts.length : 0;
      const totalReviews = enhancedProducts.reduce((sum, product) => sum + product.reviews, 0);

      return {
        ...segment,
        products: enhancedProducts,
        totalRevenue,
        totalSales,
        averagePrice,
        totalReviews,
        averageReviews: enhancedProducts.length > 0 ? totalReviews / enhancedProducts.length : 0,
        percentOfTotalSales: totalSalesAll > 0 ? (totalSales / totalSalesAll) * 100 : 0,
        percentOfTotalRevenue: totalRevenueAll > 0 ? (totalRevenue / totalRevenueAll) * 100 : 0
      };
    }).filter(Boolean);
  }

  useEffect(() => {
    if (uploadedData && uploadedData.length > 0) {
      console.log("useEffect - Uploaded data received:", uploadedData);
      const summary = updateSummary(uploadedData);
      setSummaryData(summary);
      setData([summary, ...uploadedData]);
      setAllData(uploadedData);
      setResultsCount(uploadedData.length);
      
      // Trigger feature segmentation
      handleFeatureSegmentation(uploadedData);
    }
  }, [uploadedData, handleFeatureSegmentation]);

  const trimCache = (currentCache) => {
    let trimmedCache = { ...currentCache };
    const keys = Object.keys(trimmedCache);
    const now = Date.now();
    
    // Remove expired entries
    keys.forEach(key => {
      if (now - trimmedCache[key].timestamp > CACHE_EXPIRATION) {
        delete trimmedCache[key];
      }
    });
    
    // Remove oldest entries if we exceed MAX_CACHE_ENTRIES
    while (Object.keys(trimmedCache).length > MAX_CACHE_ENTRIES) {
      const oldestKey = Object.keys(trimmedCache).reduce((a, b) => 
        trimmedCache[a].timestamp < trimmedCache[b].timestamp ? a : b
      );
      delete trimmedCache[oldestKey];
    }
    
    // Check size and remove entries if we're still over MAX_CACHE_SIZE
    let serializedSize = JSON.stringify(trimmedCache).length;
    while (serializedSize > MAX_CACHE_SIZE && Object.keys(trimmedCache).length > 0) {
      const oldestKey = Object.keys(trimmedCache).reduce((a, b) => 
        trimmedCache[a].timestamp < trimmedCache[b].timestamp ? a : b
      );
      delete trimmedCache[oldestKey];
      serializedSize = JSON.stringify(trimmedCache).length;
    }
    
    return trimmedCache;
  };

  const handleFetchData = useCallback(async () => {
    setLoading(true);
    setData([]);
    setErrorMessage('');
    setCurrentSegment(null);
    console.log('Fetching data for keywords:', keywords);

    if (cache[keywords] && Date.now() - cache[keywords].timestamp < CACHE_EXPIRATION) {
      const cachedData = cache[keywords];
      setData(cachedData.data || []);
      setAllData(cachedData.data.filter(item => item.asin !== 'Summary') || []);
      setSummaryData(cachedData.summaryData || null);
      setResultsCount(cachedData.resultsCount || 0);
      setLoading(false);
      return;
    }

    try {
      const keywordList = keywords.split(',').map(keyword => keyword.trim());
      const allResults = await fetchDataForKeywords(keywordList);

      const processedResults = processData(allResults);
      const summary = updateSummary(processedResults);

      setSummaryData(summary);
      setData([summary, ...processedResults]);
      setAllData(processedResults);
      setResultsCount(processedResults.length);

      const updatedCache = trimCache({
        ...cache,
        [keywords]: {
          data: [summary, ...processedResults],
          summaryData: summary,
          resultsCount: processedResults.length,
          timestamp: Date.now()
        }
      });

      setCache(updatedCache);

      // Trigger feature segmentation for the new data
      handleFeatureSegmentation(processedResults);
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("An error occurred while fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [keywords, cache, handleFeatureSegmentation]);

  useEffect(() => {
    if (triggerSearch && keywords) {
      handleFetchData();
    }
  }, [triggerSearch, keywords, handleFetchData]);

  const handleSegmentToggle = useCallback((segment) => {
    setExpandedSegments(prev => ({ ...prev, [segment]: !prev[segment] }));
  }, []);

  const handleDeleteRow = useCallback((asin) => {
    setData(prevData => {
      const updatedData = prevData.filter(item => item.asin !== asin);
      const newSummary = updateSummary(updatedData.filter(item => item.asin !== 'Summary'));
      return [newSummary, ...updatedData.filter(item => item.asin !== 'Summary')];
    });
    setAllData(prevData => prevData.filter(item => item.asin !== asin));
  }, []);

  const fetchWinningProducts = useCallback(() => {
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Invalid input: data is not an array or is empty');
      return;
    }
    const priceSegments = getPriceSegments(data.filter(item => item.asin !== 'Summary'), priceSegmentIncrement, summaryData);
    const winners = priceSegments.map(segment => {
      const sortedItems = segment.items.sort((a, b) => b.sales - a.sales);
      return sortedItems[0]; // Return the item with the highest sales
    }).filter(Boolean);
    setWinningProducts(winners);
  }, [data, priceSegmentIncrement, summaryData]);

  const fetchComparisonProducts = useCallback(async () => {
    setLoading(true);
    try {
      const productsForComparison = await Promise.all(
        selectedForComparison.map(async (asin) => {
          try {
            const productDetails = await fetchProductDetails(asin, settings.apiProvider);
            const mainTableProduct = data.find(item => item.asin === asin);
            if (mainTableProduct) {
              console.log(`Found main table product for ASIN ${asin}:`, mainTableProduct);
              return {
                ...productDetails,
                sales: mainTableProduct.sales,
                revenue: mainTableProduct.revenue,
                price: mainTableProduct.price
              };
            } else {
              return productDetails;
            }
          } catch (error) {
            console.error(`Error fetching details for ASIN: ${asin}`, error);
            setErrorMessage(`Failed to fetch details for ASIN: ${asin}`);
            return null;
          }
        })
      );
      console.log('Products for comparison:', productsForComparison);
      setComparisonProducts(productsForComparison.filter(Boolean));
    } catch (error) {
      console.error('Error fetching comparison products:', error);
      setErrorMessage('Failed to fetch comparison products');
    } finally {
      setLoading(false);
    }
  }, [selectedForComparison, data, settings.apiProvider]);

  const handleCompare = useCallback(() => {
    fetchComparisonProducts();
  }, [fetchComparisonProducts]);

  const handleCheckboxChange = useCallback((asin) => {
    setSelectedForComparison(prev => {
      if (prev.includes(asin)) {
        return prev.filter(item => item !== asin);
      } else {
        return [...prev, asin];
      }
    });
  }, []);

  const handleRequestSort = useCallback((property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  const handleSegmentSelect = useCallback((segmentProducts, segmentName) => {
    const segmentData = segmentProducts.map(product => ({
      ...product,
      price: parseFloat(product.price) || 0,
      sales: parseInt(product.sales) || 0,
      revenue: parseFloat(product.revenue) || 0,
      reviews: parseInt(product.reviews) || 0
    }));
    const summary = updateSummary(segmentData);
    setData([summary, ...segmentData]);
    setSummaryData(summary);
    setCurrentSegment(segmentName);
    setResultsCount(segmentData.length);
    handleTabChange(null, 0); // Switch to the main table tab
  }, [handleTabChange]);

  const handleResetToAllData = useCallback(() => {
    const summary = updateSummary(allData);
    setData([summary, ...allData]);
    setSummaryData(summary);
    setCurrentSegment(null);
    setResultsCount(allData.length);
  }, [allData]);

  const memoizedPriceSegments = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    const validData = data.filter(item => item.asin !== 'Summary' && item.price && item.sales);
    return getPriceSegments(validData, priceSegmentIncrement, summaryData);
  }, [data, priceSegmentIncrement, summaryData]);

  useEffect(() => {
    if (activeTab === 2) {
      fetchWinningProducts();
    }
  }, [activeTab, fetchWinningProducts]);


  const handleSettingsSave = useCallback((newSettings) => {
    updateSettings(newSettings); // Update the context
  }, [updateSettings]);

  const handleRecycleSegment = useCallback(async (segmentProducts) => {
    console.log("Re-segmenting products:", segmentProducts);
    await handleFeatureSegmentation(segmentProducts);
}, [handleFeatureSegmentation]);


  return (
    <Container>
      
      {currentSegment && (
        <Button variant="outlined" onClick={handleResetToAllData} style={{ marginBottom: '1rem' }}>
          Reset to All Data
        </Button>
      )}
      {errorMessage && (
        <Typography color="error" gutterBottom>
          {errorMessage}
        </Typography>
      )}
      <Typography variant="subtitle1" gutterBottom>
        Total Results: {resultsCount}
      </Typography>
      <div role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
        {activeTab === 0 && (
          <DataTable
            data={data}
            summaryData={summaryData}
            handleCheckboxChange={handleCheckboxChange}
            selectedForComparison={selectedForComparison}
            handleRequestSort={handleRequestSort}
            order={order}
            orderBy={orderBy}
            handleCompare={handleCompare}
            handleDeleteRow={handleDeleteRow}
          />
        )}
      </div>
      <div role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
        {activeTab === 1 && (
          <>
            <Box mb={2} mt={2}>
              <Typography variant="h6" component="h2" gutterBottom>
                Adjust Price Segment Increment
              </Typography>
              <Slider
                value={priceSegmentIncrement}
                onChange={(e, newValue) => setPriceSegmentIncrement(newValue)}
                aria-labelledby="price-segment-increment-slider"
                valueLabelDisplay="auto"
                step={5}
                marks={marks}
                min={5}
                max={50}
              />
            </Box>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="price segments table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Segment</StyledTableCell>
                    <StyledTableCell>Average Price</StyledTableCell>
                    <StyledTableCell>Number of Products</StyledTableCell>
                    <StyledTableCell>Reviews</StyledTableCell>
                    <StyledTableCell>Sales</StyledTableCell>
                    <StyledTableCell>Revenue</StyledTableCell>
                    <StyledTableCell>% of Total Sales</StyledTableCell>
                    <StyledTableCell>% of Total Revenue</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memoizedPriceSegments.map((segment, index) => (
                    <React.Fragment key={index}>
                      <StyledTableRow>
                        <TableCell>{segment.title}</TableCell>
                        <TableCell>${formatNumberWithCommas(segment.averagePrice ? segment.averagePrice.toFixed(2) : 0)}</TableCell>
                        <TableCell>{segment.productCount || 0}</TableCell>
                        <TableCell>{formatNumberWithCommas(segment.reviews || 0)}</TableCell>
                        <TableCell>{formatNumberWithCommas(segment.sales || 0)}</TableCell>
                        <TableCell>${formatNumberWithCommas(segment.revenue ? segment.revenue.toFixed(2) : 0)}</TableCell>
                        <TableCell>{segment.percentOfTotalSales !== undefined ? segment.percentOfTotalSales.toFixed(2) : '0.00'}%</TableCell>
                        <TableCell>{segment.percentOfTotalRevenue !== undefined ? segment.percentOfTotalRevenue.toFixed(2) : '0.00'}%</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleSegmentToggle(segment.title)}
                            aria-label={`${expandedSegments[segment.title] ? 'Collapse' : 'Expand'} ${segment.title}`}
                          >
                            {expandedSegments[segment.title] ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                      </StyledTableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                          <Collapse in={expandedSegments[segment.title]} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                              <Table size="small" aria-label={`${segment.title} products`}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Select</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Reviews</TableCell>
                                    <TableCell>Sales</TableCell>
                                    <TableCell>Revenue</TableCell>
                                    <TableCell>Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {segment.items.map((item, itemIndex) => (
                                    <TableRow key={itemIndex}>
                                      <TableCell>
                                        <Checkbox
                                          checked={selectedForComparison.includes(item.asin)}
                                          onChange={() => handleCheckboxChange(item.asin)}
                                          aria-label={`Select ${item.title} for comparison`}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Link href={item.amazonUrl} target="_blank" rel="noopener noreferrer">
                                          <img src={item.imageUrl} alt={item.title} style={{ width: 50, height: 50 }} />
                                        </Link>
                                      </TableCell>
                                      <TableCell>{item.title}</TableCell>
                                      <TableCell>${formatNumberWithCommas(item.price ? item.price.toFixed(2) : 0)}</TableCell>
                                      <TableCell>{formatNumberWithCommas(item.reviews || 0)}</TableCell>
                                      <TableCell>{formatNumberWithCommas(item.sales || 0)}</TableCell>
                                      <TableCell>${formatNumberWithCommas(item.revenue ? item.revenue.toFixed(2) : 0)}</TableCell>
                                      <TableCell>
                                        <IconButton 
                                          size="small" 
                                          onClick={() => handleDeleteRow(item.asin)}
                                          aria-label={`Delete ${item.title}`}
                                        >
                                          <Delete />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </div>
      <div role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
        {activeTab === 2 && (
          <DataTable
            data={winningProducts}
            summaryData={summaryData}
            handleCheckboxChange={handleCheckboxChange}
            selectedForComparison={selectedForComparison}
            handleRequestSort={handleRequestSort}
            order={order}
            orderBy={orderBy}
            handleCompare={handleCompare}
            handleDeleteRow={handleDeleteRow}
          />
        )}
      </div>
      <div role="tabpanel" hidden={activeTab !== 3} id="tabpanel-3" aria-labelledby="tab-3">
        {activeTab === 3 && (
          <>
            <Box mt={4}>
              <Typography variant="h6" component="h2" gutterBottom>
                Price vs Sales Scatter Plot
              </Typography>
              <ScatterPlot data={data.filter(item => item.asin !== 'Summary')} />
            </Box>
            <Box mt={4}>
              <PieCharts data={data.filter(item => item.asin !== 'Summary')} />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" component="h2" gutterBottom>
                Timeline of Dates First Available
              </Typography>
              <TimelineChart data={data.filter(item => item.asin !== 'Summary')} />
            </Box>
          </>
        )}
      </div>
      <div role="tabpanel" hidden={activeTab !== 4} id="tabpanel-4" aria-labelledby="tab-4">
        {activeTab === 4 && (
          loading ? <LinearProgress /> : <ProductComparison products={comparisonProducts} />
        )}
      </div>
      <div role="tabpanel" hidden={activeTab !== 5} id="tabpanel-5" aria-labelledby="tab-5">
        {activeTab === 5 && (
          <>
            
            <FeatureSegments 
              data={allData} 
              onSegmentSelect={handleSegmentSelect}
              currentKeyword={keywords}
              segments={featureSegments}
              loading={loading}
              onRecycleSegment={handleRecycleSegment}
            />
          </>
        )}
      </div>
      {activeTab === 6 && (
        <Settings onSave={handleSettingsSave} initialSettings={settings} />
      )}
    </Container>
  );
};

export default MainComponent;
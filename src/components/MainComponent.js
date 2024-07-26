import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    TextField, Button, Typography, Box, CircularProgress, Tabs, Tab,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Container, Checkbox, Grid, Slider, Collapse, IconButton, Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMore, ExpandLess, Delete } from '@mui/icons-material';
import DataTable from './DataTable';
import { ScatterPlot, PieCharts, TimelineChart } from './Charts';
import ProductComparison from './ProductComparison';
import CSVUpload from './CSVUpload';
import { fetchTopKeywords, fetchDataForKeywords, fetchProductDetailsFromRainforest } from '../utils/api';
import { updateSummary, getPriceSegments, processData, formatNumberWithCommas } from '../utils/dataProcessing';

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

const MainComponent = () => {
    const [keywords, setKeywords] = useState('');
    const [data, setData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [resultsCount, setResultsCount] = useState(0);
    const [queriedKeywords, setQueriedKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState({});
    const [keywordResults, setKeywordResults] = useState({});
    const [priceSegmentIncrement, setPriceSegmentIncrement] = useState(5);
    const [expandedSegments, setExpandedSegments] = useState({});
    const [winningProducts, setWinningProducts] = useState([]);
    const [comparisonProducts, setComparisonProducts] = useState([]);
    const [selectedForComparison, setSelectedForComparison] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('');

    const initialCache = JSON.parse(localStorage.getItem('keywordCache')) || {};
    const [cache, setCache] = useState(initialCache);

    useEffect(() => {
        localStorage.setItem('keywordCache', JSON.stringify(cache));
    }, [cache]);

    const handleKeywordsChange = (event) => {
        setKeywords(event.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (newValue === 2 && winningProducts.length === 0) {
            fetchWinningProducts();
        }
        if (newValue === 4) {
            fetchComparisonProducts();
        }
    };

    const handleFetchData = async () => {
        setLoading(true);
        setData([]);
        setQueriedKeywords([]);
        setSelectedKeywords({});
        setKeywordResults({});
        setErrorMessage('');
        console.log('Fetching data for keywords:', keywords);

        if (cache[keywords]) {
            const cachedData = cache[keywords];
            setData(cachedData.data || []);
            setSummaryData(cachedData.summaryData || null);
            setResultsCount(cachedData.resultsCount || 0);
            setQueriedKeywords(cachedData.queriedKeywords || []);
            setSelectedKeywords(cachedData.selectedKeywords || {});
            setKeywordResults(cachedData.keywordResults || {});
            setLoading(false);
            return;
        }

        try {
            const topKeywords = await fetchTopKeywords(keywords);
            const uniqueTopKeywords = Array.from(new Set([keywords, ...topKeywords.filter(k => k.toLowerCase() !== keywords.toLowerCase())]));
            setQueriedKeywords(uniqueTopKeywords);

            const allResults = await fetchDataForKeywords(uniqueTopKeywords);
            const totalResults = allResults.flat();
            const uniqueResults = Array.from(new Set(totalResults.map(item => item.asin)))
                .map(asin => totalResults.find(item => item.asin === asin));

            const processedResults = processData(uniqueResults);
            const summary = updateSummary(processedResults);

            setSummaryData(summary);
            setData([summary, ...processedResults]);
            setResultsCount(processedResults.length);

            const keywordResults = uniqueTopKeywords.reduce((acc, keyword, index) => {
                acc[keyword] = allResults[index];
                return acc;
            }, {});

            setKeywordResults(keywordResults);

            const initialSelectedKeywords = uniqueTopKeywords.reduce((acc, keyword) => {
                acc[keyword] = true;
                return acc;
            }, {});

            setSelectedKeywords(initialSelectedKeywords);

            setCache(prevCache => ({
                ...prevCache,
                [keywords]: {
                    data: [summary, ...processedResults],
                    summaryData: summary,
                    resultsCount: processedResults.length,
                    queriedKeywords: uniqueTopKeywords,
                    selectedKeywords: initialSelectedKeywords,
                    keywordResults: keywordResults,
                }
            }));
        } catch (error) {
            console.error("Error fetching data:", error);
            setErrorMessage("An error occurred while fetching data. Please try again.");
        }

        setLoading(false);
    };

    const handleToggleKeyword = useCallback((keyword) => {
        setSelectedKeywords(prev => {
            const updated = { ...prev, [keyword]: !prev[keyword] };
            updateDataForSelectedKeywords(updated);
            return updated;
        });
    }, []);

    const updateDataForSelectedKeywords = useCallback((updatedSelectedKeywords) => {
        const activeKeywords = Object.keys(updatedSelectedKeywords).filter(keyword => updatedSelectedKeywords[keyword]);
        const activeResults = activeKeywords.flatMap(keyword => keywordResults[keyword] || []).filter(item => item);

        const processedResults = processData(activeResults);
        const summary = updateSummary(processedResults);

        setSummaryData(summary);
        setData([summary, ...processedResults]);
    }, [keywordResults]);

    const handleSegmentToggle = useCallback((segment) => {
        setExpandedSegments(prev => ({ ...prev, [segment]: !prev[segment] }));
    }, []);

    const handleDeleteRow = useCallback((asin) => {
        setData(prevData => {
            const updatedData = prevData.filter(item => item.asin !== asin);
            return updateSummary(updatedData);
        });
    }, []);

    const updateResultsCount = useCallback((count) => {
        setResultsCount(count);
    }, []);

    const fetchWinningProducts = useCallback(() => {
        const priceSegments = getPriceSegments(data, priceSegmentIncrement, summaryData);
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
                const productDetails = await fetchProductDetailsFromRainforest(asin);
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
      }, [selectedForComparison, data]);
      
      

    const handleCompare = useCallback(() => {
        fetchComparisonProducts();
        setActiveTab(4);  // Navigate to the Comparison tab
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

    const handleCSVUpload = useCallback((uploadedData) => {
        console.log("MainComponent: CSV Upload - Received data", uploadedData.length, "items");
        
        const summary = updateSummary(uploadedData);
        console.log("MainComponent: CSV Upload - Summary", summary);

        setSummaryData(summary);
        setData(uploadedData);
        setResultsCount(uploadedData.length);
        setQueriedKeywords([]);
        setSelectedKeywords({});
        setKeywordResults({});
        
        console.log("MainComponent: CSV Upload - State updates complete");
        console.log("MainComponent: CSV Upload - Data state", uploadedData);
        console.log("MainComponent: CSV Upload - Summary state", summary);
    }, []);

    const memoizedPriceSegments = useMemo(() => 
        getPriceSegments(data, priceSegmentIncrement, summaryData),
        [data, priceSegmentIncrement, summaryData]
    );

    useEffect(() => {
        if (activeTab === 2) {
            fetchWinningProducts();
        }
    }, [activeTab, fetchWinningProducts]);

    return (
        <Container>
            <Box display="flex" alignItems="center" mb={2} sx={{ marginRight: 1, marginTop: 4 }}>
                <TextField
                    label="Enter keywords separated by commas"
                    variant="outlined"
                    fullWidth
                    value={keywords}
                    onChange={handleKeywordsChange}
                    aria-label="Enter keywords"
                />
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleFetchData} 
                    disabled={loading}
                    aria-label="Fetch Data"
                >
                    {loading ? <CircularProgress size={24} /> : 'Fetch Data'}
                </Button>
                <CSVUpload 
                    onDataUpload={handleCSVUpload}
                    setLoading={setLoading}
                />
            </Box>
            {errorMessage && (
                <Typography color="error" gutterBottom>
                    {errorMessage}
                </Typography>
            )}
            <Typography variant="subtitle1" gutterBottom>
                Total Results: {resultsCount}
            </Typography>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="Data view tabs">
                <Tab label="All Results" id="tab-0" aria-controls="tabpanel-0" />
                <Tab label="Price Segments" id="tab-1" aria-controls="tabpanel-1" />
                <Tab label="Winners" id="tab-2" aria-controls="tabpanel-2" />
                <Tab label="Insights" id="tab-3" aria-controls="tabpanel-3" />
                <Tab label="Comparison" id="tab-4" aria-controls="tabpanel-4" />
            </Tabs>
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
                                    <StyledTableRow>
                                        <StyledTableCell>Segment</StyledTableCell>
                                        <StyledTableCell>Average Price</StyledTableCell>
                                        <StyledTableCell>Number of Products</StyledTableCell>
                                        <StyledTableCell>Reviews</StyledTableCell>
                                        <StyledTableCell>Sales</StyledTableCell>
                                        <StyledTableCell>Revenue</StyledTableCell>
                                        <StyledTableCell>% of Total Sales</StyledTableCell>
                                        <StyledTableCell>% of Total Revenue</StyledTableCell>
                                        <StyledTableCell>Actions</StyledTableCell>
                                    </StyledTableRow>
                                </TableHead>
                                <TableBody>
                                    {memoizedPriceSegments.map((segment, index) => (<React.Fragment key={index}>
                                            <StyledTableRow>
                                                <TableCell>{segment.title}</TableCell>
                                                <TableCell>{segment.price}</TableCell>
                                                <TableCell>{segment.productCount}</TableCell>
                                                <TableCell>{formatNumberWithCommas(segment.reviews)}</TableCell>
                                                <TableCell>{formatNumberWithCommas(segment.sales)}</TableCell>
                                                <TableCell>${formatNumberWithCommas(segment.revenue)}</TableCell>
                                                <TableCell>{segment.percentOfTotalSales}</TableCell>
                                                <TableCell>{segment.percentOfTotalRevenue}</TableCell>
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
                                                                            <TableCell>${formatNumberWithCommas(item.price)}</TableCell>
                                                                            <TableCell>{formatNumberWithCommas(item.reviews)}</TableCell>
                                                                            <TableCell>{formatNumberWithCommas(item.sales)}</TableCell>
                                                                            <TableCell>${formatNumberWithCommas(item.revenue)}</TableCell>
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
                    loading ? <CircularProgress /> : <ProductComparison products={comparisonProducts} />
                )}
            </div>
        </Container>
    );
};

export default MainComponent;

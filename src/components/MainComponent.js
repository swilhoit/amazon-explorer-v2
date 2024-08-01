import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Typography, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Container, Checkbox, Slider, Collapse, IconButton, Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMore, ExpandLess, Delete } from '@mui/icons-material';
import DataTable from './DataTable';
import { ScatterPlot, PieCharts, TimelineChart } from './Charts';
import ProductComparison from './ProductComparison';
import { fetchTopKeywords, fetchDataForKeywords, fetchProductDetailsFromRainforest } from '../utils/api';
import { updateSummary, getPriceSegments, processData, formatNumberWithCommas } from '../utils/dataProcessing';
import FeatureSegments from './FeatureSegments';

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

const MainComponent = ({ uploadedData, activeTab, handleTabChange, keywords }) => {
    const [data, setData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resultsCount, setResultsCount] = useState(0);
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

    useEffect(() => {
        if (uploadedData && uploadedData.length > 0) {
            const summary = updateSummary(uploadedData);
            setSummaryData(summary);
            setData(uploadedData);
            setResultsCount(uploadedData.length);
            setKeywordResults({});
        }
    }, [uploadedData]);

    // Fetch data when the keywords prop changes
    useEffect(() => {
        if (keywords) {
            handleFetchData();
        }
    }, [keywords]);

    const handleFetchData = async () => {
        setLoading(true);
        setData([]);
        setKeywordResults({});
        setErrorMessage('');
        console.log('Fetching data for keywords:', keywords);

        if (cache[keywords]) {
            const cachedData = cache[keywords];
            setData(cachedData.data || []);
            setSummaryData(cachedData.summaryData || null);
            setResultsCount(cachedData.resultsCount || 0);
            setKeywordResults(cachedData.keywordResults || {});
            setLoading(false);
            return;
        }

        try {
            const topKeywords = await fetchTopKeywords(keywords.split(',').map(keyword => keyword.trim())); // Ensure keywords are split into an array
            const uniqueTopKeywords = Array.from(new Set([keywords, ...topKeywords.filter(k => k.toLowerCase() !== keywords.toLowerCase())]));

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

            setCache(prevCache => ({
                ...prevCache,
                [keywords]: {
                    data: [summary, ...processedResults],
                    summaryData: summary,
                    resultsCount: processedResults.length,
                    keywordResults: keywordResults,
                }
            }));
        } catch (error) {
            console.error("Error fetching data:", error);
            setErrorMessage("An error occurred while fetching data. Please try again.");
        }

        setLoading(false);
    };

    const handleSegmentToggle = useCallback((segment) => {
        setExpandedSegments(prev => ({ ...prev, [segment]: !prev[segment] }));
    }, []);

    const handleDeleteRow = useCallback((asin) => {
        setData(prevData => {
            const updatedData = prevData.filter(item => item.asin !== asin);
            return updateSummary(updatedData);
        });
    }, []);

    const fetchWinningProducts = useCallback(() => {
        if (!Array.isArray(data) || data.length === 0) {
            console.error('Invalid input: data is not an array or is empty');
            return;
        }
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
            <div role="tabpanel" hidden={activeTab !== 5} id="tabpanel-5" aria-labelledby="tab-5">
                {activeTab === 5 && (
                    <FeatureSegments data={data} />
                )}
            </div>
        </Container>
    );
};

export default MainComponent;

import React, { useState, useEffect, useCallback } from 'react';
import {
    TextField, Button, Typography, Box, CircularProgress, Tabs, Tab,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Container, Checkbox, Grid, Slider, Collapse, IconButton, Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpandMore, ExpandLess, Delete } from '@mui/icons-material';
import DataTable from './components/DataTable';
import ScatterPlot from './components/ScatterPlot';
import PieCharts from './components/PieCharts';
import TimelineChart from './components/TimelineChart';
import ProductComparison from './components/ProductComparison';
import CSVUpload from './components/CSVUpload';
import { fetchTopKeywords, fetchDataForKeywords, fetchProductDetailsFromRainforest } from './utils/api';
import { updateSummary, getPriceSegments, processData } from './utils/dataProcessing';

const StyledTableCell = styled(TableCell)({
    backgroundColor: '#d3d3d3',
    fontWeight: 'bold',
});

const StyledTableRow = styled(TableRow)({
    '&:hover': {
        backgroundColor: 'inherit',
    },
});

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

const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

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

    const initialCache = JSON.parse(localStorage.getItem('keywordCache')) || {};
    const [cache, setCache] = useState(initialCache);

    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('');

    useEffect(() => {
        console.log("MainComponent: Data state updated", data?.length, "items");
        console.log("MainComponent: First few items:", data?.slice(0, 3));
    }, [data]);

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
            // TODO: Add user-friendly error message display
        }

        setLoading(false);
    };

    const handleToggleKeyword = (keyword) => {
        const updatedSelectedKeywords = { ...selectedKeywords, [keyword]: !selectedKeywords[keyword] };
        setSelectedKeywords(updatedSelectedKeywords);
        updateDataForSelectedKeywords(updatedSelectedKeywords);
    };

    const updateDataForSelectedKeywords = (updatedSelectedKeywords) => {
        const activeKeywords = Object.keys(updatedSelectedKeywords).filter(keyword => updatedSelectedKeywords[keyword]);
        const activeResults = activeKeywords.flatMap(keyword => keywordResults[keyword] || []).filter(item => item);

        const processedResults = processData(activeResults);
        const summary = updateSummary(processedResults);

        setSummaryData(summary);
        setData([summary, ...processedResults]);
    };

    const handleSegmentToggle = (segment) => {
        setExpandedSegments(prev => ({ ...prev, [segment]: !prev[segment] }));
    };

    const handleDeleteRow = (asin) => {
        const updatedData = data.filter(item => item.asin !== asin);
        const updatedDataWithSummary = updateSummary(updatedData);
        setData(updatedDataWithSummary);
    };

    const updateResultsCount = (count) => {
        setResultsCount(count);
    };

    const fetchWinningProducts = () => {
        const priceSegments = getPriceSegments(data, priceSegmentIncrement, summaryData);
        const winningProducts = priceSegments.map(segment => segment.items[0]);
        setWinningProducts(winningProducts);
    };

    const fetchComparisonProducts = async () => {
        const productsForComparison = [];
        for (const asin of selectedForComparison) {
            try {
                const productDetails = await fetchProductDetailsFromRainforest(asin);
                productsForComparison.push(productDetails);
            } catch (error) {
                console.error(`Error fetching details for ASIN: ${asin}`, error);
            }
        }
        setComparisonProducts(productsForComparison);
    };

    const handleCompare = () => {
        fetchComparisonProducts();
        setActiveTab(4);  // Navigate to the Comparison tab
    };

    const handleCheckboxChange = (asin) => {
        setSelectedForComparison(prev => {
            if (prev.includes(asin)) {
                return prev.filter(item => item !== asin);
            } else {
                return [...prev, asin];
            }
        });
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);

        const sortedData = [...data].sort((a, b) => {
            if (a[property] < b[property]) {
                return isAsc ? -1 : 1;
            }
            if (a[property] > b[property]) {
                return isAsc ? 1 : -1;
            }
            return 0;
        });

        setData(sortedData);
    };

    const handleCSVUpload = useCallback((uploadedData) => {
        console.log("MainComponent: CSV Upload - Received data", uploadedData.length, "items");
        console.log("MainComponent: CSV Upload - First few items:", uploadedData.slice(0, 3));
    
        setData(uploadedData);
        setSummaryData(null); // Assuming no summary data from CSV
        setResultsCount(uploadedData.length);
        setQueriedKeywords([]);
        setSelectedKeywords({});
        setKeywordResults({});
        
        // Force a re-render of the DataTable
        setActiveTab(prevTab => (prevTab === 0 ? 1 : 0));
        
        console.log("MainComponent: CSV Upload - State updates complete");
    }, []);
    

    return (
        <Container>
            <Box display="flex" alignItems="center" mb={2} sx={{ marginRight: 1, marginTop: 4 }}>
                <TextField
                    label="Enter keywords separated by commas"
                    variant="outlined"
                    fullWidth
                    value={keywords}
                    onChange={handleKeywordsChange}
                />
                <Button variant="contained" color="primary" onClick={handleFetchData} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Fetch Data'}
                </Button>
                <CSVUpload 
                    onDataUpload={handleCSVUpload}
                    setLoading={setLoading}
                />
            </Box>
            <Button variant="contained" color="secondary" onClick={handleCompare} disabled={loading || selectedForComparison.length === 0}>
                Compare
            </Button>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    {queriedKeywords.length > 0 && (
                        <Box mb={2}>
                            <Typography variant="h6" component="h2" gutterBottom>
                                Queried Keywords
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <StyledTableCell>Keyword</StyledTableCell>
                                            <StyledTableCell>Results</StyledTableCell>
                                            <StyledTableCell>Select</StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {queriedKeywords.map((keyword, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{keyword}</TableCell>
                                                <TableCell>{(keywordResults[keyword] || []).length || 0}</TableCell>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedKeywords[keyword] ?? true}
                                                        onChange={() => handleToggleKeyword(keyword)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    <ScatterPlot data={data.filter(item => item.asin !== "Summary")} />
                </Grid>
            </Grid>
            <Typography variant="subtitle1" gutterBottom>
                Total Results: {resultsCount}
            </Typography>
            <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="All Results" />
                <Tab label="Price Segments" />
                <Tab label="Winners" />
                <Tab label="Insights" />
                <Tab label="Comparison" />
            </Tabs>
            {activeTab === 0 && (
                <DataTable
                    data={data}
                    summaryData={summaryData}
                    resultsCount={resultsCount}
                    queriedKeywords={queriedKeywords}
                    setData={setData}
                    updateSummary={updateSummary}
                    handleDeleteRow={handleDeleteRow}
                    updateResultsCount={updateResultsCount}
                    handleCheckboxChange={handleCheckboxChange}
                    selectedForComparison={selectedForComparison}
                    handleRequestSort={handleRequestSort}
                    order={order}
                    orderBy={orderBy}
                />
            )}
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
                        <Table size="small">
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
                                {getPriceSegments(data, priceSegmentIncrement, summaryData).map((segment, index) => (
                                    <React.Fragment key={index}>
                                        <TableRow>
                                            <StyledTableCell>{segment.title}</StyledTableCell>
                                            <StyledTableCell>{segment.price}</StyledTableCell>
                                            <StyledTableCell>{segment.productCount}</StyledTableCell>
                                            <StyledTableCell>{segment.reviews}</StyledTableCell>
                                            <StyledTableCell>{segment.sales}</StyledTableCell>
                                            <StyledTableCell>{segment.revenue}</StyledTableCell>
                                            <StyledTableCell>{segment.percentOfTotalSales}</StyledTableCell>
                                            <StyledTableCell>{segment.percentOfTotalRevenue}</StyledTableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => handleSegmentToggle(segment.title)}>
                                                    {expandedSegments[segment.title] ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={9} style={{ paddingBottom: 0, paddingTop: 0 }}>
                                                <Collapse in={expandedSegments[segment.title]} timeout="auto" unmountOnExit>
                                                    <Box margin={1}>
                                                        <Table size="small" aria-label="purchases">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Checkbox</TableCell>
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
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Link href={item.amazonUrl} target="_blank" rel="noopener noreferrer">
                                                                                <img src={item.imageUrl} alt={item.title} style={{ width: 50, height: 50 }} />
                                                                            </Link>
                                                                        </TableCell>
                                                                        <TableCell>{item.title}</TableCell>
                                                                        <TableCell>{item.price}</TableCell>
                                                                        <TableCell>{item.reviews}</TableCell>
                                                                        <TableCell>{item.sales}</TableCell>
                                                                        <TableCell>{item.revenue}</TableCell>
                                                                        <TableCell>
                                                                            <IconButton size="small" onClick={() => handleDeleteRow(item.asin)}>
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
            {activeTab === 2 && (
                <DataTable
                    data={winningProducts}
                    summaryData={null}
                    resultsCount={winningProducts.length}
                    queriedKeywords={[]}
                    setData={setWinningProducts}
                    updateSummary={() => { }}
                    handleDeleteRow={() => { }}
                    updateResultsCount={() => { }}
                    handleCheckboxChange={handleCheckboxChange}
                    selectedForComparison={selectedForComparison}
                    handleRequestSort={handleRequestSort}
                    order={order}
                    orderBy={orderBy}
                />
            )}
            {activeTab === 3 && (
                <>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <PieCharts data={data.slice(1)} type="sellerType" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <PieCharts data={data.slice(1)} type="brand" />
                        </Grid>
                    </Grid>
                    <Box mt={4}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            Timeline of Dates First Available
                        </Typography>
                        <TimelineChart data={data.slice(1)} />
                    </Box>
                </>
            )}
            {activeTab === 4 && (
                <ProductComparison products={comparisonProducts} />
            )}
        </Container>
    );
};

export default MainComponent;
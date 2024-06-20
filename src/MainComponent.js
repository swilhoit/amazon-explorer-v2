import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

    const initialCache = JSON.parse(localStorage.getItem('keywordCache')) || {};
    const [cache, setCache] = useState(initialCache);

    useEffect(() => {
        console.log("Data updated:", data);
    }, [data]);

    useEffect(() => {
        localStorage.setItem('keywordCache', JSON.stringify(cache));
    }, [cache]);

    const handleKeywordsChange = (event) => {
        setKeywords(event.target.value);
        console.log('Keywords changed:', event.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleFetchData = async () => {
        setLoading(true);
        setData([]);
        setQueriedKeywords([]);
        setSelectedKeywords({});
        setKeywordResults({});
        console.log('Fetching data for keywords:', keywords);

        if (cache[keywords]) {
            console.log('Using cached data for keywords:', keywords);
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

        const apiKey = process.env.REACT_APP_JUNGLE_SCOUT_API_KEY;
        const keyName = process.env.REACT_APP_JUNGLE_SCOUT_KEY_NAME;

        const headers = {
            'Authorization': `${keyName}:${apiKey}`,
            'X-API-Type': 'junglescout',
            'Accept': 'application/vnd.junglescout.v1+json',
            'Content-Type': 'application/vnd.api+json',
        };

        try {
            const topKeywords = await fetchTopKeywords(keywords, headers);
            console.log('Top Keywords:', topKeywords);

            const uniqueTopKeywords = Array.from(new Set([keywords, ...topKeywords.filter(k => k.toLowerCase() !== keywords.toLowerCase())]));
            setQueriedKeywords(uniqueTopKeywords);

            const allResults = await fetchDataForKeywords(uniqueTopKeywords, headers);
            const totalResults = allResults.flat();
            const uniqueResults = Array.from(new Set(totalResults.map(item => item.asin)))
                .map(asin => totalResults.find(item => item.asin === asin));

            const totalSales = uniqueResults.reduce((sum, item) => sum + item.sales, 0);
            const totalRevenue = uniqueResults.reduce((sum, item) => sum + item.revenue, 0);

            const processedResults = uniqueResults.map(item => ({
                ...item,
                percentOfTotalSales: ((item.sales / totalSales) * 100).toFixed(2) + '%',
                percentOfTotalRevenue: ((item.revenue / totalRevenue) * 100).toFixed(2) + '%',
                revenue: parseFloat(item.revenue).toFixed(2),
                price: parseFloat(item.price).toFixed(2),
            }));

            processedResults.sort((a, b) => b.sales - a.sales);

            const averagePrice = (processedResults.reduce((sum, item) => sum + parseFloat(item.price), 0) / processedResults.length).toFixed(2);
            const averageReviews = (processedResults.reduce((sum, item) => sum + item.reviews, 0) / processedResults.length).toFixed(0);

            const summary = {
                asin: "Summary",
                title: "",
                brand: "",
                price: `$${averagePrice}`,
                reviews: averageReviews,
                rating: "",
                category: "",
                sales: totalSales,
                percentOfTotalSales: "100%",
                revenue: `$${parseFloat(totalRevenue).toFixed(2)}`,
                percentOfTotalRevenue: "100%",
                imageUrl: "",
                sellerType: "",
                dateFirstAvailable: "",
            };

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
            if (error.response) {
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
                console.error("Error headers:", error.response.headers);
            }
        }

        setLoading(false);
    };

    const fetchTopKeywords = async (keyword, headers) => {
        const url = `https://developer.junglescout.com/api/keywords/keywords_by_keyword_query?marketplace=us&sort=-monthly_search_volume_exact&page[size]=50`;
        const payload = {
            data: {
                type: "keywords_by_keyword_query",
                attributes: {
                    search_terms: keyword
                }
            }
        };

        console.log('Payload:', JSON.stringify(payload, null, 2));

        try {
            const response = await axios.post(url, payload, { headers });
            console.log("Response data:", response.data);
            const keywords = response.data.data
                .sort((a, b) => {
                    const relevancyA = a.attributes.relevancy_score || a.attributes.monthly_search_volume_exact;
                    const relevancyB = b.attributes.relevancy_score || b.attributes.monthly_search_volume_exact;
                    return relevancyB - relevancyA;
                })
                .slice(0, 5)
                .map(item => item.attributes.name);

            return keywords;
        } catch (error) {
            console.error("Error fetching top keywords:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
            }
            return [];
        }
    };

    const fetchDataForKeywords = async (keywords, headers) => {
        const baseUrl = "https://developer.junglescout.com/api/product_database_query?marketplace=us&sort=-sales&page[size]=100";
        const results = [];

        for (const keyword of keywords) {
            const payload = {
                data: {
                    type: "product_database_query",
                    attributes: {
                        include_keywords: [keyword],
                        exclude_unavailable_products: true,
                        min_sales: 1
                    }
                }
            };

            try {
                const response = await axios.post(baseUrl, payload, { headers });
                const keywordResults = processResponse(response);
                results.push(keywordResults);
            } catch (error) {
                console.error(`Error fetching data for keyword "${keyword}":`, error);
                if (error.response) {
                    console.error("Error response data:", error.response.data);
                }
            }
        }

        return results;
    };

    const processResponse = (response) => {
        if (response.data && response.data.data) {
            return response.data.data.map(item => ({
                asin: item.id.replace('us/', ''),
                title: item.attributes.title,
                brand: item.attributes.brand,
                price: parseFloat(item.attributes.price ? item.attributes.price.toFixed(2) : '0.00'),
                reviews: item.attributes.reviews ? Math.round(item.attributes.reviews) : 0,
                rating: item.attributes.rating ? item.attributes.rating.toFixed(2) : '0.00',
                category: item.attributes.category,
                sales: item.attributes.approximate_30_day_units_sold ? item.attributes.approximate_30_day_units_sold : 0,
                percentOfTotalSales: 0,
                revenue: parseFloat(item.attributes.approximate_30_day_revenue ? item.attributes.approximate_30_day_revenue.toFixed(2) : '0.00'),
                percentOfTotalRevenue: 0,
                imageUrl: item.attributes.image_url,
                amazonUrl: `https://www.amazon.com/dp/${item.id.replace('us/', '')}`,
                sellerType: item.attributes.seller_type,
                dateFirstAvailable: item.attributes.date_first_available,
            }));
        } else {
            console.error('Invalid response format:', response);
            return [];
        }
    };

    const updateSummary = (updatedData) => {
        const uniqueResults = updatedData.filter(item => item.asin !== "Summary");
        const totalSales = uniqueResults.reduce((sum, item) => sum + (item.sales || 0), 0);
        const totalRevenue = uniqueResults.reduce((sum, item) => sum + (parseFloat(item.revenue) || 0), 0);

        const processedResults = uniqueResults.map(item => ({
            ...item,
            percentOfTotalSales: ((item.sales / totalSales) * 100).toFixed(2) + '%',
            percentOfTotalRevenue: ((item.revenue / totalRevenue) * 100).toFixed(2) + '%',
            revenue: parseFloat(item.revenue).toFixed(2),
            price: parseFloat(item.price).toFixed(2),
        }));

        const averagePrice = (processedResults.reduce((sum, item) => sum + parseFloat(item.price), 0) / processedResults.length).toFixed(2);
        const averageReviews = (processedResults.reduce((sum, item) => sum + (item.reviews || 0), 0) / processedResults.length).toFixed(0);

        const summary = {
            asin: "Summary",
            title: "",
            brand: "",
            price: `$${averagePrice}`,
            reviews: averageReviews,
            rating: "",
            category: "",
            sales: totalSales,
            percentOfTotalSales: "100%",
            revenue: `$${parseFloat(totalRevenue).toFixed(2)}`,
            percentOfTotalRevenue: "100%",
            imageUrl: "",
            sellerType: "",
            dateFirstAvailable: "",
        };

        setSummaryData(summary);
        return [summary, ...processedResults];
    };

    const getPriceSegments = () => {
        const priceSegments = {};

        data.slice(1).forEach((item) => {
            const itemPrice = typeof item.price === 'number' ? item.price.toFixed(2) : item.price;
            const itemRevenue = typeof item.revenue === 'number' ? item.revenue.toFixed(2) : item.revenue;
            const lowPrice = Math.floor(parseFloat(itemPrice) / priceSegmentIncrement) * priceSegmentIncrement;
            const highPrice = lowPrice + priceSegmentIncrement - 0.01;
            const priceSegment = `$${lowPrice.toFixed(2)} - $${highPrice.toFixed(2)}`;

            if (!priceSegments[priceSegment]) {
                priceSegments[priceSegment] = {
                    sales: 0,
                    revenue: 0,
                    count: 0,
                    averagePrice: 0,
                    averageReviews: 0,
                    items: []
                };
            }

            priceSegments[priceSegment].sales += item.sales;
            priceSegments[priceSegment].revenue += parseFloat(itemRevenue);
            priceSegments[priceSegment].count += 1;
            priceSegments[priceSegment].averagePrice += parseFloat(itemPrice);
            priceSegments[priceSegment].averageReviews += item.reviews;
            priceSegments[priceSegment].items.push(item);
        });

        const segmentData = Object.keys(priceSegments).map(segment => {
            const segmentInfo = priceSegments[segment];
            return {
                asin: segment,
                title: segment,
                brand: "",
                price: `$${(segmentInfo.averagePrice / segmentInfo.count).toFixed(2)}`,
                reviews: (segmentInfo.averageReviews / segmentInfo.count).toFixed(0),
                rating: "",
                category: "",
                sales: segmentInfo.sales,
                percentOfTotalSales: ((segmentInfo.sales / summaryData.sales) * 100).toFixed(2) + '%',
                revenue: `$${segmentInfo.revenue.toFixed(2)}`,
                percentOfTotalRevenue: ((segmentInfo.revenue / parseFloat(summaryData.revenue.replace('$', ''))).toFixed(2)) + '%',
                imageUrl: "",
                sellerType: "",
                dateFirstAvailable: "",
                items: segmentInfo.items,
                productCount: segmentInfo.count
            };
        }).filter(segment => segment.sales > 0);

        segmentData.sort((a, b) => parseFloat(a.asin.split('-')[0].replace('$', '')) - parseFloat(b.asin.split('-')[0].replace('$', '')));

        return segmentData;
    };

    const handleToggleKeyword = (keyword) => {
        const updatedSelectedKeywords = { ...selectedKeywords, [keyword]: !selectedKeywords[keyword] };
        setSelectedKeywords(updatedSelectedKeywords);
        updateDataForSelectedKeywords(updatedSelectedKeywords);
    };

    const updateDataForSelectedKeywords = (updatedSelectedKeywords) => {
        const activeKeywords = Object.keys(updatedSelectedKeywords).filter(keyword => updatedSelectedKeywords[keyword]);
        const activeResults = activeKeywords.flatMap(keyword => keywordResults[keyword] || []).filter(item => item);

        const totalSales = activeResults.reduce((sum, item) => sum + (item?.sales || 0), 0);
        const totalRevenue = activeResults.reduce((sum, item) => sum + (parseFloat(item?.revenue) || 0), 0);

        const processedResults = activeResults.map(item => ({
            ...item,
            percentOfTotalSales: ((item.sales / totalSales) * 100).toFixed(2) + '%',
            percentOfTotalRevenue: ((item.revenue / totalRevenue) * 100).toFixed(2) + '%',
            revenue: parseFloat(item.revenue).toFixed(2),
            price: parseFloat(item.price).toFixed(2),
        }));

        processedResults.sort((a, b) => b.sales - a.sales);

        const averagePrice = (processedResults.reduce((sum, item) => sum + parseFloat(item.price), 0) / processedResults.length).toFixed(2);
        const averageReviews = (processedResults.reduce((sum, item) => sum + (item.reviews || 0), 0) / processedResults.length).toFixed(0);

        const summary = {
            asin: "Summary",
            title: "",
            brand: "",
            price: `$${averagePrice}`,
            reviews: averageReviews,
            rating: "",
            category: "",
            sales: totalSales,
            percentOfTotalSales: "100%",
            revenue: `$${parseFloat(totalRevenue).toFixed(2)}`,
            percentOfTotalRevenue: "100%",
            imageUrl: "",
            sellerType: "",
            dateFirstAvailable: "",
        };

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
            </Box>
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
                                                        checked={selectedKeywords[keyword] ?? true} // Ensure checkboxes are checked by default
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
            </Tabs>
            {activeTab === 0 && <DataTable data={data} summaryData={summaryData} resultsCount={resultsCount} queriedKeywords={queriedKeywords} setData={setData} updateSummary={updateSummary} handleDeleteRow={handleDeleteRow} />}
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
                                    <StyledTableCell>Reviews</StyledTableCell>
                                    <StyledTableCell>Sales</StyledTableCell>
                                    <StyledTableCell>Revenue</StyledTableCell>
                                    <StyledTableCell>Actions</StyledTableCell>
                                </StyledTableRow>
                            </TableHead>
                            <TableBody>
                                {getPriceSegments().map((segment, index) => (
                                    <React.Fragment key={index}>
                                        <TableRow>
                                            <StyledTableCell>{segment.title}</StyledTableCell>
                                            <StyledTableCell>{segment.price}</StyledTableCell>
                                            <StyledTableCell>{segment.reviews}</StyledTableCell>
                                            <StyledTableCell>{segment.sales}</StyledTableCell>
                                            <StyledTableCell>{segment.revenue}</StyledTableCell>
                                            <StyledTableCell>
                                                <IconButton size="small" onClick={() => handleSegmentToggle(segment.asin)}>
                                                    {expandedSegments[segment.asin] ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </StyledTableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={6} style={{ padding: 0, border: 0 }}>
                                                <Collapse in={expandedSegments[segment.asin]} timeout="auto" unmountOnExit>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <StyledTableCell>Image</StyledTableCell>
                                                                <StyledTableCell>Title</StyledTableCell>
                                                                <StyledTableCell>Price</StyledTableCell>
                                                                <StyledTableCell>Reviews</StyledTableCell>
                                                                <StyledTableCell>Sales</StyledTableCell>
                                                                <StyledTableCell>Revenue</StyledTableCell>
                                                                <StyledTableCell>Actions</StyledTableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {(segment.items || []).map((item, itemIndex) => (
                                                                <TableRow key={itemIndex} style={{ backgroundColor: '#f9f9f9' }}>
                                                                    <TableCell>
                                                                        <Link href={item.amazonUrl} target="_blank">
                                                                            <img src={item.imageUrl} alt={item.title} style={{ width: 50 }} />
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
            {activeTab === 2 && <DataTable data={getPriceSegments().map(segment => segment.items && segment.items[0]).filter(item => item)} summaryData={summaryData} queriedKeywords={queriedKeywords} setData={setData} updateSummary={updateSummary} handleDeleteRow={handleDeleteRow} />}
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
        </Container>
    );
};

export default MainComponent;

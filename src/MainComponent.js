import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, CircularProgress, Tabs, Tab, CssBaseline, IconButton } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DataTable from './components/DataTable';
import ScatterPlot from './components/ScatterPlot';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const MainComponent = () => {
    const [keywords, setKeywords] = useState('');
    const [data, setData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        console.log("Data updated:", data);
    }, [data]);

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
        console.log('Fetching data for keywords:', keywords);

        const apiKey = process.env.REACT_APP_JUNGLE_SCOUT_API_KEY;
        const keyName = process.env.REACT_APP_JUNGLE_SCOUT_KEY_NAME;
        const url = "https://developer.junglescout.com/api/product_database_query?marketplace=us";

        const headers = {
            'Authorization': `${keyName}:${apiKey}`,
            'X-API-Type': 'junglescout',
            'Accept': 'application/vnd.junglescout.v1+json',
            'Content-Type': 'application/vnd.api+json',
        };

        const keywordList = keywords.split(',').map(keyword => keyword.trim());

        let allResults = [];

        for (const keyword of keywordList) {
            const payload = {
                data: {
                    type: "product_database_query",
                    attributes: {
                        include_keywords: [keyword],
                        exclude_unavailable_products: true
                    }
                }
            };

            try {
                const response = await axios.post(url, payload, { headers });

                console.log('API response received:', response);

                if (response.data && response.data.data) {
                    const results = response.data.data.map(item => ({
                        asin: item.id.replace('us/', ''),
                        title: item.attributes.title,
                        brand: item.attributes.brand,
                        price: item.attributes.price ? item.attributes.price.toFixed(2) : '0.00',
                        reviews: item.attributes.reviews ? Math.round(item.attributes.reviews) : 0,
                        rating: item.attributes.rating ? item.attributes.rating.toFixed(2) : '0.00',
                        category: item.attributes.category,
                        sales: item.attributes.approximate_30_day_units_sold ? item.attributes.approximate_30_day_units_sold : 0,
                        percentOfTotalSales: 0,
                        revenue: item.attributes.approximate_30_day_revenue ? item.attributes.approximate_30_day_revenue.toFixed(2) : '0.00',
                        percentOfTotalRevenue: 0,
                        imageUrl: item.attributes.image_url,
                        sellerType: item.attributes.seller_type,
                        dateFirstAvailable: item.attributes.date_first_available,
                    }));

                    allResults = [...allResults, ...results];
                } else {
                    console.error('Invalid response format:', response);
                }
            } catch (error) {
                console.error("API request failed:", error.response ? error.response.data : error.message);
                if (error.response) {
                    console.error("Error data:", error.response.data);
                    console.error("Error status:", error.response.status);
                    console.error("Error headers:", error.response.headers);
                }
            }
        }

        const uniqueResults = Array.from(new Set(allResults.map(item => item.asin)))
            .map(asin => {
                return allResults.find(item => item.asin === asin);
            });

        const totalSales = uniqueResults.reduce((sum, item) => sum + item.sales, 0);
        const totalRevenue = uniqueResults.reduce((sum, item) => sum + parseFloat(item.revenue), 0);

        const processedResults = uniqueResults.map(item => ({
            ...item,
            percentOfTotalSales: ((item.sales / totalSales) * 100).toFixed(2) + '%',
            percentOfTotalRevenue: ((parseFloat(item.revenue) / totalRevenue) * 100).toFixed(2) + '%'
        }));

        processedResults.sort((a, b) => b.sales - a.sales);

        const averagePrice = (processedResults.reduce((sum, item) => sum + parseFloat(item.price), 0) / processedResults.length).toFixed(2);
        const averageReviews = (processedResults.reduce((sum, item) => sum + item.reviews, 0) / processedResults.length).toFixed(0);

        const summary = {
            asin: "Summary",
            title: "",
            brand: "",
            price: averagePrice,
            reviews: averageReviews,
            rating: "",
            category: "",
            sales: totalSales,
            percentOfTotalSales: "100%",
            revenue: totalRevenue.toFixed(2),
            percentOfTotalRevenue: "100%",
            imageUrl: "",
            sellerType: "",
            dateFirstAvailable: "",
        };

        setSummaryData(summary);
        setData([summary, ...processedResults]);
        setLoading(false);
    };

    const getPriceSegments = () => {
        const priceSegments = {};

        data.slice(1).forEach((item) => {
            const lowPrice = Math.floor(item.price / 5) * 5;
            const highPrice = lowPrice + 4.99;
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
            priceSegments[priceSegment].revenue += parseFloat(item.revenue);
            priceSegments[priceSegment].count += 1;
            priceSegments[priceSegment].averagePrice += parseFloat(item.price);
            priceSegments[priceSegment].averageReviews += item.reviews;
            priceSegments[priceSegment].items.push(item);
        });

        const segmentData = Object.keys(priceSegments).map(segment => {
            const segmentInfo = priceSegments[segment];
            return {
                asin: segment,
                title: segment, // Label the price range
                brand: "",
                price: (segmentInfo.averagePrice / segmentInfo.count).toFixed(2),
                reviews: (segmentInfo.averageReviews / segmentInfo.count).toFixed(0),
                rating: "",
                category: "",
                sales: segmentInfo.sales,
                percentOfTotalSales: ((segmentInfo.sales / summaryData.sales) * 100).toFixed(2) + '%',
                revenue: segmentInfo.revenue.toFixed(2),
                percentOfTotalRevenue: ((segmentInfo.revenue / summaryData.revenue) * 100).toFixed(2) + '%',
                imageUrl: "",
                sellerType: "",
                dateFirstAvailable: "",
                items: segmentInfo.items,
                productCount: segmentInfo.count // Add the product count here
            };
        }).filter(segment => segment.sales > 0);

        segmentData.sort((a, b) => parseFloat(a.asin.split('-')[0].replace('$', '')) - parseFloat(b.asin.split('-')[0].replace('$', '')));

        return [summaryData, ...segmentData];
    };

    const handleThemeToggle = () => {
        setDarkMode(!darkMode);
    };

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container>
                <Box my={4} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1" gutterBottom>
                        Amazon Product Explorer
                    </Typography>
                    <IconButton onClick={handleThemeToggle} color="inherit">
                        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Box>
                <Box display="flex" alignItems="center" mb={2} sx={{ marginRight: 1 }}>
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
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="All Results" />
                    <Tab label="Price Segments" />
                    <Tab label="Winners" />
                </Tabs>
                <ScatterPlot data={data.slice(1)} />
                {activeTab === 0 && <DataTable data={data} summaryData={summaryData} />}
                {activeTab === 1 && <DataTable data={getPriceSegments()} summaryData={summaryData} priceSegments />}
                {activeTab === 2 && <DataTable data={getPriceSegments().map(segment => segment.items && segment.items[0]).filter(item => item)} summaryData={summaryData} />}
            </Container>
        </ThemeProvider>
    );
};

export default MainComponent;

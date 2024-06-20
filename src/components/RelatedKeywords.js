import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)({
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    cursor: 'pointer'
});

const RelatedKeywords = () => {
    const [keyword, setKeyword] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'monthly_search_volume_exact', direction: 'descending' });

    // Load cache from localStorage on initial render
    const initialCache = JSON.parse(localStorage.getItem('relatedKeywordsCache')) || {};
    const [cache, setCache] = useState(initialCache);

    useEffect(() => {
        // Save cache to localStorage whenever it changes
        localStorage.setItem('relatedKeywordsCache', JSON.stringify(cache));
    }, [cache]);

    const handleKeywordChange = (event) => {
        setKeyword(event.target.value);
    };

    const handleFetchData = async () => {
        setLoading(true);
        setData([]);
        console.log('Fetching related keywords for:', keyword);

        if (cache[keyword]) {
            console.log('Using cached data for keyword:', keyword);
            setData(cache[keyword]);
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

        const url = `https://developer.junglescout.com/api/keywords/keywords_by_keyword_query?marketplace=us&sort=-monthly_search_volume_exact&page[size]=50`;
        const payload = {
            data: {
                type: "keywords_by_keyword_query",
                attributes: {
                    search_terms: keyword
                }
            }
        };

        try {
            const response = await axios.post(url, payload, { headers });
            console.log("Response data:", response.data);
            setData(response.data.data);
            sortData(sortConfig.key, sortConfig.direction, response.data.data);

            // Update the cache
            setCache(prevCache => ({
                ...prevCache,
                [keyword]: response.data.data
            }));
        } catch (error) {
            console.error("Error fetching related keywords:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data); // Log the error response data
            }
        }

        setLoading(false);
    };

    const sortData = (key, direction, newData = data) => {
        const sortedData = [...newData].sort((a, b) => {
            const aValue = a.attributes[key] || 0;
            const bValue = b.attributes[key] || 0;
            if (direction === 'ascending') {
                return aValue - bValue;
            } else {
                return bValue - aValue;
            }
        });
        setData(sortedData);
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        sortData(key, direction);
    };

    return (
        <Container>
            <Box my={4} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" component="h1" gutterBottom>
                    Related Keywords Explorer
                </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={2} sx={{ marginRight: 1 }}>
                <TextField
                    label="Enter a keyword"
                    variant="outlined"
                    fullWidth
                    value={keyword}
                    onChange={handleKeywordChange}
                />
                <Button variant="contained" color="primary" onClick={handleFetchData} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Fetch Data'}
                </Button>
            </Box>
            {data.length > 0 && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell onClick={() => handleSort('name')}>Keyword</StyledTableCell>
                                <StyledTableCell onClick={() => handleSort('monthly_search_volume_exact')}>Search Volume</StyledTableCell>
                                <StyledTableCell onClick={() => handleSort('relevancy_score')}>Relevancy Score</StyledTableCell>
                                <StyledTableCell onClick={() => handleSort('monthly_trend')}>Monthly Trend</StyledTableCell>
                                <StyledTableCell onClick={() => handleSort('quarterly_trend')}>Quarterly Trend</StyledTableCell>
                                <StyledTableCell onClick={() => handleSort('recommended_promotions')}>Recommended Promotions</StyledTableCell>
                                <StyledTableCell onClick={() => handleSort('ppc_bid_broad')}>PPC Bid Broad</StyledTableCell>
                                <StyledTableCell onClick={() => handleSort('ppc_bid_exact')}>PPC Bid Exact</StyledTableCell>
                                <StyledTableCell onClick={() => handleSort('organic_product_count')}>Organic Product Count</StyledTableCell>
                                <StyledTableCell onClick={() => handleSort('sponsored_product_count')}>Sponsored Product Count</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.attributes.name}</TableCell>
                                    <TableCell>{item.attributes.monthly_search_volume_exact}</TableCell>
                                    <TableCell>{item.attributes.relevancy_score}</TableCell>
                                    <TableCell>{item.attributes.monthly_trend}</TableCell>
                                    <TableCell>{item.attributes.quarterly_trend}</TableCell>
                                    <TableCell>{item.attributes.recommended_promotions}</TableCell>
                                    <TableCell>{item.attributes.ppc_bid_broad}</TableCell>
                                    <TableCell>{item.attributes.ppc_bid_exact}</TableCell>
                                    <TableCell>{item.attributes.organic_product_count}</TableCell>
                                    <TableCell>{item.attributes.sponsored_product_count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default RelatedKeywords;

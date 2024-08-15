import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HistoricalSearchVolumeGraph from './HistoricalSearchVolumeGraph';
import { fetchRelatedKeywords, fetchHistoricalData } from '../utils/junglescout';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
    fontWeight: 'bold',
    padding: '8px',
}));

const TrendCell = styled(TableCell)(({ theme, value }) => ({
    padding: '8px',
    color: value > 0 ? 'green' : value < 0 ? 'red' : 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: '120px' // Added to ensure content does not overlap
}));

const RelatedKeywords = () => {
    const [keyword, setKeyword] = useState('');
    const [data, setData] = useState([]);
    const [historicalData, setHistoricalData] = useState([]);
    const [loading, setLoading] = useState(false);

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
        setHistoricalData([]);
        console.log('Fetching related keywords for:', keyword);

        if (cache[keyword]) {
            console.log('Using cached data for keyword:', keyword);
            setData(cache[keyword]);
            setLoading(false);
            return;
        }

        try {
            const relatedKeywordsData = await fetchRelatedKeywords(keyword);
            console.log('API Response - Related Keywords:', relatedKeywordsData); // Added API response log

            const originalKeywordData = relatedKeywordsData.find(item => item.keyword.toLowerCase() === keyword.toLowerCase());
            const otherKeywords = relatedKeywordsData.filter(item => item.keyword.toLowerCase() !== keyword.toLowerCase());
            
            otherKeywords.sort((a, b) => b.relevancy_score - a.relevancy_score);
            const sortedData = originalKeywordData ? [originalKeywordData, ...otherKeywords] : otherKeywords;
            
            setData(sortedData);
            
            setCache(prevCache => ({
                ...prevCache,
                [keyword]: sortedData
            }));

            const historicalData = await fetchHistoricalData(keyword);
            console.log('API Response - Historical Data:', historicalData); // Added API response log
            setHistoricalData(historicalData);

        } catch (error) {
            console.error("Error fetching data:", error);
        }

        setLoading(false);
    };

    const renderTrendValue = (value) => (
        <>
            {value > 0 ? <ArrowUpwardIcon fontSize="small" /> : value < 0 ? <ArrowDownwardIcon fontSize="small" /> : null}
            {value.toFixed(2)}
        </>
    );

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Related Keywords Explorer
                </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
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
            
            {historicalData.length > 0 && (
                <HistoricalSearchVolumeGraph data={historicalData} />
            )}

            {data.length > 0 && (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Keyword</StyledTableCell>
                                <StyledTableCell>Search Volume</StyledTableCell>
                                <StyledTableCell>Relevancy Score</StyledTableCell>
                                <StyledTableCell>Monthly Trend</StyledTableCell>
                                <StyledTableCell>Quarterly Trend</StyledTableCell>
                                <StyledTableCell>Recommended Promotions</StyledTableCell>
                                <StyledTableCell>PPC Bid Broad</StyledTableCell>
                                <StyledTableCell>PPC Bid Exact</StyledTableCell>
                                <StyledTableCell>Organic Product Count</StyledTableCell>
                                <StyledTableCell>Sponsored Product Count</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.keyword}</TableCell>
                                    <TableCell>{item.search_volume}</TableCell>
                                    <TableCell>{item.relevancy_score}</TableCell>
                                    <TrendCell value={item.monthly_trend}>
                                        {renderTrendValue(item.monthly_trend)}
                                    </TrendCell>
                                    <TrendCell value={item.quarterly_trend}>
                                        {renderTrendValue(item.quarterly_trend)}
                                    </TrendCell>
                                    <TableCell>{item.recommended_promotions || '-'}</TableCell>
                                    <TableCell>{item.ppc_bid_broad || '-'}</TableCell>
                                    <TableCell>{item.ppc_bid_exact || '-'}</TableCell>
                                    <TableCell>{item.organic_product_count}</TableCell>
                                    <TableCell>{item.sponsored_product_count}</TableCell>
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


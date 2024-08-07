import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, Grid, Paper, Switch, 
  FormControlLabel, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TableSortLabel, Button, Collapse, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

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

const FeatureSegments = ({ data, onSegmentSelect, currentKeyword, segments, loading }) => {
    const [viewMode, setViewMode] = useState('table');
    const [orderBy, setOrderBy] = useState('totalRevenue');
    const [order, setOrder] = useState('desc');
    const [expandedSegment, setExpandedSegment] = useState(null);

    useEffect(() => {
        console.log("Received segments data:", JSON.stringify(segments, null, 2));
    }, [segments]);

    const sortedSegments = useMemo(() => {
        console.log("sortedSegments - Starting sorting");
        if (!segments || !Array.isArray(segments.segments)) {
            console.warn("sortedSegments - Invalid segments data:", segments);
            return [];
        }

        return [...segments.segments].sort((a, b) => {
            if (orderBy === 'products.length') {
                return order === 'asc' ? a.products.length - b.products.length : b.products.length - a.products.length;
            }
            if (b[orderBy] < a[orderBy]) {
                return order === 'asc' ? 1 : -1;
            }
            if (b[orderBy] > a[orderBy]) {
                return order === 'asc' ? -1 : 1;
            }
            return 0;
        });
    }, [segments, order, orderBy]);

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const formatPrice = (price) => {
        return price > 0 ? `$${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` : 'N/A';
    };

    const formatNumber = (number) => {
        return number > 0 ? number.toLocaleString() : '0';
    };

    const formatPercent = (percent) => {
        return percent > 0 ? `${percent.toFixed(2)}%` : '0.00%';
    };

    const handleExpandClick = (segmentName) => {
        setExpandedSegment(expandedSegment === segmentName ? null : segmentName);
    };

    const renderTableView = () => {
        if (sortedSegments.length === 0) {
            return <Typography>No segments data available</Typography>;
        }

        return (
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell />
                            <StyledTableCell>Segment</StyledTableCell>
                            <StyledTableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'products.length'}
                                    direction={orderBy === 'products.length' ? order : 'asc'}
                                    onClick={() => handleSort('products.length')}
                                >
                                    Products
                                </TableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'averagePrice'}
                                    direction={orderBy === 'averagePrice' ? order : 'asc'}
                                    onClick={() => handleSort('averagePrice')}
                                >
                                    Avg Price
                                </TableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'totalSales'}
                                    direction={orderBy === 'totalSales' ? order : 'asc'}
                                    onClick={() => handleSort('totalSales')}
                                >
                                    Total Sales
                                </TableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'percentOfTotalSales'}
                                    direction={orderBy === 'percentOfTotalSales' ? order : 'asc'}
                                    onClick={() => handleSort('percentOfTotalSales')}
                                >
                                    % of Total Sales
                                </TableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'totalRevenue'}
                                    direction={orderBy === 'totalRevenue' ? order : 'asc'}
                                    onClick={() => handleSort('totalRevenue')}
                                >
                                    Total Revenue
                                </TableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'percentOfTotalRevenue'}
                                    direction={orderBy === 'percentOfTotalRevenue' ? order : 'asc'}
                                    onClick={() => handleSort('percentOfTotalRevenue')}
                                >
                                    % of Total Revenue
                                </TableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                                <TableSortLabel
                                    active={orderBy === 'averageReviews'}
                                    direction={orderBy === 'averageReviews' ? order : 'asc'}
                                    onClick={() => handleSort('averageReviews')}
                                >
                                    Avg Reviews
                                </TableSortLabel>
                            </StyledTableCell>
                            <StyledTableCell align="center">Action</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedSegments.map((segment, index) => (
                            <React.Fragment key={index}>
                                <StyledTableRow hover>
                                    <TableCell>
                                        <IconButton
                                            aria-label="expand row"
                                            size="small"
                                            onClick={() => handleExpandClick(segment.name)}
                                        >
                                            {expandedSegment === segment.name ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell component="th" scope="row">{segment.name}</TableCell>
                                    <TableCell align="right">{formatNumber(segment.products.length)}</TableCell>
                                    <TableCell align="right">{formatPrice(segment.averagePrice)}</TableCell>
                                    <TableCell align="right">{formatNumber(segment.totalSales)}</TableCell>
                                    <TableCell align="right">{formatPercent(segment.percentOfTotalSales)}</TableCell>
                                    <TableCell align="right">{formatPrice(segment.totalRevenue)}</TableCell>
                                    <TableCell align="right">{formatPercent(segment.percentOfTotalRevenue)}</TableCell>
                                    <TableCell align="right">{formatNumber(segment.averageReviews)}</TableCell>
                                    <TableCell align="center">
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            onClick={() => onSegmentSelect(segment.products, segment.name)}
                                        >
                                            Select
                                        </Button>
                                    </TableCell>
                                </StyledTableRow>
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                                        <Collapse in={expandedSegment === segment.name} timeout="auto" unmountOnExit>
                                            <Box margin={1}>
                                                <Typography variant="h6" gutterBottom component="div">
                                                    Products
                                                </Typography>
                                                <Table size="small" aria-label="purchases">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Title</TableCell>
                                                            <TableCell align="right">Price</TableCell>
                                                            <TableCell align="right">Sales</TableCell>
                                                            <TableCell align="right">Revenue</TableCell>
                                                            <TableCell align="right">Reviews</TableCell>
                                                            <TableCell align="right">Rating</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {segment.products.map((product, productIndex) => (
                                                            <TableRow key={productIndex}>
                                                                <TableCell component="th" scope="row">
                                                                    <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
                                                                        {product.title}
                                                                    </a>
                                                                </TableCell>
                                                                <TableCell align="right">{formatPrice(product.price)}</TableCell>
                                                                <TableCell align="right">{formatNumber(product.sales)}</TableCell>
                                                                <TableCell align="right">{formatPrice(product.revenue)}</TableCell>
                                                                <TableCell align="right">{formatNumber(product.reviews)}</TableCell>
                                                                <TableCell align="right">{product.rating.toFixed(1)}</TableCell>
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
        );
    };

    const renderCardView = () => {
        if (sortedSegments.length === 0) {
            return <Typography>No segments data available</Typography>;
        }

        return (
            <Grid container spacing={2}>
                {sortedSegments.map((segment, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" gutterBottom>{segment.name}</Typography>
                            <Typography variant="body2">Products: {formatNumber(segment.products.length)}</Typography>
                            <Typography variant="body2">Avg Price: {formatPrice(segment.averagePrice)}</Typography>
                            <Typography variant="body2">Total Sales: {formatNumber(segment.totalSales)}</Typography>
                            <Typography variant="body2">% of Total Sales: {formatPercent(segment.percentOfTotalSales)}</Typography>
                            <Typography variant="body2">Total Revenue: {formatPrice(segment.totalRevenue)}</Typography>
                            <Typography variant="body2">% of Total Revenue: {formatPercent(segment.percentOfTotalRevenue)}</Typography>
                            <Typography variant="body2">Avg Reviews: {formatNumber(segment.averageReviews)}</Typography>
                            <Box mt={2}>
                                <Button 
                                    variant="contained" 
                                    size="small" 
                                    fullWidth
                                    onClick={() => onSegmentSelect(segment.products, segment.name)}
                                >
                                    Select
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        );
    };

    if (loading) return <CircularProgress />;
    if (!segments) return <Typography>No segments data received</Typography>;
    if (!Array.isArray(segments.segments)) return <Typography>Invalid segments data structure</Typography>;
    if (segments.segments.length === 0) return <Typography>No segments available</Typography>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {currentKeyword ? `Segments for "${currentKeyword}"` : 'Segments Summary'}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <FormControlLabel
                    control={<Switch checked={viewMode === 'cards'} onChange={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')} />}
                    label={viewMode === 'cards' ? "Card View" : "Table View"}
                />
            </Box>
            {viewMode === 'cards' ? renderCardView() : renderTableView()}
        </Box>
    );
};

export default FeatureSegments;
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, Grid, Paper, Switch, 
  FormControlLabel, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TableSortLabel, IconButton,
  Card, CardContent, CardMedia, Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { KeyboardArrowDown, KeyboardArrowUp, ArrowForward, Recycling } from '@mui/icons-material';

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

const MetricBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(0.5),
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.1rem',
}));

const MetricSubtext = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.8rem',
}));

const MetricGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const TitleBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const KeywordTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 'bold',
  fontSize: '1.5rem',
}));

const FeatureSegments = ({ data, onSegmentSelect, currentKeyword, segments, loading, onRecycleSegment}) => {
    const [viewMode, setViewMode] = useState('cards');
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
        }).map(segment => ({
            ...segment,
            topRevenueProduct: segment.products.reduce((max, product) => max.revenue > product.revenue ? max : product)
        }));
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
                            <StyledTableCell>Thumbnail</StyledTableCell>
                            <StyledTableCell style={{ width: '25%' }}>Segment</StyledTableCell>
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
                                    active={orderBy === 'totalRevenue'}
                                    direction={orderBy === 'totalRevenue' ? order : 'asc'}
                                    onClick={() => handleSort('totalRevenue')}
                                >
                                    Total Revenue
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
                            <StyledTableCell align="center">Actions</StyledTableCell>
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
                                    <TableCell>
                                        <img 
                                            src={segment.topRevenueProduct.imageUrl} 
                                            alt={segment.name} 
                                            style={{ width: 50, height: 50, objectFit: 'contain' }}
                                        />
                                    </TableCell>
                                    <TableCell component="th" scope="row" style={{ width: '25%' }}>{segment.name}</TableCell>
                                    <TableCell align="right">{formatNumber(segment.products.length)}</TableCell>
                                    <TableCell align="right">{formatPrice(segment.averagePrice)}</TableCell>
                                    <TableCell align="right">{formatNumber(segment.totalSales)}</TableCell>
                                    <TableCell align="right">{formatPrice(segment.totalRevenue)}</TableCell>
                                    <TableCell align="right">{formatNumber(segment.averageReviews)}</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => {/* Placeholder function */}}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            <Recycling />
                                        </IconButton>
                                        <IconButton
                                            color="primary"
                                            onClick={() => onSegmentSelect(segment.products, segment.name)}
                                            size="small"
                                        >
                                            <ArrowForward />
                                        </IconButton>
                                    </TableCell>
                                </StyledTableRow>
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                                        <Collapse in={expandedSegment === segment.name} timeout="auto" unmountOnExit>
                                            <Box margin={1}>
                                                <Typography variant="h6" gutterBottom component="div">
                                                    Products
                                                </Typography>
                                                <Table size="small" aria-label="purchases">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Image</TableCell>
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
                                                                <TableCell>
                                                                    <img 
                                                                        src={product.imageUrl} 
                                                                        alt={product.title} 
                                                                        style={{ width: 50, height: 50, objectFit: 'contain' }}
                                                                    />
                                                                </TableCell>
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

        const handleRecycleSegment = (segment) => {
            console.log("Recycling segment:", segment.name);
            onRecycleSegment(segment.products);
        };

        return (
            <Grid container spacing={2}>
                {sortedSegments.map((segment, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                                <CardMedia
                                    component="img"
                                    sx={{ width: 80, height: 80, marginRight: 2 }}
                                    image={segment.topRevenueProduct.imageUrl}
                                    alt={segment.name}
                                />
                                <Typography component="div" variant="h6">
                                    {segment.name}
                                </Typography>
                            </Box>
                            <CardContent>
                                <MetricGrid container spacing={2}>
                                    <Grid item xs={6}>
                                        <MetricBox>
                                            <MetricLabel variant="body2">Products</MetricLabel>
                                            <MetricValue>{formatNumber(segment.products.length)}</MetricValue>
                                            <MetricSubtext>{formatPercent(segment.percentOfTotalProducts)} of total</MetricSubtext>
                                        </MetricBox>
                                        <MetricBox>
                                            <MetricLabel variant="body2">Avg Price</MetricLabel>
                                            <MetricValue>{formatPrice(segment.averagePrice)}</MetricValue>
                                            <MetricSubtext>Range: {formatPrice(segment.minPrice)} - {formatPrice(segment.maxPrice)}</MetricSubtext>
                                        </MetricBox>
                                        <MetricBox>
                                            <MetricLabel variant="body2">Total Sales</MetricLabel>
                                            <MetricValue>{formatNumber(segment.totalSales)}</MetricValue>
                                            <MetricSubtext>{formatPercent(segment.percentOfTotalSales)} of total</MetricSubtext>
                                        </MetricBox>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <MetricBox>
                                            <MetricLabel variant="body2">Total Revenue</MetricLabel>
                                            <MetricValue>{formatPrice(segment.totalRevenue)}</MetricValue>
                                            <MetricSubtext>{formatPercent(segment.percentOfTotalRevenue)} of total</MetricSubtext>
                                        </MetricBox>
                                        <MetricBox>
                                            <MetricLabel variant="body2">Avg Reviews</MetricLabel>
                                            <MetricValue>{formatNumber(segment.averageReviews)}</MetricValue>
                                            <MetricSubtext>Range: {formatNumber(segment.minReviews)} - {formatNumber(segment.maxReviews)}</MetricSubtext>
                                        </MetricBox>
                                    </Grid>
                                </MetricGrid>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleRecycleSegment(segment)}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    >
                                        <Recycling />
                                    </IconButton>
                                    <IconButton
                                        color="primary"
                                        onClick={() => onSegmentSelect(segment.products, segment.name)}
                                        size="small"
                                    >
                                        <ArrowForward />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
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
            <TitleBox>
                <KeywordTitle>
                    Segments for "<span style={{ fontWeight: 'bold' }}>{currentKeyword}</span>"
                </KeywordTitle>
                <Typography variant="body2">
                    Total Results: {segments.segments.length} | Debug Info: Has segments: Yes
                </Typography>
                <FormControlLabel
                    control={
                        <Switch 
                            checked={viewMode === 'cards'} 
                            onChange={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')} 
                        />
                    }
                    label="Card View"
                />
            </TitleBox>
            {viewMode === 'cards' ? renderCardView() : renderTableView()}
        </Box>
    );
};

export default FeatureSegments;

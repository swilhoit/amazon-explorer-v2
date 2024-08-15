import React, { useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, TableSortLabel, Typography, Button, IconButton, Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatNumberWithCommas } from '../utils/dataProcessing';
import { Delete } from '@mui/icons-material';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    padding: '8px',
    '&.title-cell': {
        width: '200px',
        maxWidth: '200px',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:hover': {
        backgroundColor: theme.palette.action.selected,
    },
    '& > td': {
        height: '60px',
        maxHeight: '60px',
        overflow: 'hidden',
    },
}));

const TwoLineEllipsis = styled('div')({
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.2em',
    maxHeight: '2.4em',
    wordBreak: 'break-word',
});

const DataTable = ({
    data,
    summaryData,
    handleCheckboxChange,
    selectedForComparison,
    handleRequestSort,
    order,
    orderBy,
    handleCompare,
    handleDeleteRow
}) => {
    const sortedData = useMemo(() => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return [];
        }

        const comparator = (a, b) => {
            if (!a || !b) return 0;
            
            let aValue = a[orderBy];
            let bValue = b[orderBy];

            if (['price', 'reviews', 'sales', 'revenue', 'percentOfTotalSales', 'percentOfTotalRevenue'].includes(orderBy)) {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        };

        return [...data].sort(comparator);
    }, [data, order, orderBy]);

    const createSortHandler = (property) => () => {
        handleRequestSort(property);
    };

    if (!data || !Array.isArray(data) || data.length === 0) {
        return <Typography>No data available</Typography>;
    }

    const formatValue = (value, isPrice = false) => {
        if (value === undefined || value === null) return 'N/A';
        if (typeof value === 'number') {
            return isPrice 
                ? `$${formatNumberWithCommas(value.toFixed(2))}` 
                : formatNumberWithCommas(value);
        }
        return value.toString();
    };

    const SummaryTableCell = styled(StyledTableCell)(({ theme }) => ({
        fontWeight: 'bold',
      }));

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Select</StyledTableCell>
                        <StyledTableCell>Image</StyledTableCell>
                        <StyledTableCell className="title-cell">
                            <TableSortLabel
                                active={orderBy === 'title'}
                                direction={orderBy === 'title' ? order : 'asc'}
                                onClick={createSortHandler('title')}
                            >
                                Title
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'price'}
                                direction={orderBy === 'price' ? order : 'asc'}
                                onClick={createSortHandler('price')}
                            >
                                Price
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'reviews'}
                                direction={orderBy === 'reviews' ? order : 'asc'}
                                onClick={createSortHandler('reviews')}
                            >
                                Reviews
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'sales'}
                                direction={orderBy === 'sales' ? order : 'asc'}
                                onClick={createSortHandler('sales')}
                            >
                                Sales
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'percentOfTotalSales'}
                                direction={orderBy === 'percentOfTotalSales' ? order : 'asc'}
                                onClick={createSortHandler('percentOfTotalSales')}
                            >
                                % of Total Sales
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'revenue'}
                                direction={orderBy === 'revenue' ? order : 'asc'}
                                onClick={createSortHandler('revenue')}
                            >
                                Revenue
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'percentOfTotalRevenue'}
                                direction={orderBy === 'percentOfTotalRevenue' ? order : 'asc'}
                                onClick={createSortHandler('percentOfTotalRevenue')}
                            >
                                % of Total Revenue
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'brand'}
                                direction={orderBy === 'brand' ? order : 'asc'}
                                onClick={createSortHandler('brand')}
                            >
                                Brand
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'asin'}
                                direction={orderBy === 'asin' ? order : 'asc'}
                                onClick={createSortHandler('asin')}
                            >
                                ASIN
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                    </TableHead>
                <TableBody>
                {summaryData && (
  <StyledTableRow>
    <SummaryTableCell>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleCompare} 
        disabled={selectedForComparison.length === 0}
        size="small"
      >
        Compare
      </Button>
    </SummaryTableCell>
    <SummaryTableCell></SummaryTableCell>
    <SummaryTableCell></SummaryTableCell>
    <SummaryTableCell>{formatValue(summaryData.price, true)}</SummaryTableCell>
    <SummaryTableCell>{formatValue(summaryData.reviews)}</SummaryTableCell>
    <SummaryTableCell>{formatValue(summaryData.sales)}</SummaryTableCell>
    <SummaryTableCell></SummaryTableCell>
    <SummaryTableCell>{formatValue(summaryData.revenue, true)}</SummaryTableCell>
    <SummaryTableCell></SummaryTableCell>
    <SummaryTableCell></SummaryTableCell>
    <SummaryTableCell></SummaryTableCell>
    <SummaryTableCell></SummaryTableCell>
  </StyledTableRow>
)}
                    {sortedData.filter(product => product.asin !== 'Summary').map((product, index) => (
                        <StyledTableRow key={product.asin || index}>
                            <StyledTableCell>
                                <Checkbox
                                    checked={selectedForComparison.includes(product.asin)}
                                    onChange={() => handleCheckboxChange(product.asin)}
                                />
                            </StyledTableCell>
                            <StyledTableCell>
                                {product.imageUrl && (
                                    <Link href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={product.imageUrl} alt={product.title} style={{ width: 50, height: 50 }} />
                                    </Link>
                                )}
                            </StyledTableCell>
                            <StyledTableCell className="title-cell">
                                <Link href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
                                    <TwoLineEllipsis title={product.title || 'N/A'}>
                                        {product.title || 'N/A'}
                                    </TwoLineEllipsis>
                                </Link>
                            </StyledTableCell>
                            <StyledTableCell>{formatValue(product.price, true)}</StyledTableCell>
                            <StyledTableCell>{formatValue(product.reviews)}</StyledTableCell>
                            <StyledTableCell>{formatValue(product.sales)}</StyledTableCell>
                            <StyledTableCell>{product.percentOfTotalSales ? `${parseFloat(product.percentOfTotalSales).toFixed(2)}%` : 'N/A'}</StyledTableCell>
                            <StyledTableCell>{formatValue(product.revenue, true)}</StyledTableCell>
                            <StyledTableCell>{product.percentOfTotalRevenue ? `${parseFloat(product.percentOfTotalRevenue).toFixed(2)}%` : 'N/A'}</StyledTableCell>
                            <StyledTableCell>{product.brand || 'N/A'}</StyledTableCell>
                            <StyledTableCell>{product.asin || 'N/A'}</StyledTableCell>
                            <StyledTableCell>
                                <IconButton 
                                    size="small" 
                                    onClick={() => handleDeleteRow(product.asin)}
                                    aria-label={`Delete ${product.title}`}
                                >
                                    <Delete />
                                </IconButton>
                            </StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DataTable;

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import '../styles/DataTable.css';

const DataTable = ({ data, priceSegments, summaryData }) => {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('');

    const theme = useTheme();

    const styles = {
        tableHeader: {
            position: 'sticky',
            top: 0,
            backgroundColor: theme.palette.background.default,
            zIndex: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        summaryRow: {
            backgroundColor: '#ffff99',
            fontWeight: 'bold',
            position: 'sticky',
            top: 50,
            zIndex: 1,
            color: '#000',
        },
        imageCell: {
            position: 'relative',
        },
        titleCell: {
            maxWidth: 200,
            whiteSpace: 'normal',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
        },
        brandCell: {
            maxWidth: 100,
        },
        tableContainer: {
            borderRadius: '10px',
            backgroundColor: theme.palette.background.paper,
        },
        image: {
            width: 50,
            height: 50,
            objectFit: 'cover',
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedData = [...data].sort((a, b) => {
        if (orderBy) {
            if (order === 'asc') {
                return a[orderBy] < b[orderBy] ? -1 : 1;
            }
            return a[orderBy] > b[orderBy] ? -1 : 1;
        }
        return 0;
    });

    if (!data.length) {
        console.log('No data to display');
        return null;
    }

    console.log('Displaying data:', data);

    const formatCurrency = (value) => `$${parseFloat(value).toFixed(2)}`.toString();

    return (
        <TableContainer component={Paper} style={styles.tableContainer}>
            <Table>
                <TableHead>
                    <TableRow style={styles.tableHeader}>
                        {!priceSegments && <TableCell>Image</TableCell>}
                        {!priceSegments && <TableCell>ASIN</TableCell>}
                        {!priceSegments && <TableCell>Title</TableCell>}
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'price'}
                                direction={orderBy === 'price' ? order : 'asc'}
                                onClick={() => handleRequestSort('price')}
                            >
                                {priceSegments ? "Price Range" : "Price"}
                            </TableSortLabel>
                        </TableCell>
                        {priceSegments && <TableCell>Product Count</TableCell>}
                        {!priceSegments && <TableCell style={styles.brandCell}>Brand</TableCell>}
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'sales'}
                                direction={orderBy === 'sales' ? order : 'asc'}
                                onClick={() => handleRequestSort('sales')}
                            >
                                Sales
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'percentOfTotalSales'}
                                direction={orderBy === 'percentOfTotalSales' ? order : 'asc'}
                                onClick={() => handleRequestSort('percentOfTotalSales')}
                            >
                                % of Total Sales
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'revenue'}
                                direction={orderBy === 'revenue' ? order : 'asc'}
                                onClick={() => handleRequestSort('revenue')}
                            >
                                Revenue
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'percentOfTotalRevenue'}
                                direction={orderBy === 'percentOfTotalRevenue' ? order : 'asc'}
                                onClick={() => handleRequestSort('percentOfTotalRevenue')}
                            >
                                % of Total Revenue
                            </TableSortLabel>
                        </TableCell>
                        {!priceSegments && <TableCell>Seller Type</TableCell>}
                        {!priceSegments && <TableCell>Date First Available</TableCell>}
                        {!priceSegments && <TableCell>Category</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow key="summary" style={styles.summaryRow}>
                        {!priceSegments && <TableCell />}
                        {!priceSegments && <TableCell className="table-cell">{summaryData.asin}</TableCell>}
                        {!priceSegments && <TableCell className="table-cell"></TableCell>}
                        <TableCell className="table-cell">{priceSegments ? summaryData.title : formatCurrency(summaryData.price)}</TableCell>
                        {priceSegments && <TableCell className="table-cell">{summaryData.count}</TableCell>}
                        {!priceSegments && <TableCell className="table-cell" style={styles.brandCell}>{summaryData.brand}</TableCell>}
                        <TableCell className="table-cell">{summaryData.sales}</TableCell>
                        <TableCell className="table-cell">{summaryData.percentOfTotalSales}</TableCell>
                        <TableCell className="table-cell">{formatCurrency(summaryData.revenue)}</TableCell>
                        <TableCell className="table-cell">{summaryData.percentOfTotalRevenue}</TableCell>
                        {!priceSegments && <TableCell className="table-cell">{summaryData.sellerType}</TableCell>}
                        {!priceSegments && <TableCell className="table-cell">{summaryData.dateFirstAvailable}</TableCell>}
                        {!priceSegments && <TableCell className="table-cell">{summaryData.category}</TableCell>}
                    </TableRow>
                    {sortedData.slice(1).map((row, index) => (
                        <TableRow key={index}>
                            {!priceSegments && (
                                <TableCell style={styles.imageCell}>
                                    <a href={row.amazonUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={row.imageUrl} alt={row.title} style={styles.image} />
                                    </a>
                                </TableCell>
                            )}
                            {!priceSegments && <TableCell className="table-cell">{row.asin}</TableCell>}
                            {!priceSegments && <TableCell className="table-cell" style={styles.titleCell}>{row.title}</TableCell>}
                            <TableCell className="table-cell">{priceSegments ? row.title : formatCurrency(row.price)}</TableCell>
                            {priceSegments && <TableCell className="table-cell">{row.productCount}</TableCell>}
                            {!priceSegments && <TableCell className="table-cell" style={styles.brandCell}>{row.brand}</TableCell>}
                            <TableCell className="table-cell">{row.sales}</TableCell>
                            <TableCell className="table-cell">{row.percentOfTotalSales}</TableCell>
                            <TableCell className="table-cell">{formatCurrency(row.revenue)}</TableCell>
                            <TableCell className="table-cell">{row.percentOfTotalRevenue}</TableCell>
                            {!priceSegments && <TableCell className="table-cell">{row.sellerType}</TableCell>}
                            {!priceSegments && <TableCell className="table-cell">{row.dateFirstAvailable}</TableCell>}
                            {!priceSegments && <TableCell className="table-cell">{row.category}</TableCell>}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DataTable;

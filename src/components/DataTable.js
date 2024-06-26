import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Tooltip, Pagination, Checkbox, TableSortLabel, Link,
    Typography
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const TitleCell = styled(TableCell)({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '300px',
    '&:hover': {
        overflow: 'visible',
        whiteSpace: 'normal',
        backgroundColor: '#fff',
        zIndex: 1000,
        position: 'relative',
    },
});

const StyledTableCell = styled(TableCell)({
    backgroundColor: '#e0e0e0',
    fontWeight: 'bold',
});

const DataTable = ({
    data,
    summaryData,
    resultsCount,
    queriedKeywords,
    setData,
    updateSummary,
    handleDeleteRow,
    updateResultsCount,
    handleCheckboxChange,
    selectedForComparison,
    handleRequestSort,
    order,
    orderBy
}) => {
    const [page, setPage] = useState(1);
    const rowsPerPage = 25;

    useEffect(() => {
        console.log("DataTable: Received data", data?.length, "items");
        console.log("DataTable: First few items:", data?.slice(0, 3));
        console.log("DataTable: Summary data", summaryData);
    }, [data, summaryData]);

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const paginatedData = data ? data.slice((page - 1) * rowsPerPage, page * rowsPerPage) : [];

    const createSortHandler = (property) => (event) => {
        handleRequestSort(property);
    };

    if (!data || data.length === 0) {
        return (
            <TableContainer component={Paper}>
                <Typography variant="h6" align="center" style={{ padding: '20px' }}>
                    No data available. Please upload a CSV file or fetch data.
                </Typography>
            </TableContainer>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Checkbox'}
                                direction={orderBy === 'Checkbox' ? order : 'asc'}
                                onClick={createSortHandler('Checkbox')}
                            >
                                Checkbox
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Image'}
                                direction={orderBy === 'Image' ? order : 'asc'}
                                onClick={createSortHandler('Image')}
                            >
                                Image
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'ASIN'}
                                direction={orderBy === 'ASIN' ? order : 'asc'}
                                onClick={createSortHandler('ASIN')}
                            >
                                ASIN
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Title'}
                                direction={orderBy === 'Title' ? order : 'asc'}
                                onClick={createSortHandler('Title')}
                            >
                                Title
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Brand'}
                                direction={orderBy === 'Brand' ? order : 'asc'}
                                onClick={createSortHandler('Brand')}
                            >
                                Brand
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Price'}
                                direction={orderBy === 'Price' ? order : 'asc'}
                                onClick={createSortHandler('Price')}
                            >
                                Price
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Reviews'}
                                direction={orderBy === 'Reviews' ? order : 'asc'}
                                onClick={createSortHandler('Reviews')}
                            >
                                Reviews
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Rating'}
                                direction={orderBy === 'Rating' ? order : 'asc'}
                                onClick={createSortHandler('Rating')}
                            >
                                Rating
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Sales'}
                                direction={orderBy === 'Sales' ? order : 'asc'}
                                onClick={createSortHandler('Sales')}
                            >
                                Sales
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Percent of Total Sales'}
                                direction={orderBy === 'Percent of Total Sales' ? order : 'asc'}
                                onClick={createSortHandler('Percent of Total Sales')}
                            >
                                Percent of Total Sales
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Revenue'}
                                direction={orderBy === 'Revenue' ? order : 'asc'}
                                onClick={createSortHandler('Revenue')}
                            >
                                Revenue
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Percent of Total Revenue'}
                                direction={orderBy === 'Percent of Total Revenue' ? order : 'asc'}
                                onClick={createSortHandler('Percent of Total Revenue')}
                            >
                                Percent of Total Revenue
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Seller Type'}
                                direction={orderBy === 'Seller Type' ? order : 'asc'}
                                onClick={createSortHandler('Seller Type')}
                            >
                                Seller Type
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Date First Available'}
                                direction={orderBy === 'Date First Available' ? order : 'asc'}
                                onClick={createSortHandler('Date First Available')}
                            >
                                Date First Available
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Category'}
                                direction={orderBy === 'Category' ? order : 'asc'}
                                onClick={createSortHandler('Category')}
                            >
                                Category
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel
                                active={orderBy === 'Actions'}
                                direction={orderBy === 'Actions' ? order : 'asc'}
                                onClick={createSortHandler('Actions')}
                            >
                                Actions
                            </TableSortLabel>
                        </StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedData.map((row, index) => (
                        <TableRow key={row.asin || index}>
                            <TableCell>
                                <Checkbox
                                    checked={selectedForComparison.includes(row.asin)}
                                    onChange={() => handleCheckboxChange(row.asin)}
                                />
                            </TableCell>
                            <TableCell>
                                {row.imageUrl && (
                                    <Link href={row.amazonUrl} target="_blank" rel="noopener noreferrer">
                                        <img src={row.imageUrl} alt={row.title} style={{ width: 50, height: 50 }} />
                                    </Link>
                                )}
                            </TableCell>
                            <TableCell>{row.asin}</TableCell>
                            <Tooltip title={row.title} placement="top">
                                <TitleCell>{row.title}</TitleCell>
                            </Tooltip>
                            <TableCell>{row.brand}</TableCell>
                            <TableCell>{row.price}</TableCell>
                            <TableCell>{row.reviews}</TableCell>
                            <TableCell>{row.rating}</TableCell>
                            <TableCell>{row.sales}</TableCell>
                            <TableCell>{row.percentOfTotalSales}</TableCell>
                            <TableCell>{row.revenue}</TableCell>
                            <TableCell>{row.percentOfTotalRevenue}</TableCell>
                            <TableCell>{row.sellerType}</TableCell>
                            <TableCell>{row.dateFirstAvailable}</TableCell>
                            <TableCell>{row.category}</TableCell>
                            <TableCell>
                                <IconButton size="small" onClick={() => handleDeleteRow(row.asin)}>
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination
                count={Math.ceil((data?.length || 0) / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{ marginTop: 2, marginBottom: 2 }}
            />
        </TableContainer>
    );
};

export default DataTable;
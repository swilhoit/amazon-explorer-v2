import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import Collapse from '@mui/material/Collapse';

const BigBoldTableCell = styled(TableCell)({
    fontWeight: 'bold',
    fontSize: '1.2em',
    textAlign: 'center',
});

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

const DataTable = ({ data, summaryData, resultsCount, queriedKeywords, setData, updateSummary, handleDeleteRow }) => {
    const [expandedSegments, setExpandedSegments] = useState({});

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Image</StyledTableCell>
                        <StyledTableCell>ASIN</StyledTableCell>
                        <StyledTableCell>Title</StyledTableCell>
                        <StyledTableCell>Brand</StyledTableCell>
                        <StyledTableCell>Price</StyledTableCell>
                        <StyledTableCell>Reviews</StyledTableCell>
                        <StyledTableCell>Rating</StyledTableCell>
                        <StyledTableCell>Sales</StyledTableCell>
                        <StyledTableCell>Percent of Total Sales</StyledTableCell>
                        <StyledTableCell>Revenue</StyledTableCell>
                        <StyledTableCell>Percent of Total Revenue</StyledTableCell>
                        <StyledTableCell>Seller Type</StyledTableCell>
                        <StyledTableCell>Date First Available</StyledTableCell>
                        <StyledTableCell>Category</StyledTableCell>
                        <StyledTableCell>Actions</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => (
                        <React.Fragment key={index}>
                            {row.asin === "Summary" ? (
                                <TableRow>
                                    <StyledTableCell></StyledTableCell>
                                    <StyledTableCell></StyledTableCell>
                                    <StyledTableCell>{row.asin}</StyledTableCell>
                                    <StyledTableCell></StyledTableCell>
                                    <StyledTableCell>{row.price}</StyledTableCell>
                                    <StyledTableCell>{row.reviews}</StyledTableCell>
                                    <StyledTableCell></StyledTableCell>
                                    <StyledTableCell>{row.sales}</StyledTableCell>
                                    <StyledTableCell>{row.percentOfTotalSales}</StyledTableCell>
                                    <StyledTableCell>{row.revenue}</StyledTableCell>
                                    <StyledTableCell>{row.percentOfTotalRevenue}</StyledTableCell>
                                    <StyledTableCell></StyledTableCell>
                                    <StyledTableCell></StyledTableCell>
                                    <StyledTableCell></StyledTableCell>
                                    <StyledTableCell></StyledTableCell>
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableCell>
                                        <Link to={row.amazonUrl} target="_blank">
                                            <img src={row.imageUrl} alt={row.title} style={{ width: 50 }} />
                                        </Link>
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
                            )}
                            {row.items && (
                                <TableRow>
                                    <TableCell colSpan={15} style={{ padding: 0, border: 0 }}>
                                        <Collapse in={expandedSegments[row.asin]} timeout="auto" unmountOnExit>
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
                                                    {row.items.map((item, itemIndex) => (
                                                        <TableRow key={itemIndex} style={{ backgroundColor: '#f9f9f9' }}>
                                                            <TableCell>
                                                                <Link to={item.amazonUrl} target="_blank">
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
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default DataTable;

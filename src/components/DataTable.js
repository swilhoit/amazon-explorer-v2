import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, IconButton, TableSortLabel } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { formatNumberWithCommas } from '../utils/dataProcessing';

const DataTable = ({
  data,
  handleDeleteRow,
  handleCheckboxChange,
  selectedForComparison,
  handleRequestSort,
  order,
  orderBy
}) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Select</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'title'}
                direction={orderBy === 'title' ? order : 'asc'}
                onClick={() => handleRequestSort('title')}
              >
                Title
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'price'}
                direction={orderBy === 'price' ? order : 'asc'}
                onClick={() => handleRequestSort('price')}
              >
                Price
              </TableSortLabel>
            </TableCell>
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
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((product, index) => (
            <TableRow key={index}>
              <TableCell>
                <Checkbox
                  checked={selectedForComparison.includes(product.asin)}
                  onChange={() => handleCheckboxChange(product.asin)}
                />
              </TableCell>
              <TableCell>
                <img src={product.imageUrl} alt={product.title} style={{ width: 50, height: 50 }} />
              </TableCell>
              <TableCell>{product.title}</TableCell>
              <TableCell>{product.price ? `$${formatNumberWithCommas(product.price)}` : 'N/A'}</TableCell>
              <TableCell>{product.sales ? formatNumberWithCommas(product.sales) : 'N/A'}</TableCell>
              <TableCell>{product.percentOfTotalSales ? `${product.percentOfTotalSales}%` : 'N/A'}</TableCell>
              <TableCell>{product.revenue ? `$${formatNumberWithCommas(product.revenue)}` : 'N/A'}</TableCell>
              <TableCell>{product.percentOfTotalRevenue ? `${product.percentOfTotalRevenue}%` : 'N/A'}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDeleteRow(product.asin)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
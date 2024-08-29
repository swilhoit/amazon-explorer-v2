import React, { useState } from "react";
import TableSortLabel from "./TableSortLabel";
import ArrowForward from "../assets/icons/ArrowForward";
import Recycling from "../assets/icons/Recycling";
import ArrowUp from "../assets/icons/ArrowUp";
import AnimateHeight from 'react-animate-height';

const FeatureSegmentTable = ({ sortedSegments, orderBy, order, setOrderBy, setOrder, onSegmentSelect }) => {
    const [expandedSegment, setExpandedSegment] = useState(null);

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

    const handleExpandClick = (segmentName) => {
        setExpandedSegment(expandedSegment === segmentName ? null : segmentName);
    };

    if (sortedSegments.length === 0) {
        return <p>No segments data available</p>;
    }

    return (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-sm ">
            <table className="table-auto w-full dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-700/60">
                <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700/60">
                    <tr>
                        <th />
                        <th className="px-2 py-3 whitespace-nowrap">Thumbnail</th>
                        <th className="px-2 py-3 whitespace-nowrap" style={{ width: '25%' }}>Segment</th>

                        <th className="px-2 py-3 whitespace-nowrap">
                            <TableSortLabel
                                active={orderBy === 'products.length'}
                                direction={orderBy === 'products.length' ? order : 'asc'}
                                onClick={() => handleSort('products.length')}
                            >
                                Products
                            </TableSortLabel>
                        </th>
                        <th className="px-2 py-3 whitespace-nowrap" align="right">
                            <TableSortLabel
                                active={orderBy === 'averagePrice'}
                                direction={orderBy === 'averagePrice' ? order : 'asc'}
                                onClick={() => handleSort('averagePrice')}
                            >
                                Avg Price
                            </TableSortLabel>
                        </th>
                        <th className="px-2 py-3 whitespace-nowrap" align="right">
                            <TableSortLabel
                                active={orderBy === 'totalSales'}
                                direction={orderBy === 'totalSales' ? order : 'asc'}
                                onClick={() => handleSort('totalSales')}
                            >
                                Total Sales
                            </TableSortLabel>
                        </th>
                        <th className="px-2 py-3 whitespace-nowrap" align="right">
                            <TableSortLabel
                                active={orderBy === 'totalRevenue'}
                                direction={orderBy === 'totalRevenue' ? order : 'asc'}
                                onClick={() => handleSort('totalRevenue')}
                            >
                                Total Revenue
                            </TableSortLabel>
                        </th>
                        <th className="px-2 py-3 whitespace-nowrap" align="right">
                            <TableSortLabel
                                active={orderBy === 'averageReviews'}
                                direction={orderBy === 'averageReviews' ? order : 'asc'}
                                onClick={() => handleSort('averageReviews')}
                            >
                                Avg Reviews
                            </TableSortLabel>
                        </th>
                        <th className="px-2 py-3 whitespace-nowrap" align="center">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {sortedSegments.map((segment, index) => (
                        <React.Fragment key={index}>
                            <tr>
                                <td className="px-2 pl-5 py-3 whitespace-nowrap">
                                    <button
                                        className="w-8 h-8 flex items-center justify-center text-violet-500 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all"
                                        onClick={() => handleExpandClick(segment.name)}
                                    >
                                        <ArrowUp className={`${expandedSegment === segment.name ? '' : 'rotate-180'} transition-all`} />
                                    </button>
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap">
                                    <img
                                        src={segment.topRevenueProduct.imageUrl}
                                        alt={segment.name}
                                        style={{ width: 50, height: 50, objectFit: 'contain' }}
                                    />
                                </td>
                                <td className="px-2 py-3">{segment.name}</td>
                                <td className="px-2 py-3 whitespace-nowrap">{formatNumber(segment.products.length)}</td>
                                <td className="px-2 py-3 whitespace-nowrap">{formatPrice(segment.averagePrice)}</td>
                                <td className="px-2 py-3 whitespace-nowrap">{formatNumber(segment.totalSales)}</td>
                                <td className="px-2 py-3 whitespace-nowrap">{formatPrice(segment.totalRevenue)}</td>
                                <td className="px-2 py-3 whitespace-nowrap">{formatNumber(segment.averageReviews)}</td>
                                <td className="px-2 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="w-8 h-8 flex items-center justify-center text-violet-500 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all"
                                            onClick={() => {/* Placeholder function */}}
                                        >
                                            <Recycling />
                                        </button>
                                        <button
                                            className="w-8 h-8 flex items-center justify-center text-violet-500 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all"
                                            onClick={() => onSegmentSelect(segment.products, segment.name)}
                                        >
                                            <ArrowForward />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-transparent">
                                <td colSpan={9}>
                                    <AnimateHeight
                                        duration={600}
                                        height={expandedSegment === segment.name ? 'auto' : 0}
                                    >
                                        <div className="m-2">
                                            <h6 className="text-xl font-medium mb-2">
                                                Products
                                            </h6>
                                            <table className="table-auto w-full dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-700/60">
                                                <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700/60">
                                                    <tr>
                                                        <td className="px-2 py-3 whitespace-nowrap">Image</td>
                                                        <td className="px-2 py-3 whitespace-nowrap">Title</td>
                                                        <td className="px-2 py-3 whitespace-nowrap">Price</td>
                                                        <td className="px-2 py-3 whitespace-nowrap">Sales</td>
                                                        <td className="px-2 py-3 whitespace-nowrap">Revenue</td>
                                                        <td className="px-2 py-3 whitespace-nowrap">Reviews</td>
                                                        <td className="px-2 py-3 whitespace-nowrap">Rating</td>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {segment.products.map((product, productIndex) => (
                                                        <tr key={productIndex}>
                                                            <td>
                                                                <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
                                                                    <img
                                                                        src={product.imageUrl}
                                                                        alt={product.title}
                                                                        style={{ width: 50, height: 50, objectFit: 'contain' }}
                                                                    />
                                                                </a>
                                                            </td>
                                                            <td className="w-[400px]">
                                                                <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
                                                                    <div className="line-clamp-2 text-ellipsis break-words w-[400px]" title={product.title || 'N/A'}>
                                                                        {product.title || 'N/A'}...
                                                                    </div>
                                                                </a>
                                                            </td>
                                                            <td>{formatPrice(product.price)}</td>
                                                            <td>{formatNumber(product.sales)}</td>
                                                            <td >{formatPrice(product.revenue)}</td>
                                                            <td>{formatNumber(product.reviews)}</td>
                                                            <td>{product.rating.toFixed(1)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </AnimateHeight>
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default FeatureSegmentTable;
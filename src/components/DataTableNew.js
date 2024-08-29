import React, { useMemo } from 'react';
import { formatNumberWithCommas } from '../utils/dataProcessing';
import TableSortLabel from "./TableSortLabel";

const DataTableNew = ({
                       data,
                       summaryData,
                       handleCheckboxChange,
                       handleSelectAll,
                       selectedForComparison,
                       handleRequestSort,
                       order,
                       orderBy,
                       handleCompare,
                       handleDeleteRow,
                       resultsCount
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
        return <div>No data available</div>;
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

    return (
        <div>
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl relative">
                <header className="px-5 py-4 flex justify-between">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">Total Results <span className="text-gray-400 dark:text-gray-500 font-medium">{resultsCount}</span></h2>
                    <div className="flex items-center gap-2">
                        {!!selectedForComparison.length && (
                            <div className="hidden xl:block text-sm italic mr-2 whitespace-nowrap"><span>{selectedForComparison.length}</span> items selected</div>
                        )}
                        <button
                            className="btn border-gray-200 dark:border-gray-700/60 shadow-sm text-violet-500 disabled:opacity-50"
                            onClick={handleCompare}
                            disabled={selectedForComparison.length === 0}
                        >
                            Compare
                        </button>
                    </div>
                </header>
                <div>
                    <div className="overflow-x-auto">
                        <table className="table-auto w-full dark:text-gray-300 divide-y divide-gray-100 dark:divide-gray-700/60">
                            <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-700/60">
                                <tr>
                                    <th className="px-2 pl-5 py-3 whitespace-nowrap w-px">
                                        <div className="flex items-center">
                                        <label className="inline-flex">
                                            <span className="sr-only">Select all</span>
                                            <input className="form-checkbox" type="checkbox" checked={(data.length - 1) === selectedForComparison.length} onChange={handleSelectAll} />
                                        </label>
                                        </div>
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                        Image
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                        <TableSortLabel
                                            active={orderBy === 'title'}
                                            direction={orderBy === 'title' ? order : 'asc'}
                                            onClick={createSortHandler('title')}
                                        >
                                            <div className="">Title</div>
                                        </TableSortLabel>
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                        <TableSortLabel
                                            active={orderBy === 'price'}
                                            direction={orderBy === 'price' ? order : 'asc'}
                                            onClick={createSortHandler('price')}
                                        >
                                            Price
                                        </TableSortLabel>
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                        <TableSortLabel
                                            active={orderBy === 'reviews'}
                                            direction={orderBy === 'reviews' ? order : 'asc'}
                                            onClick={createSortHandler('reviews')}
                                        >
                                            Reviews
                                        </TableSortLabel>
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                        <TableSortLabel
                                            active={orderBy === 'sales'}
                                            direction={orderBy === 'sales' ? order : 'asc'}
                                            onClick={createSortHandler('sales')}
                                        >
                                            Sales
                                        </TableSortLabel>
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                        <TableSortLabel
                                            active={orderBy === 'percentOfTotalSales'}
                                            direction={orderBy === 'percentOfTotalSales' ? order : 'asc'}
                                            onClick={createSortHandler('percentOfTotalSales')}
                                        >
                                            % of Sales
                                        </TableSortLabel>
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                        <TableSortLabel
                                            active={orderBy === 'revenue'}
                                            direction={orderBy === 'revenue' ? order : 'asc'}
                                            onClick={createSortHandler('revenue')}
                                        >
                                            Revenue
                                        </TableSortLabel>
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                        <TableSortLabel
                                            active={orderBy === 'percentOfTotalRevenue'}
                                            direction={orderBy === 'percentOfTotalRevenue' ? order : 'asc'}
                                            onClick={createSortHandler('percentOfTotalRevenue')}
                                        >
                                            % of Revenue
                                        </TableSortLabel>
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                        <TableSortLabel
                                            active={orderBy === 'brand'}
                                            direction={orderBy === 'brand' ? order : 'asc'}
                                            onClick={createSortHandler('brand')}
                                        >
                                            Brand
                                        </TableSortLabel>
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                        <TableSortLabel
                                            active={orderBy === 'asin'}
                                            direction={orderBy === 'asin' ? order : 'asc'}
                                            onClick={createSortHandler('asin')}
                                        >
                                            ASIN
                                        </TableSortLabel>
                                    </th>
                                    <th className="px-2 py-3 whitespace-nowrap">
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                            {summaryData && (
                                <tr>
                                    <td className="px-2 py-3 whitespace-nowrap w-px">

                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap"></td>
                                    <td className="px-2 py-3 whitespace-nowrap"></td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="text-gray-800 dark:text-gray-100 font-bold">{formatValue(summaryData.price, true)}</div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="text-gray-800 dark:text-gray-100 font-bold">{formatValue(summaryData.reviews)}</div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="text-gray-800 dark:text-gray-100 font-bold">{formatValue(summaryData.sales)}</div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap"></td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="text-gray-800 dark:text-gray-100 font-bold">{formatValue(summaryData.revenue, true)}</div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap"></td>
                                    <td className="px-2 py-3 whitespace-nowrap"></td>
                                    <td className="px-2 py-3 whitespace-nowrap"></td>
                                    <td className="px-2 py-3 whitespace-nowrap"></td>
                                </tr>
                            )}
                            {sortedData.filter(product => product.asin !== 'Summary').map((product, index) => (
                                <tr key={product.asin || index}>
                                    <td className="px-2 pl-5 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <label className="inline-flex">
                                                <span className="sr-only">Select</span>
                                                <input id={index} className="form-checkbox" type="checkbox" onChange={() => handleCheckboxChange(product.asin)} checked={selectedForComparison.includes(product.asin)} />
                                            </label>
                                        </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        {product.imageUrl && (
                                            <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={product.imageUrl} alt={product.title} style={{ width: 50, height: 50 }} />
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-2 py-3">
                                        <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400">
                                            <div className="line-clamp-2 text-ellipsis break-words w-[70px]" title={product.title || 'N/A'}>
                                                {product.title || 'N/A'}...
                                            </div>
                                        </a>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-800 dark:text-gray-100">{formatValue(product.price, true)}</div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-800 dark:text-gray-100">{formatValue(product.reviews)}</div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-800 dark:text-gray-100">{formatValue(product.sales)}</div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-800 dark:text-gray-100">{product.percentOfTotalSales ? `${parseFloat(product.percentOfTotalSales).toFixed(2)}%` : 'N/A'}</div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-800 dark:text-gray-100">{formatValue(product.revenue, true)}</div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-800 dark:text-gray-100">{product.percentOfTotalRevenue ? `${parseFloat(product.percentOfTotalRevenue).toFixed(2)}%` : 'N/A'}</div>
                                    </td>
                                    <td className="px-2 py-3">
                                        <div className="font-medium text-gray-800 dark:text-gray-100">{product.brand || 'N/A'}</div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="font-medium text-gray-800 dark:text-gray-100">{product.asin || 'N/A'}</div>
                                    </td>
                                    <td className="px-2 pr-3 py-3 whitespace-nowrap">
                                        <button
                                            className="text-red-500 hover:text-red-600 rounded-full !p-0 !bg-none mt-2"
                                            onClick={() => handleDeleteRow(product.asin)}
                                            aria-label={`Delete ${product.title}`}
                                        >
                                            <span className="sr-only">Delete</span>
                                            <svg className="w-8 h-8 fill-current" viewBox="0 0 32 32">
                                                <path d="M13 15h2v6h-2zM17 15h2v6h-2z" />
                                                <path d="M20 9c0-.6-.4-1-1-1h-6c-.6 0-1 .4-1 1v2H8v2h1v10c0 .6.4 1 1 1h12c.6 0 1-.4 1-1V13h1v-2h-4V9zm-6 1h4v1h-4v-1zm7 3v9H11v-9h10z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataTableNew;

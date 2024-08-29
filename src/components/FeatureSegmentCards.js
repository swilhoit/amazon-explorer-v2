import React from 'react';
import {IconButton, Typography} from "@mui/material";
import {ArrowForward, Recycling} from "@mui/icons-material";
import {formatNumber, formatPercent, formatPrice} from "../utils/helpers";

const FeatureSegmentCards = ({sortedSegments, onSegmentSelect, onRecycleSegment}) => {

    const handleRecycleSegment = (segment) => {
        console.log("Recycling segment:", segment.name);
        onRecycleSegment(segment.products);
    };

    if (sortedSegments.length === 0) {
        return <Typography>No segments data available</Typography>;
    }

    return (
        <div className="flex gap-[16px] flex-wrap mt-4">
            {sortedSegments.map((segment, index) => (
                <div key={index} className="col-span-full sm:col-span-6 xl:col-span-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 shadow-sm rounded-lg overflow-hidden w-full max-w-[356px]">
                    <div className="flex flex-col h-full p-4 gap-4">
                        <div className="flex items-center gap-[16px] h-[80px]">
                            <img
                                className="w-[80px]"
                                src={segment.topRevenueProduct.imageUrl}
                                width="80px"
                                height="80px"
                                alt={segment.name}
                            />
                            <h3 className="text-xl text-gray-800 dark:text-gray-100 font-semibold">{segment.name}</h3>
                        </div>
                        <div className="grow flex flex-col">
                            <div className="grow flex gap-4">
                                <ul className="text-sm space-y-2 mb-4 dark:text-gray-300 w-full">
                                    <li className="flex flex-col">
                                        <div className="font-bold">Products</div>
                                        <div className="font-bold text-lg">{formatNumber(segment.products.length)}</div>
                                        <div className="text-xs">{formatPercent(segment.percentOfTotalProducts)} of total</div>
                                    </li>
                                    <li className="flex flex-col">
                                        <div className="font-bold">Avg Price</div>
                                        <div className="font-bold text-lg">{formatPrice(segment.averagePrice)}</div>
                                        <div className="text-xs">Range: {formatPrice(segment.minPrice)} - {formatPrice(segment.maxPrice)}</div>
                                    </li>
                                    <li className="flex flex-col">
                                        <div className="font-bold">Total Sales</div>
                                        <div className="font-bold text-lg">{formatNumber(segment.totalSales)}</div>
                                        <div className="text-xs">{formatPercent(segment.percentOfTotalSales)} of total</div>
                                    </li>
                                </ul>
                                <ul className="text-sm space-y-2 mb-4 dark:text-gray-300 w-full">
                                    <li className="flex flex-col">
                                        <div className="font-bold">Total Revenue</div>
                                        <div className="font-bold text-lg">{formatPrice(segment.totalRevenue)}</div>
                                        <div className="text-xs">{formatPercent(segment.percentOfTotalRevenue)} of total</div>
                                    </li>
                                    <li className="flex flex-col">
                                        <div className="font-bold">Avg Reviews</div>
                                        <div className="font-bold text-lg">{formatNumber(segment.averageReviews)}</div>
                                        <div className="text-xs">Range: {formatNumber(segment.minReviews)} - {formatNumber(segment.maxReviews)}</div>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700/60 pt-2">
                                <button
                                    className="w-8 h-8 flex items-center justify-center text-violet-500 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all"
                                    onClick={() => handleRecycleSegment(segment)}
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
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default FeatureSegmentCards;
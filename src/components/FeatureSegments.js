import React, { useState, useMemo, useEffect } from 'react';

import FeatureSegmentCards from "./FeatureSegmentCards";
import FeatureSegmentTable from "./FeatureSegmentTable";
import CircularProgress from "./CircularProgress";

const FeatureSegments = ({ data, onSegmentSelect, currentKeyword, segments, loading, onRecycleSegment, resultsCount }) => {
    const [viewMode, setViewMode] = useState('cards');
    const [orderBy, setOrderBy] = useState('totalRevenue');
    const [order, setOrder] = useState('desc');

    console.log(segments, 'segments')

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

    if (loading) return <CircularProgress />;
    if (!segments) return <p>No segments data received</p>;
    if (!Array.isArray(segments.segments)) return <p>Invalid segments data structure</p>;
    if (segments.segments.length === 0) return <p>No segments available</p>;

    return (
        <div className="relative">
            <header className={`px-5 py-4 bg-white dark:bg-gray-800 ${viewMode === 'cards' ? 'rounded-xl' : 'rounded-t-xl'}`}>
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Total Results <span className="text-gray-400 dark:text-gray-500 font-medium">{resultsCount}</span></h2>
                <div className="flex justify-between items-center">
                    <p className="text-xl font-bold">
                        Segments for "<span style={{ fontWeight: 'bold' }}>{currentKeyword}</span>"
                    </p>
                    <p className="text-sm">
                        Total Results: {segments.segments.length} | Debug Info: Has segments: Yes
                    </p>

                    <div className="flex items-center">
                        <div className="form-switch">
                            <input type="checkbox" id="toggle" className="sr-only" checked={viewMode === 'cards'} onChange={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')} />
                            <label className="bg-gray-400 dark:bg-gray-700" htmlFor="toggle">
                                <span className="bg-white shadow-sm" aria-hidden="true"></span>
                                <span className="sr-only">Enable smart sync</span>
                            </label>
                        </div>
                        <div className="text-sm text-gray-400 dark:text-gray-500 italic ml-2">Card View</div>
                    </div>
                </div>
            </header>

            {viewMode === 'cards' ? (
                <FeatureSegmentCards
                    sortedSegments={sortedSegments}
                    onSegmentSelect={onSegmentSelect}
                    onRecycleSegment={onRecycleSegment}
                />
            ) : (
                <FeatureSegmentTable
                    sortedSegments={sortedSegments}
                    orderBy={orderBy}
                    setOrderBy={setOrderBy}
                    order={order}
                    setOrder={setOrder}
                    onSegmentSelect={onSegmentSelect}
                />
                )}
        </div>
    );
};

export default FeatureSegments;

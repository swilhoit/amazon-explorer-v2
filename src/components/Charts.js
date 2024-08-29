import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Typography, Box, Grid } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import {
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    ScatterChart
} from 'recharts';
import { AreaChart, Area } from 'recharts';
import PieChart from "./PieChart";
import LineChart from "./LineChart";
import {chartAreaGradient, chartColors} from "../utils/ChartjsConfig";
import {utils, hexToRGB} from "../utils/Utils";
import {useThemeProvider} from "../contexts/ThemeContext";
// import ScatterChart from "./ScatterChart";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// ScatterPlot component
const ScatterPlot = ({ data }) => {
    const { currentTheme } = useThemeProvider();
    const darkMode = currentTheme === 'dark';
    const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;
    const formattedData = data.map(item => ({
        title: item.title,
        price: parseFloat(item.price),
        sales: parseInt(item.sales),
        x: parseFloat(item.price),
        y: parseInt(item.sales),
        imageUrl: item.imageUrl,
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div
                    className="rounded-[8px] p-2 max-w-[300px]"
                    style={{
                        backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
                        border: `1px solid ${darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light}`
                }}
                >
                    <p className="font-bold text-[12px]">{data.title}</p>
                    <p className="text-gray-500 text-[12px]">Price: ${data.price.toFixed(2)}</p>
                    <p className="text-gray-500 text-[12px]">Sales: {data.sales.toLocaleString()}</p>
                    <img src={data.imageUrl} alt={data.title} style={{ width: 50, height: 50, objectFit: 'cover' }} />
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col col-span-full sm:col-span-12 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Price vs Sales Scatter Plot</h2>
            </header>
            <div className="grow p-4">
                {/*<ScatterChart*/}
                {/*    data={{ datasets: [{*/}
                {/*        label: '',*/}
                {/*        data: formattedData.map((item) => ({x: item.x, y: item.y}))*/}
                {/*    }]}}*/}
                {/*    width={357}*/}
                {/*    height={262}*/}
                {/*/>*/}
                <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="price" name="Price" unit="$" />
                        <YAxis type="number" dataKey="sales" name="Sales" />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Scatter name="Products" data={formattedData} fill="#8884d8" />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// PieCharts component
const PieCharts = ({ data }) => {
    const createChartData = (type) => {
        const labels = [];
        const counts = [];
        const threshold = 0.03; // 3% threshold
        let otherCount = 0;

        const countMap = data.reduce((acc, item) => {
            let key;
            if (type === 'sellerType') {
                key = item.fulfillment || 'Unknown';
            } else if (type === 'brand') {
                key = item.brand || 'Unknown';
            } else if (type === 'sellerCountry') {
                key = item.sellerCountry || 'Unknown';
            }
            if (!acc[key]) {
                acc[key] = 0;
            }
            acc[key]++;
            return acc;
        }, {});

        const total = Object.values(countMap).reduce((sum, count) => sum + count, 0);

        Object.entries(countMap).forEach(([key, count]) => {
            if (count / total >= threshold) {
                labels.push(key);
                counts.push(count);
            } else {
                otherCount += count;
            }
        });

        if (otherCount > 0) {
            labels.push('Other');
            counts.push(otherCount);
        }

        return {
            labels,
            datasets: [
                {
                    data: counts,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#FFCD56',
                        '#4BC0C0', '#9966FF', '#C9CBCF', '#FF6384', '#36A2EB',
                    ],
                },
            ],
        };
    };

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const dataset = tooltipItem.dataset;
                        const total = dataset.data.reduce((acc, current) => acc + current, 0);
                        const value = dataset.data[tooltipItem.dataIndex];
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${tooltipItem.label}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    const renderPieChart = (type, title) => {
        const chartData = createChartData(type);
        return (
            <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl h-auto max-w-[357px]">
                <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
                </header>
                {chartData.labels.length > 0 ? (
                    <PieChart data={chartData} width={389} height={220} />
                ) : (
                    <p>
                        No data available for {title.toLowerCase()}.
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="flex gap-4">
            {renderPieChart('sellerType', 'Seller Type Distribution')}
            {renderPieChart('brand', 'Brand Distribution')}
            {renderPieChart('sellerCountry', 'Seller Country Distribution')}
        </div>
    );
};

// TimelineChart component
const TimelineChart = ({ data }) => {
    const dateCounts = data.reduce((acc, item) => {
        const date = item.dateFirstAvailable ? item.dateFirstAvailable.split('T')[0] : 'Unknown';
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += 1;
        return acc;
    }, {});

    const chartData = Object.keys(dateCounts).map(date => ({
        date,
        count: dateCounts[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(chartData, 'chartData')

    let cumulativeCount = 0;
    const cumulativeData = chartData.map(item => {
        cumulativeCount += item.count;
        return {
            date: item.date,
            count: cumulativeCount
        };
    });

    const chartDataFinal = {
        labels: [
            ...cumulativeData.map((data) => data.date)
        ],
        datasets: [
            // Indigo line
            {
                label: 'Counts',
                data: [
                    ...cumulativeData.map((data) => data.count)
                ],
                borderColor: utils().theme.colors.violet[500],
                fill: true,
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    return chartAreaGradient(ctx, chartArea, [
                        { stop: 0, color: `rgba(${hexToRGB(utils().theme.colors.violet[500])}, 0)` },
                        { stop: 1, color: `rgba(${hexToRGB(utils().theme.colors.violet[500])}, 0.2)` }
                    ]);
                },
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 3,
                pointBackgroundColor: utils().theme.colors.violet[500],
                pointHoverBackgroundColor: utils().theme.colors.violet[500],
                pointBorderWidth: 0,
                pointHoverBorderWidth: 0,
                clip: 20,
                tension: 0.2,
            },
        ],
    };


    return (
        <div className="flex flex-col col-span-full sm:col-span-12 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
            <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center">
                <h2 className="font-semibold text-gray-800 dark:text-gray-100">Timeline of Dates First Available</h2>
            </header>
            <div className="grow">
                <LineChart data={chartDataFinal} width={357} height={262} />
            </div>
        </div>
    );
};

export { ScatterPlot, PieCharts, TimelineChart };
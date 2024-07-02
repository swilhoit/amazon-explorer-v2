import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Typography, Box, Grid } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { AreaChart, Area } from 'recharts';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// ScatterPlot component
const ScatterPlot = ({ data }) => {
    const formattedData = data.map(item => ({
        title: item.title,
        price: parseFloat(item.price),
        sales: parseInt(item.sales),
        imageUrl: item.imageUrl,
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ backgroundColor: 'white', padding: '5px', border: '1px solid #ccc' }}>
                    <p>{data.title}</p>
                    <p>Price: ${data.price.toFixed(2)}</p>
                    <p>Sales: {data.sales.toLocaleString()}</p>
                    <img src={data.imageUrl} alt={data.title} style={{ width: 50, height: 50, objectFit: 'cover' }} />
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="price" name="Price" unit="$" />
                <YAxis type="number" dataKey="sales" name="Sales" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Scatter name="Products" data={formattedData} fill="#8884d8" />
            </ScatterChart>
        </ResponsiveContainer>
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
            <Box>
                <Typography variant="h6" component="h2" gutterBottom>
                    {title}
                </Typography>
                {chartData.labels.length > 0 ? (
                    <Pie data={chartData} options={options} />
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        No data available for {title.toLowerCase()}.
                    </Typography>
                )}
            </Box>
        );
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                {renderPieChart('sellerType', 'Seller Type Distribution')}
            </Grid>
            <Grid item xs={12} md={4}>
                {renderPieChart('brand', 'Brand Distribution')}
            </Grid>
            <Grid item xs={12} md={4}>
                {renderPieChart('sellerCountry', 'Seller Country Distribution')}
            </Grid>
        </Grid>
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

    let cumulativeCount = 0;
    const cumulativeData = chartData.map(item => {
        cumulativeCount += item.count;
        return {
            date: new Date(item.date).getFullYear(),
            count: cumulativeCount
        };
    });

    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export { ScatterPlot, PieCharts, TimelineChart };
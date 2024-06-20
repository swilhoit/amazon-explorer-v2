import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Typography, Box } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieCharts = ({ data, type }) => {
    const getData = () => {
        const labels = [];
        const counts = [];
        const threshold = 0.03; // 3% threshold
        let otherCount = 0;

        const countMap = data.reduce((acc, item) => {
            const key = item[type];
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
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#FF9F40',
                        '#FFCD56',
                        '#4BC0C0',
                        '#9966FF',
                        '#C9CBCF',
                        '#FF6384',
                        '#36A2EB',
                    ],
                },
            ],
        };
    };

    const dataObject = getData();

    const title = type === 'sellerType' ? 'Seller Type Distribution' : 'Brand Distribution';

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const dataIndex = tooltipItem.dataIndex;
                        const value = dataObject.datasets[0].data[dataIndex];
                        const total = dataObject.datasets[0].data.reduce((acc, current) => acc + current, 0);
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${dataObject.labels[dataIndex]}: ${value} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <Box>
            <Typography variant="h6" component="h2" gutterBottom>
                {title}
            </Typography>
            {dataObject.labels.length > 0 ? (
                <Pie data={dataObject} options={options} />
            ) : (
                <Typography variant="body2" color="textSecondary">
                    No data available for {title.toLowerCase()}.
                </Typography>
            )}
        </Box>
    );
};

export default PieCharts;

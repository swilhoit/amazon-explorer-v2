import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TimelineChart = ({ data }) => {
    // Process the data to get the cumulative count of products first available on each date
    const dateCounts = data.reduce((acc, item) => {
        const date = item.dateFirstAvailable ? item.dateFirstAvailable.split('T')[0] : 'Unknown';
        if (!acc[date]) {
            acc[date] = 0;
        }
        acc[date] += 1;
        return acc;
    }, {});

    // Convert the dateCounts object into an array of objects
    const chartData = Object.keys(dateCounts).map(date => ({
        date,
        count: dateCounts[date]
    }));

    // Sort the data by date
    chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate cumulative counts
    let cumulativeCount = 0;
    const cumulativeData = chartData.map(item => {
        cumulativeCount += item.count;
        return {
            date: item.date,
            count: cumulativeCount
        };
    });

    // Format the date to show only the year
    const formattedData = cumulativeData.map(item => ({
        ...item,
        date: new Date(item.date).getFullYear()
    }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default TimelineChart;

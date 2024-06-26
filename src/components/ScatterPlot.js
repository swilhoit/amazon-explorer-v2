import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const styles = {
    tooltip: {
        maxWidth: 200,
        wordWrap: 'break-word',
        whiteSpace: 'normal',
    },
    image: {
        width: 50,
        height: 50,
        objectFit: 'cover',
    },
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { title, price, sales, imageUrl } = payload[0].payload;
        return (
            <div style={styles.tooltip}>
                <p>{title}</p>
                <p>Price: ${price}</p>
                <p>Sales: {sales}</p>
                <img src={imageUrl} alt={title} style={styles.image} />
            </div>
        );
    }
    return null;
};

const ScatterPlot = ({ data }) => {
    const formattedData = data.map(item => ({
        title: item.title,
        price: item.price,
        sales: item.sales,
        imageUrl: item.imageUrl,
    }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="price" name="Price" unit="$" />
                <YAxis type="number" dataKey="sales" name="Sales" />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Products" data={formattedData} fill="#8884d8" />
            </ScatterChart>
        </ResponsiveContainer>
    );
};

export default ScatterPlot;

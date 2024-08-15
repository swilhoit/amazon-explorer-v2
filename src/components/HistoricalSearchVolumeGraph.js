import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Typography, Paper } from '@mui/material';

const HistoricalSearchVolumeGraph = ({ data }) => {
  // Process the data to get the last 12 months
  const last12Months = data.slice(-12).map(item => ({
    date: new Date(item.attributes.estimate_start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    volume: item.attributes.estimated_exact_search_volume
  }));

  return (
    <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
      <Typography variant="h6" gutterBottom>
        Historical Search Volume - Last 12 Months
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={last12Months}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="volume" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default HistoricalSearchVolumeGraph;

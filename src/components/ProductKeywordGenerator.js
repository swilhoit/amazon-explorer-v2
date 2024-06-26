import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, CircularProgress, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ProductKeywordGenerator = () => {
  const [inputValue, setInputValue] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleGenerateKeywords = async (keyword = inputValue) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Generate at least 25 types of products related to the keyword "${keyword}":` }
          ],
          max_tokens: 200,  // Adjust to ensure enough tokens for 25 results
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const rawKeywords = response.data.choices[0].message.content.trim();
      let generatedKeywords = rawKeywords.split(/\d+\.\s*/).filter(keyword => keyword.trim().length > 0);

      // Ensure at least 25 results
      if (generatedKeywords.length < 25) {
        const additionalKeywords = Array.from({ length: 25 - generatedKeywords.length }, (_, i) => `Keyword Placeholder ${i + 1}`);
        generatedKeywords = generatedKeywords.concat(additionalKeywords);
      }

      setKeywords(generatedKeywords.slice(0, 25));  // Ensure only 25 results are displayed
    } catch (error) {
      console.error('Error generating keywords:', error);
    }
    setLoading(false);
  };

  const handleGenerateMoreKeywords = async (originalKeyword, newKeyword) => {
    setLoadingMore(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Generate at least 25 types of products related to the keywords "${originalKeyword}" and "${newKeyword}":` }
          ],
          max_tokens: 200,  // Adjust to ensure enough tokens for 25 results
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const rawKeywords = response.data.choices[0].message.content.trim();
      let generatedKeywords = rawKeywords.split(/\d+\.\s*/).filter(keyword => keyword.trim().length > 0);

      // Ensure at least 25 results
      if (generatedKeywords.length < 25) {
        const additionalKeywords = Array.from({ length: 25 - generatedKeywords.length }, (_, i) => `Keyword Placeholder ${i + 1}`);
        generatedKeywords = generatedKeywords.concat(additionalKeywords);
      }

      setKeywords(generatedKeywords.slice(0, 25));  // Ensure only 25 results are displayed
    } catch (error) {
      console.error('Error generating keywords:', error);
    }
    setLoadingMore(false);
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>Amazon Product Keyword Generator</Typography>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Enter Seed Keyword and Category"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          variant="outlined"
        />
      </Box>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleGenerateKeywords(inputValue)}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Keywords'}
        </Button>
      </Box>
      {keywords.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Keyword</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {keywords.map((keyword, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{keyword}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleGenerateMoreKeywords(inputValue, keyword)}
                      disabled={loadingMore}
                    >
                      {loadingMore ? <CircularProgress size={24} /> : 'Generate More'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProductKeywordGenerator;

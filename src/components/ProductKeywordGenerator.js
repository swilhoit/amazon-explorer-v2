import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, CircularProgress, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { fetchWithExponentialBackoff, generateKeywords, generateMoreKeywords } from '../utils/api'; // Ensure this path is correct based on your project structure

const ProductKeywordGenerator = () => {
  const [inputValue, setInputValue] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleGenerateKeywords = async (keyword = inputValue) => {
    setLoading(true);
    try {
      console.log('OpenAI API Key:', process.env.REACT_APP_OPENAI_API_KEY); // Log API key for debugging
      const response = await fetchWithExponentialBackoff(generateKeywords, [keyword]);

      const rawKeywords = response.data.choices[0].message.content.trim();
      let generatedKeywords = rawKeywords.split(/\d+\.\s*/).filter(keyword => keyword.trim().length > 0);

      if (generatedKeywords.length < 25) {
        const additionalKeywords = Array.from({ length: 25 - generatedKeywords.length }, (_, i) => `Keyword Placeholder ${i + 1}`);
        generatedKeywords = generatedKeywords.concat(additionalKeywords);
      }

      setKeywords(generatedKeywords.slice(0, 25));
    } catch (error) {
      console.error('Error generating keywords:', error);
      console.error('Error response:', error.response?.data);
    }
    setLoading(false);
  };

  const handleGenerateMoreKeywords = async (originalKeyword, newKeyword) => {
    setLoadingMore(true);
    try {
      console.log('OpenAI API Key:', process.env.REACT_APP_OPENAI_API_KEY); // Log API key for debugging
      const response = await fetchWithExponentialBackoff(generateMoreKeywords, [originalKeyword, newKeyword]);

      const rawKeywords = response.data.choices[0].message.content.trim();
      let generatedKeywords = rawKeywords.split(/\d+\.\s*/).filter(keyword => keyword.trim().length > 0);

      if (generatedKeywords.length < 25) {
        const additionalKeywords = Array.from({ length: 25 - generatedKeywords.length }, (_, i) => `Keyword Placeholder ${i + 1}`);
        generatedKeywords = generatedKeywords.concat(additionalKeywords);
      }

      setKeywords(generatedKeywords.slice(0, 25));
    } catch (error) {
      console.error('Error generating keywords:', error);
      console.error('Error response:', error.response?.data);
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

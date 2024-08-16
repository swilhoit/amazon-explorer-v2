// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const Groq = require('groq-sdk');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize SDKs with API keys
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Middleware to log request details
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Anthropic API endpoint
app.post('/api/anthropic/chat', async (req, res) => {
  try {
    const { messages, maxTokens, temperature, topP } = req.body;
    console.log('Calling Anthropic API...');
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240320",
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      messages: messages
    });
    console.log('Anthropic API Response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    res.status(500).json({ error: 'An error occurred while processing your request', details: error.message });
  }
});

// OpenAI API endpoint
app.post('/api/openai/chat', async (req, res) => {
  try {
    const { messages, maxTokens, temperature = 0.3, topP = 0.8 } = req.body;
    console.log('Calling OpenAI API with payload:', JSON.stringify({ messages, maxTokens, temperature, topP }, null, 2));
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is missing');
    }

    const response = await axios.post(OPENAI_API_URL, {
      model: "gpt-4",
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });
    
    console.log('OpenAI API Response:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    if (error.response) {
      console.error('OpenAI API Error Response:', {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('No response received from OpenAI API:', error.request);
    } else {
      console.error('Error setting up OpenAI API request:', error.message);
    }
    res.status(500).json({ 
      error: 'An error occurred while processing your request', 
      details: error.message,
      openAIError: error.response ? error.response.data : null
    });
  }
});

// Groq API endpoint
app.post('/api/groq/chat', async (req, res) => {
  try {
    const { messages, maxTokens, temperature = 0.3, topP = 0.8 } = req.body;
    console.log('Calling Groq API...');
    const response = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-70b-versatile",
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: false,
    });
    console.log('Groq API Response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error calling Groq API:', error);
    res.status(500).json({ error: 'An error occurred while processing your request', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
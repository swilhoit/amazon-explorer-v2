// Settings.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
} from '@mui/material';

const Settings = ({ onSave, initialSettings }) => {
  const [settings, setSettings] = useState({
    featureBatchSize: 20,
    maxTokens: 8000,
    apiProvider: 'groq',
    ...initialSettings
  });

  useEffect(() => {
    if (initialSettings) {
      setSettings(prevSettings => ({ ...prevSettings, ...initialSettings }));
    }
  }, [initialSettings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Box sx={{ mt: 4 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="Feature Batch Size"
            type="number"
            name="featureBatchSize"
            value={settings.featureBatchSize}
            onChange={handleChange}
            fullWidth
          />
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="Max Tokens"
            type="number"
            name="maxTokens"
            value={settings.maxTokens}
            onChange={handleChange}
            fullWidth
          />
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="api-provider-label">API Provider</InputLabel>
          <Select
            labelId="api-provider-label"
            name="apiProvider"
            value={settings.apiProvider}
            onChange={handleChange}
          >
            <MenuItem value="groq">GROQ</MenuItem>
            <MenuItem value="openai">OpenAI</MenuItem>
            <MenuItem value="anthropic">Anthropic</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Container>
  );
};

export default Settings;
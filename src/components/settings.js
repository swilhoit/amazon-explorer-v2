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
  Snackbar,
} from '@mui/material';

const Settings = ({ onSave, initialSettings }) => {
  const [settings, setSettings] = useState({
    featureBatchSize: 20,
    maxTokens: 8000,
    apiProvider: 'groq',
    ...initialSettings,
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setSettings(prevSettings => ({ ...prevSettings, ...initialSettings }));
    }
  }, [initialSettings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings((prevSettings) => ({
      ...prevSettings,
      [name]: name === 'featureBatchSize' || name === 'maxTokens' ? Number(value) : value,
    }));
  };

  const handleSave = () => {
    onSave(settings);
    setOpenSnackbar(true);
    console.log('Settings saved:', settings);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
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
            inputProps={{ min: 1 }}
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
            inputProps={{ min: 1 }}
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
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Settings saved successfully"
      />
    </Container>
  );
};

export default Settings;
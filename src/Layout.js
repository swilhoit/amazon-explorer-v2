import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useApi } from './ApiContext';
import {
  Container, Box, Typography, IconButton, AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, TextField, CssBaseline, Button, Alert
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import CSVUpload from './components/CSVUpload';
import MainComponent from './components/MainComponent';
import CalculatorComponent from './components/CalculatorComponent';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Settings from './components/settings';
import RelatedKeywords from './components/RelatedKeywords';
import { fetchProductDatabaseQuery } from './utils/junglescout';
import { processData } from './utils/dataProcessing';

const Layout = () => {
  const { settings, updateSettings } = useApi(); // Get settings and updateSettings from context
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [uploadedData, setUploadedData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchKeywords, setSearchKeywords] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('Current API provider:', settings.apiProvider);
  }, [settings.apiProvider]);

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCSVUpload = (data) => {
    console.log('CSV data uploaded', data);
    setUploadedData(data);
    setActiveTab(0);
    navigate('/');
  };

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    navigate(newValue === 0 ? '/' :
      newValue === 1 ? '/price-segments' :
      newValue === 2 ? '/winners' :
      newValue === 3 ? '/insights' :
      newValue === 4 ? '/comparison' :
      newValue === 5 ? '/segment-by-feature' :
      newValue === 6 ? '/calculator' :
      newValue === 7 ? '/related-keywords' :
      '/');
  };

  const handleSearch = async () => {
    if (!searchKeywords.trim()) {
      return;
    }

    console.log('Searching for products:', searchKeywords);
    setIsLoading(true);
    setErrorMessage(''); // Clear any previous error messages
    try {
      const searchParams = {
        includeKeywords: searchKeywords.split(',').map(keyword => keyword.trim()),
        minPrice: 10,
        maxPrice: 6000,
        minSales: 1,
        maxSales: 100000,
        minReviews: 1,
        maxReviews: 1000000,
        minRating: 1,
        maxRating: 5,
        marketplace: 'us',
        pageSize: 50
      };
      const response = await fetchProductDatabaseQuery(searchParams);
      
      // Process the data using the processData function
      const processedData = processData(response.data);
      
      // Update the state with the processed search results and metadata
      setSearchResults({
        data: processedData,
        meta: response.meta,
        links: response.links
      });
      setActiveTab(0);
      navigate('/');
    } catch (error) {
      console.error('Error searching for products:', error);
      setErrorMessage(`Error searching for products: ${error.message}`);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#04724D',
      },
      secondary: {
        main: '#8DB38B',
      },
      background: {
        default: darkMode ? '#303030' : '#f5f5f5',
        paper: darkMode ? '#424242' : '#ffffff',
      },
    },
    typography: {
      fontFamily: [
        'Montserrat',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },
  });

  const menuItems = [
    { text: 'All Results', icon: '📊', index: 0 },
    { text: 'Price Segments', icon: '📈', index: 1 },
    { text: 'Winners', icon: '🏆', index: 2 },
    { text: 'Insights', icon: '💡', index: 3 },
    { text: 'Comparison', icon: '🔍', index: 4 },
    { text: 'Segment by Feature', icon: '🧩', index: 5 },
    { text: 'Calculator', icon: '🧮', index: 6 },
    { text: 'Keyword Explorer', icon: '🔑', index: 7 }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 'none', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Amazon Explorer
            </Typography>
            <TextField
              label="Search for products (comma-separated keywords)"
              variant="outlined"
              size="small"
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              sx={{ mr: 2, background: 'white', borderRadius: 1, width: '300px' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              disabled={isLoading}
              sx={{ mr: 2 }}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
            <CSVUpload
              onDataUpload={handleCSVUpload}
              setLoading={() => {}}
              buttonText="Upload"
            />
            <IconButton onClick={handleThemeToggle} color="inherit" sx={{ ml: 1 }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            {isAuthenticated && (
              <div>
                <IconButton
                  aria-controls="account-menu"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                  </IconButton>
                <Menu
                  id="account-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  keepMounted
                >
                  <MenuItem onClick={() => navigate('/account-history')}>Account History</MenuItem>
                  <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
                  <MenuItem onClick={logout}>Logout</MenuItem>
                </Menu>
              </div>
            )}
          </Toolbar>
        </AppBar>
        {isAuthenticated && (
          <Drawer
            variant="permanent"
            sx={{
              width: 240,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto', p: 2 }}>
              <List>
                {menuItems.map((item) => (
                  <ListItem
                    button
                    key={item.text}
                    onClick={() => handleTabChange(item.index)}
                    selected={activeTab === item.index}
                    sx={{ mb: 1 }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
        )}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Container>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            {!isAuthenticated ? (
              <>
                {console.log('Rendering unauthenticated content')}
                {location.pathname === '/signup' ? (
                  <SignUp />
                ) : (
                  <Login />
                )}
              </>
            ) : (
              <>
                {location.pathname === '/settings' ? (
                  <Settings onSave={updateSettings} initialSettings={settings} />
                ) : activeTab === 6 ? (
                  <CalculatorComponent />
                ) : activeTab === 7 ? (
                  <RelatedKeywords />
                ) : (
                  <MainComponent
                    uploadedData={searchResults ? searchResults.data : uploadedData}
                    activeTab={activeTab}
                    handleTabChange={handleTabChange}
                    keywords={searchKeywords}
                    metadata={searchResults ? searchResults.meta : null}
                    links={searchResults ? searchResults.links : null}
                  />
                )}
              </>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;

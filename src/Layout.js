import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, IconButton, AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, TextField, CssBaseline
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import CSVUpload from './components/CSVUpload';
import Login from './components/login';
import MainComponent from './components/MainComponent';
import CalculatorComponent from './components/CalculatorComponent';

const Layout = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const [uploadedData, setUploadedData] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [searchKeywords, setSearchKeywords] = useState('');

    useEffect(() => {
        const sessionToken = localStorage.getItem('sessionToken');
        if (sessionToken) {
            setLoggedIn(true);
        }
    }, []);

    const handleThemeToggle = () => {
        setDarkMode(!darkMode);
    };

    const handleLogin = () => {
        setLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('sessionToken');
        setLoggedIn(false);
        setAnchorEl(null);
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
            '/calculator');
    };

    const handleSearch = () => {
        console.log('Searching for:', searchKeywords);
        // Pass the searchKeywords to MainComponent to fetch data
    };

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: '#3f51b5',
            },
            secondary: {
                main: '#f50057',
            },
            background: {
                default: darkMode ? '#303030' : '#f5f5f5',
                paper: darkMode ? '#424242' : '#ffffff',
            },
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h6: {
                fontWeight: 600,
            },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '10px 20px',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        },
                    },
                    containedPrimary: {
                        background: 'linear-gradient(45deg, #3f51b5 30%, #5c6bc0 90%)',
                    },
                    containedSecondary: {
                        background: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)',
                    },
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        width: 240,
                        border: 'none',
                        boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
                    },
                },
            },
            MuiListItem: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        marginBottom: 4,
                        '&.Mui-selected': {
                            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            '&:hover': {
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                            },
                        },
                    },
                },
            },
        },
    });

    const menuItems = [
        { text: 'All Results', icon: '📊', index: 0 },
        { text: 'Price Segments', icon: '📈', index: 1 },
        { text: 'Winners', icon: '🏆', index: 2 },
        { text: 'Insights', icon: '💡', index: 3 },
        { text: 'Comparison', icon: '🔍', index: 4 },
        { text: 'Segment by Feature', icon: '🧩', index: 5 },
        { text: 'Calculator', icon: '🧮', index: 6 }
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
                            label="Enter keywords separated by commas"
                            variant="outlined"
                            size="small"
                            value={searchKeywords}
                            onChange={(e) => setSearchKeywords(e.target.value)}
                            sx={{ mr: 2, background: 'white', borderRadius: 1 }}
                        />
                        <IconButton color="primary" onClick={handleSearch}>
                            <SearchIcon style={{ color: 'white' }} />
                        </IconButton>
                        <CSVUpload
                            onDataUpload={handleCSVUpload}
                            setLoading={() => {}}
                            buttonText="Upload"
                        />
                        <IconButton onClick={handleThemeToggle} color="inherit" sx={{ ml: 1 }}>
                            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                        {loggedIn && (
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
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </div>
                        )}
                    </Toolbar>
                </AppBar>
                {loggedIn && (
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
                        {!loggedIn ? (
                            <Login onLogin={handleLogin} />
                        ) : (
                            activeTab === 6 ? (
                                <CalculatorComponent />
                            ) : (
                                <MainComponent
                                    uploadedData={uploadedData}
                                    activeTab={activeTab}
                                    handleTabChange={handleTabChange}
                                    keywords={searchKeywords} // Pass keywords to MainComponent
                                />
                            )
                        )}
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Layout;

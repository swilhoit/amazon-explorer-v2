// src/Layout.js
import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Container, Box, Typography, Button, CssBaseline, IconButton, AppBar, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Login from './components/login';

const Layout = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

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
    };

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Amazon Explorer
                    </Typography>
                    <Box display="flex" alignItems="center">
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Button variant="contained" color="primary" sx={{ marginRight: 2 }}>
                                Price Points
                            </Button>
                        </Link>
                        <Link to="/related-keywords" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Button variant="contained" color="primary" sx={{ marginRight: 2 }}>
                                Related Keywords
                            </Button>
                        </Link>
                        <Link to="/product-comparison" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Button variant="contained" color="primary" sx={{ marginRight: 2 }}>
                                Compare Products
                            </Button>
                        </Link>
                        {loggedIn && (
                            <Button variant="contained" color="secondary" onClick={handleLogout} sx={{ marginRight: 2 }}>
                                Logout
                            </Button>
                        )}
                        <IconButton onClick={handleThemeToggle} color="inherit">
                            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Container>
                {!loggedIn ? (
                    <Login onLogin={handleLogin} />
                ) : (
                    <Outlet />
                )}
            </Container>
        </ThemeProvider>
    );
};

export default Layout;

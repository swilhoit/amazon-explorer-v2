import React, { useState } from 'react';
import { TextField, Button, Container, Box, Typography } from '@mui/material';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleLogin = () => {
        if (password === 'testpass') {
            onLogin();
            setError('');
        } else {
            setError('Invalid password');
        }
    };

    return (
        <Container>
            <Box my={4} display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h4" component="h1" gutterBottom>
                    Login
                </Typography>
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={password}
                    onChange={handlePasswordChange}
                    error={!!error}
                    helperText={error}
                />
                <Button variant="contained" color="primary" onClick={handleLogin} style={{ marginTop: '16px' }}>
                    Login
                </Button>
            </Box>
        </Container>
    );
};

export default Login;

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <AppBar position="static">
            <Container>
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        Melhor Preço
                    </Typography>
                    <Button
                        color="inherit"
                        component={RouterLink}
                        to="/cadastrar-produto"
                    >
                        Cadastrar Produto
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar; 
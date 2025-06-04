import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Box,
    Typography,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CategoryIcon from '@mui/icons-material/Category';
import AllInboxIcon from '@mui/icons-material/AllInbox';

const drawerWidth = 240;

const categories = [
    { id: 1, name: 'Eletrônicos', icon: '📱' },
    { id: 2, name: 'Moda', icon: '👕' },
    { id: 3, name: 'Casa', icon: '🏠' },
    { id: 4, name: 'Esportes', icon: '⚽' },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                },
            }}
        >
            <Box sx={{ overflow: 'auto', mt: 8 }}>
                <List>
                    <ListItem>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Categorias
                        </Typography>
                    </ListItem>
                    <Divider sx={{ my: 1 }} />
                    <ListItemButton
                        selected={location.pathname === '/'}
                        onClick={() => navigate('/')}
                        sx={{
                            '&.Mui-selected': {
                                background: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.05)',
                            },
                        }}
                    >
                        <ListItemIcon>
                            <AllInboxIcon />
                        </ListItemIcon>
                        <ListItemText primary="Todos os Produtos" />
                    </ListItemButton>
                    {categories.map((category) => (
                        <ListItemButton
                            key={category.id}
                            selected={location.pathname === `/categoria/${category.id}`}
                            onClick={() => navigate(`/categoria/${category.id}`)}
                            sx={{
                                '&.Mui-selected': {
                                    background: 'rgba(255, 255, 255, 0.1)',
                                },
                                '&:hover': {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                },
                            }}
                        >
                            <ListItemIcon>
                                <Typography variant="h6">{category.icon}</Typography>
                            </ListItemIcon>
                            <ListItemText primary={category.name} />
                        </ListItemButton>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar; 
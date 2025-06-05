import React, { useEffect, useState } from 'react';
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
import AllInboxIcon from '@mui/icons-material/AllInbox';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import HomeIcon from '@mui/icons-material/Home';
import { getCategories } from '../services/categoryApi';

const drawerWidth = 240;

const iconMap: Record<string, React.ReactNode> = {
    'Eletrônicos': <HomeIcon />,
    'Moda': <span role="img" aria-label="Moda">👕</span>,
    'Casa': <span role="img" aria-label="Casa">🏠</span>,
    'Esportes': <SportsSoccerIcon />,
};

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categories, setCategories] = useState<{ id: number, nome: string }[]>([]);

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

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
                                {iconMap[category.nome] || <AllInboxIcon />}
                            </ListItemIcon>
                            <ListItemText primary={category.nome} />
                        </ListItemButton>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar; 
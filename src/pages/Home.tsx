import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

const features = [
    {
        title: 'Compare Preços',
        description: 'Compare preços de produtos em diferentes marketplaces em tempo real.',
        icon: <CompareArrowsIcon sx={{ fontSize: 40 }} />,
    },
    {
        title: 'Busca Inteligente',
        description: 'Encontre os melhores preços com nossa busca automatizada.',
        icon: <SearchIcon sx={{ fontSize: 40 }} />,
    },
    {
        title: 'Cadastro Fácil',
        description: 'Cadastre seus produtos favoritos para acompanhar os preços.',
        icon: <AddIcon sx={{ fontSize: 40 }} />,
    },
];

const Home = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Box sx={{ mt: 8, mb: 4 }}>
            <Container maxWidth="lg">
                {/* Hero Section */}
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        background: 'linear-gradient(45deg, rgba(26, 35, 126, 0.1) 30%, rgba(13, 71, 161, 0.1) 90%)',
                        borderRadius: 4,
                        mb: 6,
                    }}
                >
                    <Typography
                        variant="h2"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Encontre os Melhores Preços
                    </Typography>
                    <Typography variant="h5" color="text.secondary" paragraph>
                        Compare preços em tempo real nos principais marketplaces do Brasil
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/produtos/novo')}
                        sx={{
                            mt: 2,
                            px: 4,
                            py: 1.5,
                            background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                            },
                        }}
                    >
                        Começar Agora
                    </Button>
                </Box>

                {/* Features Section */}
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        transition: 'transform 0.3s ease-in-out',
                                    },
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            mb: 2,
                                            color: 'primary.main',
                                        }}
                                    >
                                        {feature.icon}
                                    </Box>
                                    <Typography gutterBottom variant="h5" component="h2">
                                        {feature.title}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Home; 
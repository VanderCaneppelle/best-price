import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const marketplaces = [
    { id: 'ml', name: 'Mercado Livre', icon: '🛍️' },
    { id: 'amazon', name: 'Amazon', icon: '📦' },
    { id: 'magalu', name: 'Magazine Luiza', icon: '🏪' },
];

const ProductRequest = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        marketplace: '',
        productUrl: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Aqui você implementará a lógica de envio para o backend
            // Por enquanto, vamos simular um delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            setError('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper
                sx={{
                    p: 4,
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Acompanhar Preço
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Insira o link do produto que você deseja acompanhar
                    </Typography>
                </Box>

                {success ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Solicitação recebida! Você receberá um email quando o produto estiver disponível para acompanhamento.
                    </Alert>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                required
                                fullWidth
                                label="Seu Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                required
                                fullWidth
                                select
                                label="Marketplace"
                                name="marketplace"
                                value={formData.marketplace}
                                onChange={handleChange}
                                sx={{ mb: 2 }}
                            >
                                {marketplaces.map((marketplace) => (
                                    <MenuItem key={marketplace.id} value={marketplace.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>{marketplace.icon}</span>
                                            <span>{marketplace.name}</span>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                required
                                fullWidth
                                label="Link do Produto"
                                name="productUrl"
                                value={formData.productUrl}
                                onChange={handleChange}
                                placeholder="Cole aqui o link do produto"
                                sx={{ mb: 2 }}
                            />
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/')}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{
                                    minWidth: 120,
                                    background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #0d47a1 30%, #1a237e 90%)',
                                    },
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Solicitar'
                                )}
                            </Button>
                        </Box>
                    </form>
                )}
            </Paper>
        </Container>
    );
};

export default ProductRequest; 
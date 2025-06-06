import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Box,
    Divider,
    IconButton,
    FormControl,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/productApi';
import { getCategories } from '../services/categoryApi';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        mercadoLivreLink: '',
        amazonLink: '',
        magazineLuizaLink: '',
        image: '',
        marca: '',
        subcategoria: '',
    });
    const [categories, setCategories] = useState<{ id: number, nome: string }[]>([]);
    const [links, setLinks] = useState<Record<string, string[]>>({
        mercado_livre: [''],
        amazon: [''],
        magalu: [''],
        shopee: [''],
    });

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLinkChange = (marketplace: string, idx: number, value: string) => {
        setLinks((prev: Record<string, string[]>) => ({
            ...prev,
            [marketplace]: prev[marketplace].map((l: string, i: number) => i === idx ? value : l),
        }));
    };

    const handleAddLink = (marketplace: string) => {
        setLinks((prev: Record<string, string[]>) => ({
            ...prev,
            [marketplace]: [...prev[marketplace], ''],
        }));
    };

    const handleRemoveLink = (marketplace: string, idx: number) => {
        setLinks((prev: Record<string, string[]>) => ({
            ...prev,
            [marketplace]: prev[marketplace].filter((_: string, i: number) => i !== idx),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createProduct({
            nome: formData.name,
            descricao: formData.description,
            categoria_id: formData.categoryId,
            imagem_url: formData.image,
            links: {
                mercado_livre: links.mercado_livre.filter(l => l.trim()),
                amazon: links.amazon.filter(l => l.trim()),
                magalu: links.magalu.filter(l => l.trim()),
                shopee: links.shopee.filter(l => l.trim()),
            },
            marca: formData.marca,
            subcategoria: formData.subcategoria,
        });
        navigate('/');
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper
                sx={{
                    p: 4,
                    borderRadius: '12px',
                    backgroundImage: 'none',
                }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Cadastrar Novo Produto
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Preencha os dados do produto para começar a comparar preços
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Nome do Produto"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Descrição"
                                name="description"
                                multiline
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                select
                                label="Categoria"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.nome}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Links dos Produtos
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Adicione os links dos produtos nos diferentes marketplaces
                            </Typography>
                        </Grid>

                        {[
                            { key: 'mercado_livre', label: 'Mercado Livre' },
                            { key: 'amazon', label: 'Amazon' },
                            { key: 'magalu', label: 'Magazine Luiza' },
                            { key: 'shopee', label: 'Shopee' },
                        ].map(mkt => (
                            <Grid item xs={12} key={mkt.key}>
                                <Typography fontWeight={600} sx={{ mb: 1 }}>{mkt.label}</Typography>
                                {links[mkt.key].map((link: string, idx: number) => (
                                    <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                                        <TextField
                                            fullWidth
                                            label={`Link ${idx + 1}`}
                                            value={link}
                                            onChange={e => handleLinkChange(mkt.key, idx, e.target.value)}
                                        />
                                        <IconButton onClick={() => handleRemoveLink(mkt.key, idx)} disabled={links[mkt.key].length === 1}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button onClick={() => handleAddLink(mkt.key)} size="small" variant="outlined">Adicionar link</Button>
                            </Grid>
                        ))}

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                component="label"
                                sx={{ mb: 2 }}
                            >
                                Enviar Imagem
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleImageChange}
                                />
                            </Button>
                            {formData.image && (
                                <Box sx={{ mt: 1 }}>
                                    <img src={formData.image} alt="Pré-visualização" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }} />
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <TextField
                                    label="Marca"
                                    value={formData.marca || ''}
                                    onChange={handleChange}
                                    name="marca"
                                    variant="outlined"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal">
                                <TextField
                                    label="Subcategoria"
                                    value={formData.subcategoria || ''}
                                    onChange={handleChange}
                                    name="subcategoria"
                                    variant="outlined"
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/')}
                                    sx={{
                                        borderColor: 'rgba(255, 255, 255, 0.23)',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        px: 4,
                                    }}
                                >
                                    Cadastrar
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default ProductForm; 
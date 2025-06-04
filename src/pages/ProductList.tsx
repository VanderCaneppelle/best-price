import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Link,
    Box,
    IconButton,
    Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getAllProducts, saveProduct } from '../services/productCache';
import { fetchPriceFromBackend } from '../services/priceService';
import { Product } from '../types';
import { getProducts } from '../services/productApi';

const ProductList = () => {
    const { categoriaId } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const all = await getProducts();
            const filtered = categoriaId ? all.filter((p: any) => p.categoria_id === categoriaId) : all;
            setProducts(filtered);
        } catch (e) {
            setProducts([]);
        }
        setLoading(false);
    };

    const handleUpdatePrice = async (product: Product) => {
        setUpdatingId(product.id);
        try {
            const prices: any = {};
            for (const [market, url] of Object.entries(product.links)) {
                if (url) {
                    const result = await fetchPriceFromBackend(url);
                    console.log(`Resultado do scraping para ${market}:`, result);
                    prices[market] = result.price;
                }
            }
            const updated = { ...product, prices };
            setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
            saveProduct(updated);
        } catch (error) {
            console.error('Erro ao atualizar preço:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [categoriaId]);

    if (loading) {
        return <Typography>Carregando produtos e preços...</Typography>;
    }

    return (
        <Container sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Produtos da Categoria
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Compare os preços dos produtos nos principais marketplaces
                </Typography>
            </Box>
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    '& .MuiTableCell-root': {
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Imagem</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Mercado Livre</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Amazon</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Magazine Luiza</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow
                                key={product.id}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    },
                                }}
                            >
                                <TableCell>
                                    {product.image && (
                                        <img src={product.image} alt={product.name} style={{ maxWidth: 64, maxHeight: 64, borderRadius: 8 }} />
                                    )}
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.description}</TableCell>
                                <TableCell>
                                    <Link
                                        href={product.links.mercadoLivre}
                                        target="_blank"
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        R$ {product.prices.mercadoLivre.toFixed(2)}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={product.links.amazon}
                                        target="_blank"
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        R$ {product.prices.amazon.toFixed(2)}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={product.links.magazineLuiza}
                                        target="_blank"
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        R$ {(product.prices.magazineLuiza ?? 0).toFixed(2)}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Atualizar preços">
                                        <IconButton
                                            onClick={() => handleUpdatePrice(product)}
                                            disabled={updatingId === product.id}
                                            color="primary"
                                        >
                                            <RefreshIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default ProductList; 
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchPriceFromBackend } from '../services/priceService';
import { Product } from '../types';
import { getProducts } from '../services/productApi';
import axios from 'axios';

const ProductList = () => {
    const { categoriaId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [savingHistory, setSavingHistory] = useState(false);
    const [historyMsg, setHistoryMsg] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const all = await getProducts();
            const filtered = categoriaId
                ? all.filter((p: any) => String(p.categoria_id) === String(categoriaId))
                : all;
            setProducts(filtered);
        } catch (e) {
            setProducts([]);
        }
        setLoading(false);
    };

    const handleUpdatePrice = async (product: Product) => {
        setUpdatingId(product.id);
        try {
            const { data: updated } = await axios.put(`http://localhost:4000/api/products/${product.id}/update-prices`);
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...updated } : p));
        } catch (error) {
            console.error('Erro ao atualizar preço:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSavePriceHistory = async () => {
        setSavingHistory(true);
        setHistoryMsg(null);
        try {
            const { data } = await axios.post('http://localhost:4000/api/products/price-history/snapshot');
            setHistoryMsg(data.message || 'Histórico salvo!');
        } catch (error) {
            setHistoryMsg('Erro ao salvar histórico');
        } finally {
            setSavingHistory(false);
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
                <Button
                    variant="contained"
                    color="secondary"
                    sx={{ mt: 2, mb: 1 }}
                    onClick={handleSavePriceHistory}
                    disabled={savingHistory}
                >
                    Salvar histórico de preços (snapshot)
                </Button>
                {historyMsg && (
                    <Typography variant="body2" color={historyMsg.startsWith('Erro') ? 'error' : 'success.main'} sx={{ mt: 1 }}>
                        {historyMsg}
                    </Typography>
                )}
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
                            <TableCell sx={{ fontWeight: 600 }}>Shopee</TableCell>
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
                                        cursor: 'pointer',
                                    },
                                }}
                                onClick={() => navigate(`/produto/${product.id}`)}
                            >
                                <TableCell>
                                    {product.imagem_url && (
                                        <img src={product.imagem_url} alt={product.nome} style={{ maxWidth: 64, maxHeight: 64, borderRadius: 8 }} />
                                    )}
                                </TableCell>
                                <TableCell>{product.nome}</TableCell>
                                <TableCell>{product.descricao}</TableCell>
                                <TableCell>
                                    {product.links?.mercadoLivre ? (
                                        <Link href={product.links.mercadoLivre} target="_blank" sx={{ color: '#fff', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                            {product.preco_mercado_livre !== undefined && product.preco_mercado_livre !== null ? `R$ ${product.preco_mercado_livre.toFixed(2)}` : '—'}
                                        </Link>
                                    ) : '—'}
                                </TableCell>
                                <TableCell>
                                    {product.links?.amazon ? (
                                        <Link href={product.links.amazon} target="_blank" sx={{ color: '#fff', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                            {product.preco_amazon !== undefined && product.preco_amazon !== null ? `R$ ${product.preco_amazon.toFixed(2)}` : '—'}
                                        </Link>
                                    ) : '—'}
                                </TableCell>
                                <TableCell>
                                    {product.links?.magazineLuiza ? (
                                        <Link href={product.links.magazineLuiza} target="_blank" sx={{ color: '#fff', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                            {product.preco_magalu !== undefined && product.preco_magalu !== null ? `R$ ${product.preco_magalu.toFixed(2)}` : '—'}
                                        </Link>
                                    ) : '—'}
                                </TableCell>
                                <TableCell>
                                    {product.links?.shopee ? (
                                        <Link href={product.links.shopee} target="_blank" sx={{ color: '#fff', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                            {product.preco_shopee !== undefined && product.preco_shopee !== null ? `R$ ${product.preco_shopee.toFixed(2)}` : '—'}
                                        </Link>
                                    ) : '—'}
                                </TableCell>
                                <TableCell onClick={e => e.stopPropagation()}>
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
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
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
    const [loja, setLoja] = useState('');
    const [preco, setPreco] = useState<number[]>([0, 100000]);
    const [marca, setMarca] = useState('');
    const [subcategoria, setSubcategoria] = useState('');

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

    // Função para extrair todos os links válidos de um produto
    const getValidLinks = (product: Product) => {
        return Object.values(product.links || {})
            .flat()
            .filter((l: any) => l && l.price && l.price > 0);
    };

    // Extrair marcas e subcategorias únicas dos produtos
    const marcas = Array.from(new Set(products.map(p => p.marca).filter(Boolean)));
    const subcategorias = Array.from(new Set(products.map(p => p.subcategoria).filter(Boolean)));

    // Filtros aplicados
    const filteredProducts = products.filter(product => {
        const validLinks = getValidLinks(product);
        if (loja && !validLinks.some((l: any) => l.marketplace === loja)) return false;
        if (marca && product.marca !== marca) return false;
        if (subcategoria && product.subcategoria !== subcategoria) return false;
        if (validLinks.length === 0) return false;
        const bestPrice = Math.min(...validLinks.map((l: any) => l.price));
        if (bestPrice < preco[0] || bestPrice > preco[1]) return false;
        return true;
    });

    if (loading) {
        return <Typography>Carregando produtos e preços...</Typography>;
    }

    return (
        <Container sx={{ py: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Filtros laterais */}
            <Box sx={{ width: 260, minWidth: 220, mr: 4, mb: { xs: 3, md: 0 }, bgcolor: '#181818', borderRadius: 2, p: 3, height: 'fit-content' }}>
                <Typography variant="h6" mb={2} color="#fff">Filtros</Typography>
                <FormControl fullWidth margin="normal" variant="filled" sx={{ mb: 2 }}>
                    <InputLabel id="loja-label">Loja</InputLabel>
                    <Select
                        labelId="loja-label"
                        value={loja}
                        onChange={e => setLoja(e.target.value)}
                    >
                        <MenuItem value="">Todas</MenuItem>
                        <MenuItem value="mercado_livre">Mercado Livre</MenuItem>
                        <MenuItem value="amazon">Amazon</MenuItem>
                        <MenuItem value="magalu">Magazine Luiza</MenuItem>
                        <MenuItem value="shopee">Shopee</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" variant="filled" sx={{ mb: 2 }}>
                    <InputLabel id="marca-label">Marca</InputLabel>
                    <Select
                        labelId="marca-label"
                        value={marca}
                        onChange={e => setMarca(e.target.value)}
                    >
                        <MenuItem value="">Todas</MenuItem>
                        {marcas.map(m => (
                            <MenuItem key={m} value={m}>{m}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal" variant="filled" sx={{ mb: 2 }}>
                    <InputLabel id="subcategoria-label">Subcategoria</InputLabel>
                    <Select
                        labelId="subcategoria-label"
                        value={subcategoria}
                        onChange={e => setSubcategoria(e.target.value)}
                    >
                        <MenuItem value="">Todas</MenuItem>
                        {subcategorias.map(s => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box mt={2}>
                    <Typography gutterBottom color="#fff">Preço</Typography>
                    <Slider
                        value={preco}
                        onChange={(e, v) => setPreco(v as number[])}
                        min={0}
                        max={100000}
                        valueLabelDisplay="auto"
                        sx={{ color: '#bada55' }}
                    />
                    <Box display="flex" justifyContent="space-between" color="#fff">
                        <span>R$ {preco[0]}</span>
                        <span>R$ {preco[1]}</span>
                    </Box>
                </Box>
            </Box>
            {/* Lista de produtos */}
            <Box flex={1}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Produtos
                </Typography>
                <TableContainer
                    component={Paper}
                    sx={{ borderRadius: '12px', overflow: 'hidden', background: '#181818', color: '#fff' }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: '#bada55', fontSize: 18 }}>Produto</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#bada55', fontSize: 18 }}>Melhor Preço</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#bada55', fontSize: 18 }}>Lojas</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#bada55', fontSize: 18 }}>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts.map((product) => {
                                const validLinks = getValidLinks(product);
                                const bestPrice = validLinks.length > 0 ? Math.min(...validLinks.map((l: any) => l.price)) : null;
                                return (
                                    <TableRow
                                        key={product.id}
                                        sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)', cursor: 'pointer' } }}
                                        onClick={() => navigate(`/produto/${product.id}`)}
                                    >
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                {product.imagem_url && (
                                                    <img src={product.imagem_url} alt={product.nome} style={{ maxWidth: 48, maxHeight: 48, borderRadius: 8 }} />
                                                )}
                                                <Box>
                                                    <Typography fontWeight={600} fontSize={16} color="#fff">{product.nome}</Typography>
                                                    <Typography fontSize={13} color="#bbb">{product.descricao}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: bestPrice ? '#4caf50' : '#fff', fontSize: 17 }}>
                                            {bestPrice ? `R$ ${bestPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sem preço'}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 500, color: '#fff', fontSize: 15 }}>
                                            {validLinks.length}
                                        </TableCell>
                                        <TableCell onClick={e => e.stopPropagation()}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={() => navigate(`/produto/${product.id}`)}
                                                sx={{ fontWeight: 500, borderRadius: 2, fontSize: 15, px: 3, boxShadow: 'none', textTransform: 'none', background: '#222', color: '#bada55', '&:hover': { background: '#333' } }}
                                            >
                                                Ver ofertas
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default ProductList; 
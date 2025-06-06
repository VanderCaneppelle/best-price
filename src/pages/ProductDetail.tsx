import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Typography, Box, Paper, Link, Button, CircularProgress, Table, TableBody, TableCell, TableRow, Chip, Stack, TableContainer, TableHead
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MARKETPLACES = [
    { key: 'mercado_livre', label: 'Mercado Livre', color: '#ffdb15', icon: <StorefrontIcon sx={{ color: '#ffe600' }} /> },
    { key: 'amazon', label: 'Amazon', color: '#ff9900', icon: <LocalMallIcon sx={{ color: '#ff9900' }} /> },
    { key: 'magalu', label: 'Magazine Luiza', color: '#0074c1', icon: <ShoppingCartIcon sx={{ color: '#0074c1' }} /> },
    { key: 'shopee', label: 'Shopee', color: '#ee4d2d', icon: <LocalOfferIcon sx={{ color: '#ee4d2d' }} /> },
];

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [linkPrices, setLinkPrices] = useState<Record<string, Record<string, number>>>({});
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Função para buscar dados do produto e histórico
    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: prod } = await axios.get(`http://localhost:4000/api/products/${id}`);
            setProduct(prod);
            const { data: hist } = await axios.get(`http://localhost:4000/api/products/${id}/price-history?days=90`);
            setHistory(hist);
        } catch (e) {
            setProduct(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleUpdatePrice = async (product: any) => {
        setUpdatingId(product.id);
        try {
            await axios.post(`http://localhost:4000/api/products/${product.id}/update-prices`);
            await fetchData();
        } catch (e) {
            console.error("Erro ao atualizar preços:", e);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
    }
    if (!product) {
        return <Container><Typography>Produto não encontrado.</Typography></Container>;
    }

    // Organiza dados do gráfico
    const dates = Array.from(new Set(history.map(h => h.checked_at.slice(0, 10)))).sort();
    const datasets = MARKETPLACES.map(mkt => {
        const data = dates.map(date => {
            const entry = history.find(h => h.marketplace === mkt.key && h.checked_at.slice(0, 10) === date);
            return entry ? entry.price : null;
        });
        return {
            label: mkt.label,
            data,
            borderColor: mkt.color,
            backgroundColor: mkt.color + '33',
            spanGaps: true,
            tension: 0.3,
        };
    });
    const chartData = {
        labels: dates,
        datasets,
    };

    // Calcular o total de lojas com preço válido
    const totalLojas = Object.values(product.links || {})
        .flat()
        .filter(l => (l as { price?: number | null })?.price && (l as { price?: number | null })?.price! > 0).length;

    return (
        <Container sx={{ py: 4, maxWidth: '900px' }}>
            <Button
                variant="contained"
                color="primary"
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 3, borderRadius: 3, fontWeight: 600, boxShadow: 2 }}
                onClick={() => navigate(-1)}
            >
                Voltar
            </Button>
            <Paper
                sx={{
                    p: { xs: 2, md: 4 },
                    mb: 4,
                    borderRadius: 4,
                    boxShadow: 6,
                    background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
                    color: '#fff',
                }}
            >
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} alignItems="flex-start">
                    {product.imagem_url && (
                        <Box
                            sx={{
                                minWidth: 180,
                                maxWidth: 220,
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: 3,
                                bgcolor: '#fff',
                                p: 1,
                            }}
                        >
                            <img src={product.imagem_url} alt={product.nome} style={{ width: '100%', borderRadius: 12 }} />
                        </Box>
                    )}
                    <Box flex={1}>
                        <Typography variant="h4" gutterBottom fontWeight={700}>{product.nome}</Typography>
                        <Typography variant="body1" color="grey.300" gutterBottom>{product.descricao}</Typography>
                        <Box mt={2}>
                            <Typography variant="h6" fontWeight={700} mb={2}>{`Disponível em ${totalLojas} lojas`}</Typography>
                            <TableContainer component={Paper} sx={{ bgcolor: '#181818', borderRadius: 3, boxShadow: 3, mb: 4 }}>
                                <Table size="small" sx={{ minWidth: 400 }}>
                                    <TableHead>
                                        <TableRow sx={{ background: '#111', height: 36 }}>
                                            <TableCell sx={{ color: '#fff', fontWeight: 400, fontSize: 16, border: 0 }}>Loja</TableCell>
                                            <TableCell sx={{ color: '#fff', fontWeight: 400, fontSize: 16, border: 0 }}>À Vista</TableCell>
                                            <TableCell sx={{ color: '#fff', fontWeight: 400, fontSize: 16, border: 0 }}>Link</TableCell>
                                            <TableCell sx={{ color: '#fff', fontWeight: 400, fontSize: 16, border: 0 }}>Ações</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {MARKETPLACES.map(mkt => {
                                            const links = (product.links?.[mkt.key] ?? []) as { url: string, price: number | null }[];
                                            const validLinks = links.filter((l: { price: number | null }) => l.price && l.price > 0);
                                            if (!validLinks.length) return null;
                                            const minPrice = Math.min(...validLinks.map((l: { price: number | null }) => l.price!));
                                            return validLinks.map((link, idx) => (
                                                <TableRow key={link.url + idx} sx={{ background: idx % 2 === 0 ? '#181818' : '#222', border: 0 }}>
                                                    <TableCell sx={{ border: 0, p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {mkt.icon}
                                                        <span style={{ fontWeight: 400, fontSize: 16, color: '#fff' }}>{mkt.label}</span>
                                                    </TableCell>
                                                    <TableCell sx={{ border: 0, p: 1 }}>
                                                        <span style={{
                                                            color: link.price === minPrice && link.price > 0 ? '#4caf50' : '#fff',
                                                            fontWeight: link.price === minPrice && link.price > 0 ? 600 : 400,
                                                            fontSize: 16,
                                                            letterSpacing: 0.2,
                                                        }}>
                                                            {link.price && link.price > 0 ? `R$ ${link.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sem preço'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell sx={{ border: 0, p: 1 }}>
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            href={link.url}
                                                            target="_blank"
                                                            sx={{ fontWeight: 400, borderRadius: 2, fontSize: 15, px: 3, boxShadow: 'none', textTransform: 'none', background: '#222', color: '#bada55', '&:hover': { background: '#333' } }}
                                                        >
                                                            Comprar
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell onClick={e => e.stopPropagation()}>
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => handleUpdatePrice(product)}
                                                            sx={{ ml: 1, fontWeight: 500, borderRadius: 2, fontSize: 15, px: 2, boxShadow: 'none', textTransform: 'none' }}
                                                            disabled={updatingId === product.id}
                                                        >
                                                            Atualizar preços
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ));
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                        <Box mt={3}>
                            <Typography variant="subtitle1" fontWeight={600} mb={1}>Preços atuais:</Typography>
                            <Table size="small" sx={{ bgcolor: '#232526', borderRadius: 2 }}>
                                <TableBody>
                                    {MARKETPLACES.map(mkt => (
                                        <TableRow key={mkt.key}>
                                            <TableCell sx={{ color: '#fff', border: 0, fontWeight: 600 }}>
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    {mkt.icon}
                                                    {mkt.label}
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ color: '#fff', border: 0, fontWeight: 700 }}>
                                                {product[`preco_${mkt.key}`] !== undefined && product[`preco_${mkt.key}`] !== null
                                                    ? `R$ ${Number(product[`preco_${mkt.key}`]).toFixed(2)}`
                                                    : <Chip label="Sem preço" size="small" color="default" />}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                </Box>
            </Paper>
            <Paper
                sx={{
                    p: { xs: 2, md: 4 },
                    borderRadius: 4,
                    boxShadow: 6,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    mb: 4,
                }}
            >
                <Typography variant="h6" gutterBottom fontWeight={700} color="primary.dark">
                    Histórico de Preço (últimos 90 dias)
                </Typography>
                <Box height={350}>
                    <Line data={chartData} options={{
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                            title: { display: false },
                        },
                        interaction: { mode: 'index', intersect: false },
                        scales: {
                            y: { beginAtZero: true, title: { display: true, text: 'Preço (R$)' } },
                            x: { title: { display: true, text: 'Data' } },
                        },
                    }} />
                </Box>
            </Paper>
        </Container>
    );
};

export default ProductDetail;
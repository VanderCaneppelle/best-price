import express from 'express';
import cors from 'cors';
import { ScraperManager } from './ScraperManager';
import productRoutes from './routes/productRoutes';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Rotas de produtos
app.use('/api/products', productRoutes);

const scraperManager = new ScraperManager();

app.get('/scrape', (req, res) => {
    const url = req.query.url as string;
    if (!url) {
        return res.status(400).json({ error: 'URL não informada' });
    }
    scraperManager.scrapePrice(url)
        .then(result => res.json(result))
        .catch(error => res.status(500).json({ error: 'Erro ao fazer scraping', details: error }));
});

app.listen(port, () => {
    console.log(`Backend rodando em http://localhost:${port}`);
}); 
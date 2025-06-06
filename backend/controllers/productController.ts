import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import { ScraperManager } from '../ScraperManager';

const scraperManager = new ScraperManager();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista todos os produtos
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
// Listar todos os produtos com todos os links agrupados por marketplace
export async function getAllProducts(req: Request, res: Response) {
    // Busca produtos
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json({ error: error.message });

    // Busca todos os links com seus preços
    const { data: linksData } = await supabase.from('marketplace_links').select('*');

    // Agrupa links por produto e marketplace, incluindo preços
    const productsWithLinks = products.map((product: any) => {
        const links: Record<string, { url: string, price: number | null }[]> = {};
        const lowestPrices: Record<string, number | null> = {
            mercado_livre: null,
            amazon: null,
            magalu: null,
            shopee: null
        };

        linksData?.filter(l => l.product_id === product.id).forEach(l => {
            const key =
                l.marketplace === 'mercado_livre' ? 'mercado_livre' :
                    l.marketplace === 'amazon' ? 'amazon' :
                        (l.marketplace === 'magalu' || l.marketplace === 'magazine_luiza') ? 'magalu' :
                            l.marketplace;

            if (!links[key]) links[key] = [];
            links[key].push({ url: l.url, price: l.price });

            // Atualiza o menor preço do marketplace
            if (l.price !== null) {
                if (lowestPrices[key] === null || l.price < lowestPrices[key]!) {
                    lowestPrices[key] = l.price;
                }
            }
        });

        return {
            ...product,
            links,
            lowest_prices: lowestPrices
        };
    });

    res.json(productsWithLinks);
}

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Busca um produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
// Buscar produto por ID (com todos os links agrupados por marketplace)
export async function getProductById(req: Request, res: Response) {
    const { id } = req.params;
    const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: error.message });

    const { data: linksData } = await supabase.from('marketplace_links').select('*').eq('product_id', id);

    const links: Record<string, { url: string, price: number | null }[]> = {};
    const lowestPrices: Record<string, number | null> = {
        mercado_livre: null,
        amazon: null,
        magalu: null,
        shopee: null
    };

    linksData?.forEach(l => {
        const key =
            l.marketplace === 'mercado_livre' ? 'mercado_livre' :
                l.marketplace === 'amazon' ? 'amazon' :
                    (l.marketplace === 'magalu' || l.marketplace === 'magazine_luiza') ? 'magalu' :
                        l.marketplace;

        if (!links[key]) links[key] = [];
        links[key].push({ url: l.url, price: l.price });

        // Atualiza o menor preço do marketplace
        if (l.price !== null) {
            if (lowestPrices[key] === null || l.price < lowestPrices[key]!) {
                lowestPrices[key] = l.price;
            }
        }
    });

    res.json({
        ...product,
        links,
        lowest_prices: lowestPrices
    });
}

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria um novo produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Produto criado
 */
// Criar produto e marketplace_links
export async function createProduct(req: Request, res: Response) {
    const { nome, descricao, categoria_id, imagem_url, links } = req.body;
    const { data: product, error } = await supabase.from('products').insert([{ nome, descricao, categoria_id, imagem_url }]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    // Salva os links
    if (links && product?.id) {
        const linksArray: { product_id: string, marketplace: string, url: string, created_at: string }[] = [];
        const now = new Date().toISOString();
        Object.entries(links).forEach(([marketplace, urls]) => {
            if (Array.isArray(urls)) {
                urls.forEach((url) => {
                    if (typeof url === 'string') {
                        // Remove colchetes/aspas extras se vierem por erro
                        let cleanUrl = url.trim();
                        if (cleanUrl.startsWith('[') && cleanUrl.endsWith(']')) {
                            try {
                                const arr = JSON.parse(cleanUrl);
                                if (Array.isArray(arr) && arr.length > 0) cleanUrl = arr[0];
                            } catch { }
                        }
                        linksArray.push({
                            product_id: product.id,
                            marketplace,
                            url: cleanUrl,
                            created_at: now
                        });
                    }
                });
            } else if (typeof urls === 'string') {
                let cleanUrl = urls.trim();
                if (cleanUrl.startsWith('[') && cleanUrl.endsWith(']')) {
                    try {
                        const arr = JSON.parse(cleanUrl);
                        if (Array.isArray(arr) && arr.length > 0) cleanUrl = arr[0];
                    } catch { }
                }
                linksArray.push({
                    product_id: product.id,
                    marketplace,
                    url: cleanUrl,
                    created_at: now
                });
            }
        });
        if (linksArray.length > 0) {
            await supabase.from('marketplace_links').insert(linksArray);
        }
    }
    res.status(201).json(product);
}

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Atualiza um produto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       404:
 *         description: Produto não encontrado
 */
// Atualizar produto
export async function updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, descricao, categoria_id, imagem_url } = req.body;
    const { data, error } = await supabase.from('products').update({ nome, descricao, categoria_id, imagem_url }).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
}

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Deleta um produto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       204:
 *         description: Produto deletado
 *       404:
 *         description: Produto não encontrado
 */
// Deletar produto
export async function deleteProduct(req: Request, res: Response) {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
}

/**
 * @swagger
 * /products/{id}/update-prices:
 *   put:
 *     summary: Atualiza os preços do produto (scraping)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Preços atualizados
 *       404:
 *         description: Produto não encontrado
 */
// Atualizar preços de todos os marketplaces de um produto
export async function updateProductPrices(req: Request, res: Response) {
    const { id } = req.params;
    // Busca produto e links
    const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error || !product) return res.status(404).json({ error: 'Produto não encontrado' });
    const { data: linksData } = await supabase.from('marketplace_links').select('*').eq('product_id', id);
    if (!linksData || linksData.length === 0) return res.status(404).json({ error: 'Nenhum link encontrado para este produto.' });

    // Para cada link, roda o scraper e atualiza o campo price
    const updatedLinks = [];
    const now = new Date().toISOString();
    for (const link of linksData) {
        try {
            const result = await scraperManager.scrapePrice(link.url);
            await supabase.from('marketplace_links')
                .update({
                    price: result.price,
                    created_at: now
                })
                .eq('id', link.id);
            updatedLinks.push({ ...link, price: result.price, created_at: now });
        } catch (err) {
            updatedLinks.push({ ...link, price: null, error: 'Erro ao buscar preço', created_at: now });
        }
    }

    // Monta objeto agrupado por marketplace para resposta
    const links: Record<string, { url: string, price: number | null, created_at: string }[]> = {};
    updatedLinks.forEach(l => {
        const key =
            l.marketplace === 'mercado_livre' ? 'mercado_livre' :
                l.marketplace === 'amazon' ? 'amazon' :
                    (l.marketplace === 'magalu' || l.marketplace === 'magazine_luiza') ? 'magalu' :
                        l.marketplace;
        if (!links[key]) links[key] = [];
        links[key].push({ url: l.url, price: l.price, created_at: l.created_at });
    });

    res.json({ ...product, links });
}

/**
 * @swagger
 * /products/price-history/snapshot:
 *   post:
 *     summary: Cria um snapshot de histórico de preços de todos os produtos
 *     responses:
 *       200:
 *         description: Snapshot criado
 */
// Criar snapshot de histórico de preços de todos os produtos (um registro por marketplace por dia)
export async function createPriceHistorySnapshot(req: Request, res: Response) {
    // Busca todos os produtos
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json({ error: error.message });
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // yyyy-mm-dd

    // Busca registros existentes de hoje
    const { data: existing, error: errExisting } = await supabase
        .from('price_history')
        .select('*')
        .gte('checked_at', todayStr + 'T00:00:00.000Z')
        .lte('checked_at', todayStr + 'T23:59:59.999Z');
    if (errExisting) return res.status(500).json({ error: errExisting.message });

    // Monta registros de histórico para cada marketplace de cada produto
    let upserts = 0;
    let inserts = 0;
    let updates = 0;
    for (const product of products || []) {
        const marketplaces = [
            { key: 'preco_mercado_livre', name: 'mercado_livre' },
            { key: 'preco_amazon', name: 'amazon' },
            { key: 'preco_magalu', name: 'magalu' },
            { key: 'preco_shopee', name: 'shopee' },
        ];
        for (const mkt of marketplaces) {
            const price = product[mkt.key];
            if (price !== undefined && price !== null) {
                // Verifica se já existe registro para o mesmo produto, marketplace e dia
                const found = (existing || []).find((h: any) =>
                    h.product_id === product.id &&
                    h.marketplace === mkt.name &&
                    h.checked_at.slice(0, 10) === todayStr
                );
                if (found) {
                    // Faz update
                    const { error: updateErr } = await supabase.from('price_history')
                        .update({ price, currency: 'BRL', checked_at: now.toISOString() })
                        .eq('id', found.id);
                    if (!updateErr) updates++;
                } else {
                    // Faz insert
                    const { error: insertErr } = await supabase.from('price_history').insert({
                        product_id: product.id,
                        marketplace: mkt.name,
                        price,
                        currency: 'BRL',
                        checked_at: now.toISOString(),
                    });
                    if (!insertErr) inserts++;
                }
                upserts++;
            }
        }
    }
    if (upserts === 0) {
        return res.status(400).json({ error: 'Nenhum preço encontrado para salvar no histórico.' });
    }
    res.json({ message: 'Histórico de preços salvo/atualizado com sucesso', inserts, updates });
}

/**
 * @swagger
 * /products/{id}/price-history:
 *   get:
 *     summary: Busca o histórico de preços de um produto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do produto
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Número de dias para buscar
 *     responses:
 *       200:
 *         description: Histórico de preços
 */
// Buscar histórico de preços dos últimos X dias para um produto
export async function getProductPriceHistory(req: Request, res: Response) {
    const { id } = req.params;
    const days = parseInt(req.query.days as string) || 90;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('product_id', id)
        .gte('checked_at', since)
        .order('checked_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
} 
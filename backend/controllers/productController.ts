import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import { ScraperManager } from '../ScraperManager';

const scraperManager = new ScraperManager();

// Listar todos os produtos com links
export async function getAllProducts(req: Request, res: Response) {
    // Busca produtos
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json({ error: error.message });
    // Busca todos os links
    const { data: linksData } = await supabase.from('marketplace_links').select('*');
    // Agrupa links por produto
    const productsWithLinks = products.map((product: any) => {
        const links = {} as Record<string, string>;
        linksData?.filter(l => l.product_id === product.id).forEach(l => {
            // padroniza nome para frontend
            if (l.marketplace === 'mercado_livre') links.mercadoLivre = l.url;
            if (l.marketplace === 'amazon') links.amazon = l.url;
            if (l.marketplace === 'magalu' || l.marketplace === 'magazine_luiza') links.magazineLuiza = l.url;
        });
        return { ...product, links };
    });
    res.json(productsWithLinks);
}

// Buscar produto por ID (com links)
export async function getProductById(req: Request, res: Response) {
    const { id } = req.params;
    const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: error.message });
    const { data: linksData } = await supabase.from('marketplace_links').select('*').eq('product_id', id);
    const links = {} as Record<string, string>;
    linksData?.forEach(l => {
        if (l.marketplace === 'mercado_livre') links.mercadoLivre = l.url;
        if (l.marketplace === 'amazon') links.amazon = l.url;
        if (l.marketplace === 'magalu' || l.marketplace === 'magazine_luiza') links.magazineLuiza = l.url;
    });
    res.json({ ...product, links });
}

// Criar produto e marketplace_links
export async function createProduct(req: Request, res: Response) {
    const { nome, descricao, categoria_id, imagem_url, links } = req.body;
    const { data: product, error } = await supabase.from('products').insert([{ nome, descricao, categoria_id, imagem_url }]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    // Salva os links
    if (links && product?.id) {
        const linksArray = Object.entries(links)
            .filter(([_, url]) => url)
            .map(([marketplace, url]) => ({
                product_id: product.id,
                marketplace,
                url,
            }));
        if (linksArray.length > 0) {
            await supabase.from('marketplace_links').insert(linksArray);
        }
    }
    res.status(201).json(product);
}

// Atualizar produto
export async function updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, descricao, categoria_id, imagem_url } = req.body;
    const { data, error } = await supabase.from('products').update({ nome, descricao, categoria_id, imagem_url }).eq('id', id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
}

// Deletar produto
export async function deleteProduct(req: Request, res: Response) {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).send();
}

// Atualizar preços de todos os marketplaces de um produto
export async function updateProductPrices(req: Request, res: Response) {
    const { id } = req.params;
    // Busca produto e links
    const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error || !product) return res.status(404).json({ error: 'Produto não encontrado' });
    const { data: linksData } = await supabase.from('marketplace_links').select('*').eq('product_id', id);
    // Monta objeto de links
    const links: Record<string, string> = {};
    linksData?.forEach(l => {
        if (l.marketplace === 'mercado_livre') links.mercadoLivre = l.url;
        if (l.marketplace === 'amazon') links.amazon = l.url;
        if (l.marketplace === 'magalu' || l.marketplace === 'magazine_luiza') links.magazineLuiza = l.url;
        if (l.marketplace === 'shopee') links.shopee = l.url;
    });
    // Roda scrapers
    const prices = await scraperManager.scrapeAllMarkets(links);
    // Atualiza produto no banco
    const { data: updated, error: updateError } = await supabase.from('products').update({
        preco_mercado_livre: prices.mercadoLivre,
        preco_amazon: prices.amazon,
        preco_magalu: prices.magazineLuiza,
        preco_shopee: prices.shopee,
    }).eq('id', id).select().single();
    if (updateError) return res.status(500).json({ error: updateError.message });
    res.json({ ...updated, links });
}

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
import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';

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
import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';

// Listar todos os produtos
export async function getAllProducts(req: Request, res: Response) {
    const { data, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
}

// Buscar produto por ID
export async function getProductById(req: Request, res: Response) {
    const { id } = req.params;
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ error: error.message });
    res.json(data);
}

// Criar produto
export async function createProduct(req: Request, res: Response) {
    const { nome, descricao, categoria_id, imagem_url } = req.body;
    const { data, error } = await supabase.from('products').insert([{ nome, descricao, categoria_id, imagem_url }]).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
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
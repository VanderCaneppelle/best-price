export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Product {
    id: string;
    nome: string;
    descricao: string;
    categoria_id: number;
    imagem_url?: string;
    prices?: {
        mercadoLivre?: number;
        amazon?: number;
        magazineLuiza?: number;
    };
    links?: {
        mercado_livre?: { url: string, price: number | null }[];
        amazon?: { url: string, price: number | null }[];
        magalu?: { url: string, price: number | null }[];
        shopee?: { url: string, price: number | null }[];
        [key: string]: { url: string, price: number | null }[] | undefined;
    };
    lowest_prices?: Record<string, number | null>;
    name?: string;
    description?: string;
    image?: string;
    categoryId?: number;
    preco_mercado_livre?: number;
    preco_amazon?: number;
    preco_magalu?: number;
    preco_shopee?: number;
    marca?: string;
    subcategoria?: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    categoryId: string;
    mercadoLivreLink: string;
    amazonLink: string;
    magazineLuizaLink: string;
} 
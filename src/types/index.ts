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
        mercadoLivre?: string;
        amazon?: string;
        magazineLuiza?: string;
    };
    name?: string;
    description?: string;
    image?: string;
    categoryId?: number;
}

export interface ProductFormData {
    name: string;
    description: string;
    categoryId: string;
    mercadoLivreLink: string;
    amazonLink: string;
    magazineLuizaLink: string;
} 
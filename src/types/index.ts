export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    categoryId: number;
    prices: {
        mercadoLivre: number;
        amazon: number;
        magazineLuiza: number;
    };
    links: {
        mercadoLivre: string;
        amazon: string;
        magazineLuiza: string;
    };
    image?: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    categoryId: string;
    mercadoLivreLink: string;
    amazonLink: string;
    magazineLuizaLink: string;
} 
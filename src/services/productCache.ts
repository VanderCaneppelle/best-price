import { Product, ProductFormData } from '../types';

const STORAGE_KEY = 'produtos_cache';

export function getAllProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export function saveProduct(product: Product) {
    const products = getAllProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
        products[index] = product;
    } else {
        products.push(product);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function addProductFromForm(form: ProductFormData & { image?: string }) {
    const products = getAllProducts();
    const newProduct: Product = {
        id: Date.now(),
        name: form.name,
        description: form.description,
        categoryId: Number(form.categoryId),
        prices: {
            mercadoLivre: 0,
            amazon: 0,
            magazineLuiza: 0,
        },
        links: {
            mercadoLivre: form.mercadoLivreLink,
            amazon: form.amazonLink,
            magazineLuiza: form.magazineLuizaLink,
        },
        image: form.image || '',
    };
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return newProduct;
}

export function clearProducts() {
    localStorage.removeItem(STORAGE_KEY);
} 
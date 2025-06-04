import axios from 'axios';

const API_URL = 'http://localhost:4000/api/products';

export async function getProducts() {
    const { data } = await axios.get(API_URL);
    return data;
}

export async function getProductById(id: string) {
    const { data } = await axios.get(`${API_URL}/${id}`);
    return data;
}

export async function createProduct(product: any) {
    const { data } = await axios.post(API_URL, product);
    return data;
}

export async function updateProduct(id: string, product: any) {
    const { data } = await axios.put(`${API_URL}/${id}`, product);
    return data;
}

export async function deleteProduct(id: string) {
    await axios.delete(`${API_URL}/${id}`);
} 
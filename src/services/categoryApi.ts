import axios from 'axios';

const API_URL = 'http://localhost:4000/api/categories';

export async function getCategories() {
    const { data } = await axios.get(API_URL);
    return data;
} 
import axios from 'axios';
import * as cheerio from 'cheerio';

export const scrapeMercadoLivre = async (url: string): Promise<number> => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const priceText = $('.price-tag-fraction').first().text();
        return parseFloat(priceText.replace('.', '').replace(',', '.'));
    } catch (error) {
        console.error('Erro ao fazer scraping do Mercado Livre:', error);
        throw error;
    }
};

export const scrapeAmazon = async (url: string): Promise<number> => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const priceText = $('.a-price-whole').first().text();
        return parseFloat(priceText.replace('.', '').replace(',', '.'));
    } catch (error) {
        console.error('Erro ao fazer scraping da Amazon:', error);
        throw error;
    }
};

export const scrapeShopee = async (url: string): Promise<number> => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const priceText = $('.product-price').first().text();
        return parseFloat(priceText.replace('.', '').replace(',', '.'));
    } catch (error) {
        console.error('Erro ao fazer scraping da Shopee:', error);
        throw error;
    }
};

export const updateProductPrices = async (product: {
    links: {
        mercadoLivre: string;
        amazon: string;
        shopee: string;
    };
}) => {
    try {
        const [mercadoLivrePrice, amazonPrice, shopeePrice] = await Promise.all([
            scrapeMercadoLivre(product.links.mercadoLivre),
            scrapeAmazon(product.links.amazon),
            scrapeShopee(product.links.shopee),
        ]);

        return {
            mercadoLivre: mercadoLivrePrice,
            amazon: amazonPrice,
            shopee: shopeePrice,
        };
    } catch (error) {
        console.error('Erro ao atualizar preços:', error);
        throw error;
    }
}; 
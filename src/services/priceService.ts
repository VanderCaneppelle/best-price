import { ScraperManager } from './ScraperManager';
import { MagazineLuizaScraper } from './scrapers/MagazineLuizaScraper';
import { Product } from '../types';

export class PriceService {
    private scraperManager: ScraperManager;

    constructor() {
        this.scraperManager = new ScraperManager();
        // Adiciona o scraper da Magazine Luiza
        this.scraperManager.addScraper(new MagazineLuizaScraper());
    }

    /**
     * Atualiza os preços de um produto
     * @param product Produto a ter os preços atualizados
     * @returns Promise com o produto atualizado
     */
    async updateProductPrices(product: Product): Promise<Product> {
        try {
            const urls = [
                product.links.mercadoLivre,
                product.links.amazon,
                product.links.magazineLuiza,
            ];

            const results = await this.scraperManager.scrapeMultiplePrices(urls);

            return {
                ...product,
                prices: {
                    mercadoLivre: results[0].price,
                    amazon: results[1].price,
                    magazineLuiza: results[2].price,
                },
            };
        } catch (error) {
            console.error('Erro ao atualizar preços:', error);
            throw error;
        }
    }

    /**
     * Atualiza os preços de múltiplos produtos
     * @param products Array de produtos a ter os preços atualizados
     * @returns Promise com array de produtos atualizados
     */
    async updateMultipleProductsPrices(products: Product[]): Promise<Product[]> {
        return Promise.all(products.map(product => this.updateProductPrices(product)));
    }
}

export async function fetchPriceFromBackend(url: string) {
    const response = await fetch(`http://localhost:4000/scrape?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Erro ao buscar preço');
    return response.json();
} 
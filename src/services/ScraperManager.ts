import { IScraper, ScrapingResult } from './scrapers/IScraper';
import { MercadoLivreScraper } from './scrapers/MercadoLivreScraper';
import { AmazonScraper } from './scrapers/AmazonScraper';
import { ShopeeScraper } from './scrapers/ShopeeScraper';

export class ScraperManager {
    private scrapers: IScraper[];

    constructor() {
        // Inicializa com os scrapers padrão
        this.scrapers = [
            new MercadoLivreScraper(),
            new AmazonScraper(),
            new ShopeeScraper(),
        ];
    }

    /**
     * Adiciona um novo scraper à lista
     * @param scraper Novo scraper a ser adicionado
     */
    addScraper(scraper: IScraper): void {
        this.scrapers.push(scraper);
    }

    /**
     * Encontra o scraper apropriado para a URL fornecida
     * @param url URL do produto
     * @returns Scraper apropriado ou undefined se nenhum for encontrado
     */
    private findScraper(url: string): IScraper | undefined {
        return this.scrapers.find(scraper => scraper.isValidUrl(url));
    }

    /**
     * Extrai o preço de um produto a partir da URL
     * @param url URL do produto
     * @returns Promise com o resultado do scraping
     */
    async scrapePrice(url: string): Promise<ScrapingResult> {
        const scraper = this.findScraper(url);

        if (!scraper) {
            return {
                price: 0,
                currency: 'BRL',
                available: false,
                error: 'Nenhum scraper disponível para esta URL',
            };
        }

        return scraper.scrapePrice(url);
    }

    /**
     * Extrai preços de múltiplos produtos simultaneamente
     * @param urls Array de URLs dos produtos
     * @returns Promise com array de resultados do scraping
     */
    async scrapeMultiplePrices(urls: string[]): Promise<ScrapingResult[]> {
        return Promise.all(urls.map(url => this.scrapePrice(url)));
    }
} 
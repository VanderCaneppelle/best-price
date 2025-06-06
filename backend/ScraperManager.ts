import { IScraper, ScrapingResult } from './scrapers/IScraper';
import { MercadoLivreScraper } from './scrapers/MercadoLivreScraper';
import { AmazonScraper } from './scrapers/AmazonScraper';
import { MagazineLuizaScraper } from './scrapers/MagazineLuizaScraper';

export class ScraperManager {
    private scrapers: IScraper[];

    constructor() {
        this.scrapers = [
            new MercadoLivreScraper(),
            new AmazonScraper(),
            new MagazineLuizaScraper(),
        ];
        console.log('[ScraperManager] Scrapers registrados:', this.scrapers.map(s => s.constructor.name));
    }

    addScraper(scraper: IScraper): void {
        this.scrapers.push(scraper);
    }

    private findScraper(url: string): IScraper | undefined {
        return this.scrapers.find(scraper => scraper.isValidUrl(url));
    }

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

    async scrapeMultiplePrices(urls: string[]): Promise<ScrapingResult[]> {
        return Promise.all(urls.map(url => this.scrapePrice(url)));
    }

    /**
     * Roda todos os scrapers para os links informados (array por marketplace) e retorna o menor preço encontrado para cada marketplace.
     * @param links objeto { mercado_livre: string[], amazon: string[], magalu: string[], shopee: string[] }
     */
    async scrapeAllMarkets(links: Record<string, string[]>): Promise<Record<string, number | null>> {
        const results: Record<string, number | null> = {
            mercado_livre: null,
            amazon: null,
            magalu: null,
            shopee: null,
        };
        for (const [market, urls] of Object.entries(links)) {
            if (Array.isArray(urls) && urls.length > 0) {
                const prices: number[] = [];
                for (const url of urls) {
                    if (typeof url !== 'string' || !url.startsWith('http')) continue; // ignora valores inválidos
                    const result = await this.scrapePrice(url);
                    if (result.price && result.price > 0) prices.push(result.price);
                }
                results[market] = prices.length > 0 ? Math.min(...prices) : null;
            }
        }
        return results;
    }
} 
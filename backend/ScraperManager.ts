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
} 
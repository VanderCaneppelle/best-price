import { BaseScraper } from './BaseScraper';
import { ScrapingResult } from './IScraper';
import puppeteer from 'puppeteer';

export class ShopeeScraper extends BaseScraper {
    constructor() {
        super('Shopee');
    }

    isValidUrl(url: string): boolean {
        return url.includes('shopee.com.br');
    }

    async scrapePrice(url: string): Promise<ScrapingResult> {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Aguarda o seletor do preço aparecer

            await page.waitForSelector('.IZPeQz.B67UQ0', { timeout: 15000 });

            // Extrai o texto do preço
            const priceText = await page.$eval('.IZPeQz.B67UQ0', el => el.textContent || '');

            if (!priceText) {
                return this.createErrorResult('Preço não encontrado na página');
            }

            const price = this.parsePrice(priceText);

            return {
                price,
                currency: 'BRL',
                available: true,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            return this.createErrorResult(`Erro ao fazer scraping (Puppeteer): ${errorMessage}`);
        } finally {
            if (browser) await browser.close();
        }
    }
}
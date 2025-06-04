import { BaseScraper } from './BaseScraper';
import { ScrapingResult } from './IScraper';
import puppeteer from 'puppeteer';

export class MagazineLuizaScraper extends BaseScraper {
    constructor() {
        super('Magazine Luiza');
    }

    isValidUrl(url: string): boolean {
        return url.includes('magazineluiza.com.br');
    }

    async scrapePrice(url: string): Promise<ScrapingResult> {
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080'
                ],
                defaultViewport: { width: 1920, height: 1080 }
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
            });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Aguarda o seletor do preço aparecer
            await page.waitForSelector('p[data-testid="price-value"]', { timeout: 20000 });

            // Extrai o texto do preço
            const priceText = await page.$eval('p[data-testid="price-value"]', el => el.textContent || '');

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
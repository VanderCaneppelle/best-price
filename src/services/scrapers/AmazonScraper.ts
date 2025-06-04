import { BaseScraper } from './BaseScraper';
import { ScrapingResult } from './IScraper';

export class AmazonScraper extends BaseScraper {
    constructor() {
        super('Amazon');
    }

    isValidUrl(url: string): boolean {
        return url.includes('amazon.com.br');
    }

    async scrapePrice(url: string): Promise<ScrapingResult> {
        try {
            const $ = await this.fetchPage(url);

            // Tenta diferentes seletores que podem conter o preço
            const priceSelectors = [
                '.a-price-whole',
                '.a-price .a-offscreen',
                '#priceblock_ourprice',
                '#priceblock_dealprice',
                '.a-color-price',
            ];

            let priceText = '';
            for (const selector of priceSelectors) {
                const element = $(selector).first();
                if (element.length > 0) {
                    priceText = element.text();
                    break;
                }
            }

            if (!priceText) {
                return this.createErrorResult('Preço não encontrado na página');
            }

            const price = this.parsePrice(priceText);

            // Verifica se o produto está disponível
            const unavailableSelectors = [
                '#availability .a-color-price',
                '#outOfStock',
                '#availability .a-color-error',
            ];

            const isUnavailable = unavailableSelectors.some(selector => {
                const element = $(selector);
                return element.length > 0 &&
                    (element.text().toLowerCase().includes('indisponível') ||
                        element.text().toLowerCase().includes('unavailable'));
            });

            return {
                price,
                currency: 'BRL',
                available: !isUnavailable,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            return this.createErrorResult(`Erro ao fazer scraping: ${errorMessage}`);
        }
    }
} 
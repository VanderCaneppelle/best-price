import { BaseScraper } from './BaseScraper';
import { ScrapingResult } from './IScraper';

export class ShopeeScraper extends BaseScraper {
    constructor() {
        super('Shopee');
    }

    isValidUrl(url: string): boolean {
        return url.includes('shopee.com.br');
    }

    async scrapePrice(url: string): Promise<ScrapingResult> {
        try {
            const $ = await this.fetchPage(url);

            // Tenta diferentes seletores que podem conter o preço
            const priceSelectors = [
                '.IZPeQz.B67UQ0', // seletor principal identificado
                '.product-price',
                '.price',
                '.item-price',
                '.price-box',
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
                '.product-status',
                '.stock-status',
                '.availability',
            ];

            const isUnavailable = unavailableSelectors.some(selector => {
                const element = $(selector);
                return element.length > 0 &&
                    (element.text().toLowerCase().includes('esgotado') ||
                        element.text().toLowerCase().includes('indisponível') ||
                        element.text().toLowerCase().includes('out of stock'));
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
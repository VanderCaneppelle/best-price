import { BaseScraper } from './BaseScraper';
import { ScrapingResult } from './IScraper';

export class MagazineLuizaScraper extends BaseScraper {
    constructor() {
        super('Magazine Luiza');
    }

    isValidUrl(url: string): boolean {
        return url.includes('magazineluiza.com.br');
    }

    async scrapePrice(url: string): Promise<ScrapingResult> {
        try {
            const $ = await this.fetchPage(url);

            // Tenta diferentes seletores que podem conter o preço
            const priceSelectors = [
                '.sc-dcJsrY.sc-gTRfYf.kkDNiO', // seletor principal identificado
                '.IZPeQz.B67UQ0', // preço promocional antigo
                '.ZA5sW5',        // preço normal antigo
                '.price-template__text',
                '.price-template',
                '.price-current',
                '.price-value',
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
                '.availability',
                '.stock-status',
                '.product-status',
            ];

            const isUnavailable = unavailableSelectors.some(selector => {
                const element = $(selector);
                return element.length > 0 &&
                    (element.text().toLowerCase().includes('indisponível') ||
                        element.text().toLowerCase().includes('esgotado'));
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
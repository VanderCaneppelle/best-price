import { BaseScraper } from './BaseScraper';
import { ScrapingResult } from './IScraper';

export class MercadoLivreScraper extends BaseScraper {
    constructor() {
        super('Mercado Livre');
    }

    isValidUrl(url: string): boolean {
        console.log('[MercadoLivreScraper] isValidUrl chamada com:', url);
        return url.includes('mercadolivre.com.br') || url.includes('mercadolibre.com.br');
    }

    async scrapePrice(url: string): Promise<ScrapingResult> {
        try {
            const $ = await this.fetchPage(url);
            console.log($.html().slice(0, 2000)); // Mostra os primeiros 2000 caracteres do HTML

            // Tenta diferentes seletores que podem conter o preço
            const priceSelectors = [
                '.price-tag-fraction',
                '.ui-pdp-price__part',
                '.ui-pdp-price',
                '.price-tag',
            ];

            // Novo seletor para páginas de lista
            const listPriceSelector = '.andes-money-amount__fraction';

            // Tenta pegar o preço promocional pelo meta tag
            let priceText = $('meta[itemprop="price"]').attr('content');

            // Se não achar, tenta pegar o preço principal visível
            if (!priceText) {
                priceText = $('.andes-money-amount__fraction').first().text();
            }

            if (!priceText) {
                return this.createErrorResult('Preço não encontrado na página');
            }

            const price = this.parsePrice(priceText);

            // Verifica se o produto está disponível
            const unavailableSelectors = [
                '.ui-pdp-stock-unavailable',
                '.ui-pdp-sold-out',
            ];

            const isUnavailable = unavailableSelectors.some(selector => $(selector).length > 0);

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
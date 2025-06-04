export interface ScrapingResult {
    price: number;
    currency: string;
    available: boolean;
    error?: string;
}

export interface IScraper {
    /**
     * Extrai o preço de um produto a partir da URL fornecida
     * @param url URL do produto
     * @returns Promise com o resultado do scraping
     */
    scrapePrice(url: string): Promise<ScrapingResult>;

    /**
     * Verifica se a URL é válida para este scraper
     * @param url URL a ser validada
     * @returns boolean indicando se a URL é válida
     */
    isValidUrl(url: string): boolean;
} 
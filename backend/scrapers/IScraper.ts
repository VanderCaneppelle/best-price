export interface ScrapingResult {
    price: number;
    currency: string;
    available: boolean;
    error?: string;
}

export interface IScraper {
    scrapePrice(url: string): Promise<ScrapingResult>;
    isValidUrl(url: string): boolean;
} 
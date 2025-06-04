import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { IScraper, ScrapingResult } from './IScraper';

export abstract class BaseScraper implements IScraper {
    protected client: AxiosInstance;
    protected name: string;

    constructor(name: string) {
        this.name = name;
        this.client = axios.create({
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });
    }

    abstract scrapePrice(url: string): Promise<ScrapingResult>;
    abstract isValidUrl(url: string): boolean;

    protected async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
        try {
            const response = await this.client.get(url);
            return cheerio.load(response.data);
        } catch (error) {
            console.error(`Erro ao buscar página em ${this.name}:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            throw new Error(`Falha ao acessar a página: ${errorMessage}`);
        }
    }

    protected parsePrice(priceText: string): number {
        // Remove caracteres não numéricos exceto ponto e vírgula
        const cleanPrice = priceText.replace(/[^\d.,]/g, '');

        // Converte para o formato correto (ex: "1.234,56" -> 1234.56)
        const normalizedPrice = cleanPrice.replace('.', '').replace(',', '.');

        return parseFloat(normalizedPrice);
    }

    protected createErrorResult(error: string): ScrapingResult {
        return {
            price: 0,
            currency: 'BRL',
            available: false,
            error,
        };
    }
} 
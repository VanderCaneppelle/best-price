import { MercadoLivreScraper } from '../services/scrapers/MercadoLivreScraper.js';
import { AmazonScraper } from '../services/scrapers/AmazonScraper.js';
import { ShopeeScraper } from '../services/scrapers/ShopeeScraper.js';
import { MagazineLuizaScraper } from '../services/scrapers/MagazineLuizaScraper.js';

// Função para adicionar delay entre as requisições
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testScraper() {
    console.log('Iniciando testes dos scrapers...\n');

    // URLs de teste (produtos reais)
    const testUrls = {
        mercadoLivre: 'https://www.mercadolivre.com.br/barraca-camping-acampamento-impermeavel-cycling-ultralight-2-pessoas-lglu-silicone-20d-6000mm/p/MLB31045329',
        amazon: 'https://www.amazon.com.br/Fritadeira-Fryer-Forno-Litros-Mondial/dp/B0BZJDLT6Z/ref=zg_bs_c_kitchen_d_sccl_6/142-2294057-7863737',
        shopee: 'https://shopee.com.br/Barraca-Camping-4-Pessoas-3500mm-Impermeavel-Profissional-JOYFOX-Tenda-de-trekking-de-montanha-i.1063922972.18697382313',
        magazineLuiza: 'https://www.magazineluiza.com.br/barraca-iglu-2-pessoas-verde-mor/p/ccg4a44b7d/es/barr/'
    };

    try {
        // Teste individual de cada scraper
        console.log('Testando Mercado Livre...');
        const mlResult = await new MercadoLivreScraper().scrapePrice(testUrls.mercadoLivre);
        console.log('Resultado:', mlResult, '\n');
        await delay(2000); // Espera 2 segundos

        console.log('Testando Amazon...');
        const amazonResult = await new AmazonScraper().scrapePrice(testUrls.amazon);
        console.log('Resultado:', amazonResult, '\n');
        await delay(2000);

        console.log('Testando Shopee...');
        const shopeeResult = await new ShopeeScraper().scrapePrice(testUrls.shopee);
        console.log('Resultado:', shopeeResult, '\n');
        await delay(2000);

        console.log('Testando Magazine Luiza...');
        const mlResult2 = await new MagazineLuizaScraper().scrapePrice(testUrls.magazineLuiza);
        console.log('Resultado:', mlResult2, '\n');
        await delay(2000);

        // Teste de múltiplos preços
        console.log('Testando múltiplos preços...');
        const allResults = await Promise.all([
            new MercadoLivreScraper().scrapePrice(testUrls.mercadoLivre),
            new AmazonScraper().scrapePrice(testUrls.amazon),
            new ShopeeScraper().scrapePrice(testUrls.shopee),
            new MagazineLuizaScraper().scrapePrice(testUrls.magazineLuiza)
        ]);
        console.log('Resultados:', allResults);
    } catch (error) {
        console.error('Erro durante os testes:', error);
    }
}

// Executa o teste
testScraper().catch(error => {
    console.error('Erro durante os testes:', error);
}); 
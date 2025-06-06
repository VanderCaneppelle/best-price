import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Best Price API',
            version: '1.0.0',
            description: 'Documentação da API do comparador de preços',
        },
        servers: [
            {
                url: 'http://localhost:4000/api',
            },
        ],
    },
    apis: ['./controllers/*.ts'], // Caminho dos arquivos com as rotas e docs
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi }; 
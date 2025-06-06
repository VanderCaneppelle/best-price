import { swaggerUi, swaggerSpec } from './swagger';

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 
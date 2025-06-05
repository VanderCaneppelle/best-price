import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, updateProductPrices, createPriceHistorySnapshot, getProductPriceHistory } from '../controllers/productController';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.put('/:id/update-prices', updateProductPrices);
router.post('/price-history/snapshot', createPriceHistorySnapshot);
router.get('/:id/price-history', getProductPriceHistory);

export default router; 
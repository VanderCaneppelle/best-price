import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, updateProductPrices, createPriceHistorySnapshot } from '../controllers/productController';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.put('/:id/update-prices', updateProductPrices);
router.post('/price-history/snapshot', createPriceHistorySnapshot);

export default router; 
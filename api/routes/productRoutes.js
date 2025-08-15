import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    deleteProductPermanently,
    deleteAllProductsPermanently,
    restoreProduct,
    restoreAllProducts,
    getDeletedProducts
} from '../controllers/productController/productController.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

// Protected routes
router.post('/', verifyToken, createProduct);
router.get('/', getAllProducts);
router.get('/deleted', verifyToken, getDeletedProducts);
router.get('/:id', getProductById);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);
router.delete('/:id/permanent', verifyToken, deleteProductPermanently);
router.delete('/delete/all', verifyToken, deleteAllProductsPermanently);
router.put('/:id/restore', verifyToken, restoreProduct);
router.put('/restore/all', verifyToken, restoreAllProducts);

export default router;
import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';
import { getCart, addToCart, removeFromCart, updateCart } from '../controllers/cartController/cartController.js';

const router = express.Router();

router.get('/:userId', verifyToken, getCart);
router.post('/', verifyToken, addToCart);
router.delete('/:userId/:productId', verifyToken, removeFromCart);
router.put('/:userId/:productId', verifyToken, updateCart);

export default router;
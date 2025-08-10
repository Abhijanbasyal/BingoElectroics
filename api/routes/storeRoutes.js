import express from 'express';
import {
  createStore,
  updateStore,
  getAllStores,
  getStoreById,
  deleteStore,
  deleteStorePermanently,
  restoreStore,
  getDeletedStores,
  followStore,
  likeStore,
  rateStore,
  getCurrentUserStore,
} from '../controllers/storeController/storeController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Protected routes
router.post('/', verifyToken, createStore); // Seller/Manager creates store
router.put('/:id', verifyToken, updateStore); // Owner or Admin/Manager updates store
router.get('/', verifyToken, getAllStores); // Get all stores with pagination
router.get('/my-store', verifyToken, getCurrentUserStore); // Get current user's store
router.get('/deleted', verifyToken, getDeletedStores); // Admin/Manager gets deleted stores
router.get('/:id', verifyToken, getStoreById); // Get store by ID
router.delete('/:id', verifyToken, deleteStore); // Admin/Manager soft deletes store
router.delete('/:id/permanent', verifyToken, deleteStorePermanently); // Admin/Manager permanently deletes store
router.put('/:id/restore', verifyToken, restoreStore); // Admin/Manager restores store
router.post('/:id/follow', verifyToken, followStore); // Users follow/unfollow store
router.post('/:id/like', verifyToken, likeStore); // Users like/unlike store
router.post('/:id/rate', verifyToken, rateStore); // Users rate store

export default router;
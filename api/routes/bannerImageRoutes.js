import express from 'express';
import {
  uploadBannerImage,
  getBannerImages,
  getDeletedBannerImages,
  deleteBannerImage,
  permanentDeleteBannerImage,
  restoreBannerImage,
} from '../controllers/bannerImageController.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

router.post('/upload', verifyToken, uploadBannerImage);
router.get('/', getBannerImages);
router.get('/deleted', verifyToken, getDeletedBannerImages);
router.delete('/:id', verifyToken, deleteBannerImage);
router.delete('/:id/permanent', verifyToken, permanentDeleteBannerImage);
router.put('/:id/restore', verifyToken, restoreBannerImage);

export default router;
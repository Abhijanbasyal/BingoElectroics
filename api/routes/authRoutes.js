import express from 'express';
import {
  register,
  login,
  logout,
  editProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deleteUserPermanently,
  restoreUser,
  getDeletedUsers,
  deleteAllUsersPermanently,
  restoreAllUsers,
  getCurrentUser,
  checkUniqueFields
} from '../controllers/authController.js';
import { verifyToken, verifyRole } from '../utils/verifyToken.js';

const router = express.Router();

console.log('Registering auth routes');

// Public routes
router.post('/signup', register); // Updated to /api/auth/signup
router.post('/register/check-unique', verifyToken, verifyRole(['Admin', 'Manager']), checkUniqueFields);
router.post('/login', login); // Updated to /api/auth/login

// Protected routes
router.post('/register', verifyToken, verifyRole(['Admin', 'Manager']), register); // Updated to /api/auth/register
router.get('/current-user', verifyToken, getCurrentUser); // Updated
router.post('/logout', verifyToken, logout); // Updated
router.get('/users', verifyToken, verifyRole(['Admin', 'Manager']), getAllUsers); // Updated
router.get('/users/deleted', verifyToken, verifyRole(['Admin', 'Manager']), getDeletedUsers); // Updated
router.get('/users/:id', verifyToken, verifyRole(['Admin', 'Manager']), getUserById); // Updated
router.put('/users/:id', verifyToken, verifyRole(['Admin', 'Manager']), updateUser); // Updated
router.post('/users/:id/check-unique', verifyToken, verifyRole(['Admin', 'Manager']), checkUniqueFields); // Updated
router.delete('/users/:id', verifyToken, verifyRole(['Admin', 'Manager']), deleteUser); // Updated
router.delete('/users/:id/permanent', verifyToken, verifyRole(['Admin', 'Manager']), deleteUserPermanently); // Updated
router.put('/users/:id/restore', verifyToken, verifyRole(['Admin', 'Manager']), restoreUser); // Updated
router.delete('/users/delete/all', verifyToken, verifyRole('Admin'), deleteAllUsersPermanently); // Updated
router.put('/users/restore/all', verifyToken, verifyRole('Admin'), restoreAllUsers); // Updated
router.put('/edit-profile', verifyToken, editProfile); // Updated

export default router;
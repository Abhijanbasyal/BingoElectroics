import express from 'express';
import {
    register,
    login,
    logout,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    deleteUserPermanently,
    restoreUser,
    getDeletedUsers,
    deleteAllUsersPermanently,
    restoreAllUsers,
    getCurrentUser
} from '../controllers/authController.js';
import { verifyToken, verifyRole } from '../utils/verifyToken.js';

const router = express.Router();

router.get('/current-user', verifyToken, getCurrentUser);
// Public routes
router.post('/register', register);
router.post('/login', login);


// Protected routes
router.post('/logout', verifyToken, logout);
router.get('/users', verifyToken, verifyRole('Admin'), getAllUsers);
router.get('/users/deleted', verifyToken, verifyRole('Admin'), getDeletedUsers);
router.get('/users/:id', verifyToken, getUserById);
router.put('/users/:id', verifyToken, updateUser);
router.delete('/users/:id', verifyToken, verifyRole('Admin'), deleteUser);
router.delete('/users/:id/permanent', verifyToken, verifyRole('Admin'), deleteUserPermanently);
router.put('/users/:id/restore', verifyToken, verifyRole('Admin'), restoreUser);
router.delete('/users/delete/all', verifyToken, verifyRole('Admin'), deleteAllUsersPermanently);
router.put('/users/restore/all', verifyToken, verifyRole('Admin'), restoreAllUsers);

export default router;
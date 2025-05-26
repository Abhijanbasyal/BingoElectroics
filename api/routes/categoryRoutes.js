import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  deleteCategoryPermanently,
  deleteAllCategoriesPermanently,
  restoreCategory,
  restoreAllCategories,
  getDeletedCategories,
} from "../controllers/categoryController/categoryController.js";
import { verifyToken, verifyRole } from "../utils/verifyToken.js";

const router = express.Router();

// Protected routes (Manager/Admin only)
router.post("/", verifyToken, createCategory); //verifyRole(['Manager', 'Admin'])  --back-end logic for handling roles 
router.get("/", verifyToken, getAllCategories); 
router.get("/deleted", verifyToken, getDeletedCategories); 
router.get("/:id", verifyToken, getCategoryById); 
router.put("/:id", verifyToken, updateCategory); 
router.delete("/:id", verifyToken, deleteCategory); 
router.delete("/:id/permanent", verifyToken, deleteCategoryPermanently); 
router.delete("/delete/all", verifyToken, deleteAllCategoriesPermanently); 
router.put("/:id/restore", verifyToken, restoreCategory); 
router.put("/restore/all", verifyToken, restoreAllCategories); 

export default router;

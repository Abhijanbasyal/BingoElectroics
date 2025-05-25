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
router.get("/", verifyToken, getAllCategories); //verifyRole(['Manager', 'Admin']) --back-end logic for handling roles 
router.get("/deleted", verifyToken, getDeletedCategories); //verifyRole(['Manager', 'Admin']) --back-end logic for handling roles 
router.get("/:id", verifyToken, getCategoryById); //verifyRole(['Manager', 'Admin']) --back-end logic for handling roles 
router.put("/:id", verifyToken, updateCategory); //verifyRole(['Manager', 'Admin']) --back-end logic for handling roles 
router.delete("/:id", verifyToken, deleteCategory); //verifyRole(['Manager', 'Admin']) --back-end logic for handling roles 
router.delete("/:id/permanent", verifyToken, deleteCategoryPermanently); //verifyRole(['Manager', 'Admin']) --back-end logic for handling roles 
router.delete("/delete/all", verifyToken, deleteAllCategoriesPermanently); //verifyRole(['Manager', 'Admin']) --back-end logic for handling roles 
router.put("/:id/restore", verifyToken, restoreCategory); //verifyRole(['Manager', 'Admin']) --back-end logic for handling roles 
router.put("/restore/all", verifyToken, restoreAllCategories); //verifyRole(['Manager', 'Admin']) --back-end logic for handling roles 

export default router;

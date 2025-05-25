import Category from "../../models/category/Category.js";
import { errorHandler } from "../../utils/error.js";

// Create a new category (Manager/Admin only)
export const createCategory = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can create categories"));
        }

        const { title, description } = req.body;

        if (!title) {
            return next(errorHandler(400, "Title is required"));
        }

        const newCategory = new Category({
            title,
            description,
            createdBy: req.user.id,
            modifiedBy: req.user.id,
            createdDate: new Date(),
            modifiedDate: new Date()
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category: newCategory
        });
    } catch (error) {
        next(error);
    }
};

// Get all categories
export const getAllCategories = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can view categories"));
        }

        const categories = await Category.find({ isDeleted: false })
            .populate('createdBy', 'username')
            .populate('modifiedBy', 'username');

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        next(error);
    }
};

// Get category by ID
export const getCategoryById = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can view categories"));
        }

        const category = await Category.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('modifiedBy', 'username');

        if (!category || category.isDeleted) {
            return next(errorHandler(404, "Category not found"));
        }

        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        next(error);
    }
};

// Update category (Manager/Admin only)
export const updateCategory = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can update categories"));
        }

        const { title, description } = req.body;

        const updateData = {
            title,
            description,
            modifiedBy: req.user.id,
            modifiedDate: new Date()
        };

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('createdBy', 'username')
         .populate('modifiedBy', 'username');

        if (!updatedCategory || updatedCategory.isDeleted) {
            return next(errorHandler(404, "Category not found"));
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory
        });
    } catch (error) {
        next(error);
    }
};

// Soft delete category (Manager/Admin only)
export const deleteCategory = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can delete categories"));
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { 
                isDeleted: true,
                deletedDate: new Date(),
                modifiedBy: req.user.id,
                modifiedDate: new Date()
            },
            { new: true }
        ).populate('createdBy', 'username')
         .populate('modifiedBy', 'username');

        if (!category) {
            return next(errorHandler(404, "Category not found"));
        }

        res.status(200).json({
            success: true,
            message: "Category marked as deleted",
            category
        });
    } catch (error) {
        next(error);
    }
};

// Permanently delete category (Manager/Admin only)
export const deleteCategoryPermanently = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can permanently delete categories"));
        }

        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return next(errorHandler(404, "Category not found"));
        }

        res.status(200).json({
            success: true,
            message: "Category permanently deleted"
        });
    } catch (error) {
        next(error);
    }
};

// Permanently delete all deleted categories (Manager/Admin only)
export const deleteAllCategoriesPermanently = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can perform this action"));
        }

        const result = await Category.deleteMany({ isDeleted: true });

        res.status(200).json({
            success: true,
            message: `Permanently deleted ${result.deletedCount} categories`
        });
    } catch (error) {
        next(error);
    }
};

// Restore category (Manager/Admin only)
export const restoreCategory = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can restore categories"));
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { 
                isDeleted: false,
                deletedDate: null,
                modifiedBy: req.user.id,
                modifiedDate: new Date()
            },
            { new: true }
        ).populate('createdBy', 'username')
         .populate('modifiedBy', 'username');

        if (!category) {
            return next(errorHandler(404, "Category not found"));
        }

        res.status(200).json({
            success: true,
            message: "Category restored successfully",
            category
        });
    } catch (error) {
        next(error);
    }
};

// Restore all deleted categories (Manager/Admin only)
export const restoreAllCategories = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can perform this action"));
        }

        const result = await Category.updateMany(
            { isDeleted: true },
            { 
                isDeleted: false,
                deletedDate: null,
                modifiedBy: req.user.id,
                modifiedDate: new Date()
            }
        );

        res.status(200).json({
            success: true,
            message: `Restored ${result.modifiedCount} categories`
        });
    } catch (error) {
        next(error);
    }
};

// Get all deleted categories (Manager/Admin only)
export const getDeletedCategories = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can view deleted categories"));
        }

        const categories = await Category.find({ isDeleted: true })
            .populate('createdBy', 'username')
            .populate('modifiedBy', 'username');

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        next(error);
    }
};
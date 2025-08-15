import Category from "../../models/category/Category.js";
import { errorHandler } from "../../utils/error.js";
import dotenv from 'dotenv';


dotenv.config();



const pagelimitForData = process.env.DATA_FETCH_PAGE_LIMIT || 10;

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
        // if (!['Manager', 'Admin'].includes(req.user.roles)) {
        //     return next(errorHandler(403, "Only Manager or Admin can view categories"));
        // }

        const page = parseInt(req.query.page) || 1;
        const limit = pagelimitForData;
        const skip = (page - 1) * limit;

        const totalCategories = await Category.countDocuments({ isDeleted: false });
        const categories = await Category.find({ isDeleted: false })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'username')
            .populate('modifiedBy', 'username');

        res.status(200).json({
            success: true,
            count: categories.length,
            totalCategories,
            page,
            totalPages: Math.ceil(totalCategories / limit),
            categories
        });
    } catch (error) {
        next(error);
    }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update category (Manager/Admin only)
export const updateCategory = async (req, res, next) => {
  try {
    if (!['Manager', 'Admin'].includes(req.user.roles)) {
      return next(errorHandler(403, 'Only Manager or Admin can update categories'));
    }

    const { title, description } = req.body;

    if (!title?.trim()) {
      return next(errorHandler(400, 'Category title is required'));
    }

    const updateData = {
      title: title.trim(),
      description: description?.trim() || '',
      modifiedBy: req.user.id,
      modifiedDate: new Date(),
    };

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username').populate('modifiedBy', 'username');

    if (!updatedCategory) {
      return next(errorHandler(404, 'Category not found or is deleted'));
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      keyValue: error.keyValue,
    });
    if (error.name === 'ValidationError') {
      return next(errorHandler(400, error.message));
    }
    if (error.code === 11000) {
      const field = error.keyValue ? Object.keys(error.keyValue)[0] : 'unknown';
      return next(errorHandler(400, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`));
    }
    next(errorHandler(500, 'Internal server error'));
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

// Get all deleted categories with pagination (Manager/Admin only)
export const getDeletedCategories = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can view deleted categories"));
        }

        const page = parseInt(req.query.page) || 1;
        const limit = pagelimitForData;
        const skip = (page - 1) * limit;

        const totalDeletedCategories = await Category.countDocuments({ isDeleted: true });
        const categories = await Category.find({ isDeleted: true })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'username')
            .populate('modifiedBy', 'username');

        res.status(200).json({
            success: true,
            count: categories.length,
            totalDeletedCategories,
            page,
            totalPages: Math.ceil(totalDeletedCategories / limit),
            categories
        });
    } catch (error) {
        next(error);
    }
};
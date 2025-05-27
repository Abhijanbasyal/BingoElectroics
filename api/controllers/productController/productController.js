import Product from "../../models/products/Product.js";
import { errorHandler } from "../../utils/error.js";
import dotenv from 'dotenv';

dotenv.config();

const pagelimitForData = process.env.DATA_FETCH_PAGE_LIMIT || 10;

// Create a new product (Seller/Manager/Admin)
export const createProduct = async (req, res, next) => {
    try {
        // if (!['Seller', 'Manager', 'Admin'].includes(req.user.roles)) {
        //     return next(errorHandler(403, "Only Seller, Manager, or Admin can create products"));
        // }

        const { title, description, images, price, loyaltyPoints, productQuantity, category } = req.body;

        if (!title || !price || !productQuantity || !category) {
            return next(errorHandler(400, "Title, price, product quantity, and category are required"));
        }

        const newProduct = new Product({
            title,
            description,
            images: images || [], // Expecting an array of image URLs
            price,
            loyaltyPoints,
            productQuantity,
            category,
            createdBy: req.user.id,
            modifiedBy: req.user.id,
            createdDate: new Date(),
            modifiedDate: new Date()
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product: newProduct
        });
    } catch (error) {
        next(error);
    }
};

// Update product (Seller/Manager/Admin)
export const updateProduct = async (req, res, next) => {
    try {
        if (!['Seller', 'Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Seller, Manager, or Admin can update products"));
        }

        const { title, description, images, price, loyaltyPoints, productQuantity, category } = req.body;

        const updateData = {
            title,
            description,
            images: images || [], // Update with new array of image URLs
            price,
            loyaltyPoints,
            productQuantity,
            category,
            modifiedBy: req.user.id,
            modifiedDate: new Date()
        };

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('category', 'title')
         .populate('createdBy', 'username')
         .populate('modifiedBy', 'username');

        if (!updatedProduct) {
            return next(errorHandler(404, "Product not found"));
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        next(error);
    }
};

// Get all products with pagination
export const getAllProducts = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can view all products"));
        }

        const page = parseInt(req.query.page) || 1;
        const limit = pagelimitForData;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments({ isDeleted: false });
        const products = await Product.find({ isDeleted: false })
            .skip(skip)
            .limit(limit)
            .populate('category', 'title')
            .populate('createdBy', 'username')
            .populate('modifiedBy', 'username');

        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            page,
            totalPages: Math.ceil(totalProducts / limit),
            products
        });
    } catch (error) {
        next(error);
    }
};

// Get product by ID
export const getProductById = async (req, res, next) => {
    try {
        if (!['Seller', 'Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Seller, Manager, or Admin can view products"));
        }

        const product = await Product.findOne({ _id: req.params.id, isDeleted: false })
            .populate('category', 'title')
            .populate('createdBy', 'username')
            .populate('modifiedBy', 'username');

        if (!product) {
            return next(errorHandler(404, "Product not found"));
        }

        res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// Soft delete product (Manager/Admin only)
export const deleteProduct = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can delete products"));
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { 
                isDeleted: true,
                deletedDate: new Date(),
                modifiedBy: req.user.id,
                modifiedDate: new Date()
            },
            { new: true }
        ).populate('category', 'title')
         .populate('createdBy', 'username')
         .populate('modifiedBy', 'username');

        if (!product) {
            return next(errorHandler(404, "Product not found"));
        }

        res.status(200).json({
            success: true,
            message: "Product marked as deleted",
            product
        });
    } catch (error) {
        next(error);
    }
};

// Permanently delete product (Manager/Admin only)
export const deleteProductPermanently = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can permanently delete products"));
        }

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return next(errorHandler(404, "Product not found"));
        }

        res.status(200).json({
            success: true,
            message: "Product permanently deleted"
        });
    } catch (error) {
        next(error);
    }
};

// Permanently delete all deleted products (Manager/Admin only)
export const deleteAllProductsPermanently = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can perform this action"));
        }

        const result = await Product.deleteMany({ isDeleted: true });

        res.status(200).json({
            success: true,
            message: `Permanently deleted ${result.deletedCount} products`
        });
    } catch (error) {
        next(error);
    }
};

// Restore product (Manager/Admin only)
export const restoreProduct = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can restore products"));
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { 
                isDeleted: false,
                deletedDate: null,
                modifiedBy: req.user.id,
                modifiedDate: new Date()
            },
            { new: true }
        ).populate('category', 'title')
         .populate('createdBy', 'username')
         .populate('modifiedBy', 'username');

        if (!product) {
            return next(errorHandler(404, "Product not found"));
        }

        res.status(200).json({
            success: true,
            message: "Product restored successfully",
            product
        });
    } catch (error) {
        next(error);
    }
};

// Restore all deleted products (Manager/Admin only)
export const restoreAllProducts = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can perform this action"));
        }

        const result = await Product.updateMany(
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
            message: `Restored ${result.modifiedCount} products`
        });
    } catch (error) {
        next(error);
    }
};

// Get all deleted products with pagination (Manager/Admin only)
export const getDeletedProducts = async (req, res, next) => {
    try {
        if (!['Manager', 'Admin'].includes(req.user.roles)) {
            return next(errorHandler(403, "Only Manager or Admin can view deleted products"));
        }

        const page = parseInt(req.query.page) || 1;
        const limit = pagelimitForData;
        const skip = (page - 1) * limit;

        const totalDeletedProducts = await Product.countDocuments({ isDeleted: true });
        const products = await Product.find({ isDeleted: true })
            .skip(skip)
            .limit(limit)
            .populate('category', 'title')
            .populate('createdBy', 'username')
            .populate('modifiedBy', 'username');

        res.status(200).json({
            success: true,
            count: products.length,
            totalDeletedProducts,
            page,
            totalPages: Math.ceil(totalDeletedProducts / limit),
            products
        });
    } catch (error) {
        next(error);
    }
};
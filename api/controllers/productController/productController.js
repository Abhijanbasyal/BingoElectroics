import Product from "../../models/products/Product.js";
import { errorHandler } from "../../utils/error.js";
import dotenv from 'dotenv';

dotenv.config();

const pagelimitForData = process.env.DATA_FETCH_PAGE_LIMIT || 10;

// Calculate loyalty points based on price (price / 100)
const calculateLoyaltyPoints = (price) => {
    return Math.floor(price / 100);
};

// Create a new product (Seller/Manager/Admin)
export const createProduct = async (req, res, next) => {
    try {
        const { title, description, images, price, productQuantity, category } = req.body;

        if (!title || !price || !productQuantity || !category) {
            return next(errorHandler(400, "Title, price, product quantity, and category are required"));
        }

        const newProduct = new Product({
            title,
            description,
            images: images || [],
            price,
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

        const { title, description, images, price, productQuantity, category } = req.body;

        const updateData = {
            title,
            description,
            images: images || [],
            price,
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
        const product = await Product.findOne({ _id: req.params.id, isDeleted: false })
            .populate('category', 'title')
            .populate('createdBy', 'username')
            .populate('modifiedBy', 'username')
            .populate('comments.userId', 'name')
            .lean();

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

// Increment product view
export const incrementProductView = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (!product.viewedBy.includes(userId)) {
            product.views += 1;
            product.viewedBy.push(userId);
            await product.save();
        }

        res.status(200).json({ views: product.views });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const featuredProducts = await Product.find()
            .sort({ views: -1 })
            .limit(5)
            .select('_id title price images category description views bought');
        res.status(200).json(featuredProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update product bought count and calculate loyalty points
export const updateProductBought = async (productId, userId) => {
    try {
        const product = await Product.findById(productId);
        if (product) {
            product.bought += 1;
            await product.save();

            // Calculate loyalty points (price / 100)
            const loyaltyPoints = calculateLoyaltyPoints(product.price);

            // Update user's loyalty points (assuming User model has a points field)
            const User = mongoose.model('User');
            await User.findByIdAndUpdate(userId, {
                $inc: { points: loyaltyPoints }
            });
        }
    } catch (error) {
        console.error('Error updating bought count or loyalty points:', error);
    }
};
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { errorHandler } from "../utils/error.js";
import dotenv from "dotenv";

dotenv.config();

const pagelimitForData = process.env.DATA_FETCH_PAGE_LIMIT || 10;

// Create a new store (Seller/Manager only, one store per user)
export const createStore = async (req, res, next) => {
  try {
    if (!["Seller", "Manager"].includes(req.user.roles)) {
      return next(errorHandler(403, "Only Seller or Manager can create a store"));
    }

    const { name, description, email, phoneNumber, address } = req.body;

    if (!name || !email || !address || !address.street || !address.city || !address.state || !address.postalCode || !address.country) {
      return next(errorHandler(400, "Store name, email, and complete address are required"));
    }

    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: req.user.id });
    if (existingStore) {
      return next(errorHandler(400, "You can only create one store"));
    }

    // Check if store name is unique
    const storeNameExists = await Store.findOne({ name });
    if (storeNameExists) {
      return next(errorHandler(400, "Store name already exists"));
    }

    const newStore = new Store({
      name,
      description,
      email,
      phoneNumber,
      address,
      owner: req.user.id,
      createdDate: new Date(),
      modifiedBy: req.user.id,
      modifiedDate: new Date(),
    });

    await newStore.save();

    res.status(201).json({
      success: true,
      message: "Store created successfully",
      store: newStore,
    });
  } catch (error) {
    console.error("Create store error:", error);
    if (error.name === "ValidationError") {
      return next(errorHandler(400, error.message));
    }
    next(error);
  }
};

// Update store (Owner or Admin/Manager)
export const updateStore = async (req, res, next) => {
  try {
    const { name, description, email, phoneNumber, address } = req.body;
    const storeId = req.params.id;
    const isAdminOrManager = ["Admin", "Manager"].includes(req.user.roles);

    const store = await Store.findById(storeId);
    if (!store) {
      return next(errorHandler(404, "Store not found"));
    }

    // Only allow owner or Admin/Manager to update
    if (store.owner.toString() !== req.user.id && !isAdminOrManager) {
      return next(errorHandler(403, "You are not authorized to update this store"));
    }

    const updateData = {
      name,
      description,
      email,
      phoneNumber,
      address,
      modifiedBy: req.user.id,
      modifiedDate: new Date(),
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    // Check if store name is unique (if changed)
    if (name && name !== store.name) {
      const storeNameExists = await Store.findOne({ name });
      if (storeNameExists) {
        return next(errorHandler(400, "Store name already exists"));
      }
    }

    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("owner", "username");

    if (!updatedStore) {
      return next(errorHandler(404, "Store not found"));
    }

    res.status(200).json({
      success: true,
      message: "Store updated successfully",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Update store error:", error);
    if (error.name === "ValidationError") {
      return next(errorHandler(400, error.message));
    }
    next(error);
  }
};

// Get all stores with pagination
export const getAllStores = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = pagelimitForData;
    const skip = (page - 1) * limit;

    const totalStores = await Store.countDocuments({ isDeleted: false });
    const stores = await Store.find({ isDeleted: false })
      .skip(skip)
      .limit(limit)
      .populate("owner", "username")
      .populate("products", "title");

    res.status(200).json({
      success: true,
      count: stores.length,
      totalStores,
      page,
      totalPages: Math.ceil(totalStores / limit),
      stores,
    });
  } catch (error) {
    console.error("Get all stores error:", error);
    next(error);
  }
};

// Get store by ID
export const getStoreById = async (req, res, next) => {
  try {
    const store = await Store.findOne({ _id: req.params.id, isDeleted: false })
      .populate("owner", "username")
      .populate("products", "title price images")
      .populate("ratings.userId", "username");

    if (!store) {
      return next(errorHandler(404, "Store not found"));
    }

    res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    console.error("Get store by ID error:", error);
    next(error);
  }
};

// Soft delete store (Admin/Manager only)
export const deleteStore = async (req, res, next) => {
  try {
    if (!["Admin", "Manager"].includes(req.user.roles)) {
      return next(errorHandler(403, "Only Admin or Manager can delete stores"));
    }

    const store = await Store.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        modifiedBy: req.user.id,
        modifiedDate: new Date(),
      },
      { new: true }
    ).populate("owner", "username");

    if (!store) {
      return next(errorHandler(404, "Store not found"));
    }

    // Soft delete associated products
    await Product.updateMany(
      { store: req.params.id, isDeleted: false },
      {
        isDeleted: true,
        deletedDate: new Date(),
        modifiedBy: req.user.id,
        modifiedDate: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: "Store and associated products marked as deleted",
      store,
    });
  } catch (error) {
    console.error("Delete store error:", error);
    next(error);
  }
};

// Permanently delete store (Admin/Manager only)
export const deleteStorePermanently = async (req, res, next) => {
  try {
    if (!["Admin", "Manager"].includes(req.user.roles)) {
      return next(errorHandler(403, "Only Admin or Manager can permanently delete stores"));
    }

    const store = await Store.findByIdAndDelete(req.params.id);

    if (!store) {
      return next(errorHandler(404, "Store not found"));
    }

    // Permanently delete associated products
    await Product.deleteMany({ store: req.params.id });

    res.status(200).json({
      success: true,
      message: "Store and associated products permanently deleted",
    });
  } catch (error) {
    console.error("Permanently delete store error:", error);
    next(error);
  }
};

// Restore store (Admin/Manager only)
export const restoreStore = async (req, res, next) => {
  try {
    if (!["Admin", "Manager"].includes(req.user.roles)) {
      return next(errorHandler(403, "Only Admin or Manager can restore stores"));
    }

    const store = await Store.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: false,
        modifiedBy: req.user.id,
        modifiedDate: new Date(),
      },
      { new: true }
    ).populate("owner", "username");

    if (!store) {
      return next(errorHandler(404, "Store not found"));
    }

    // Restore associated products
    await Product.updateMany(
      { store: req.params.id, isDeleted: true },
      {
        isDeleted: false,
        deletedDate: null,
        modifiedBy: req.user.id,
        modifiedDate: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: "Store and associated products restored successfully",
      store,
    });
  } catch (error) {
    console.error("Restore store error:", error);
    next(error);
  }
};

// Get all deleted stores with pagination (Admin/Manager only)
export const getDeletedStores = async (req, res, next) => {
  try {
    if (!["Admin", "Manager"].includes(req.user.roles)) {
      return next(errorHandler(403, "Only Admin or Manager can view deleted stores"));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = pagelimitForData;
    const skip = (page - 1) * limit;

    const totalDeletedStores = await Store.countDocuments({ isDeleted: true });
    const stores = await Store.find({ isDeleted: true })
      .skip(skip)
      .limit(limit)
      .populate("owner", "username")
      .populate("products", "title");

    res.status(200).json({
      success: true,
      count: stores.length,
      totalDeletedStores,
      page,
      totalPages: Math.ceil(totalDeletedStores / limit),
      stores,
    });
  } catch (error) {
    console.error("Get deleted stores error:", error);
    next(error);
  }
};

// Follow/Unfollow store
export const followStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return next(errorHandler(404, "Store not found"));
    }

    const userId = req.user.id;
    const isFollowing = store.followers.includes(userId);

    if (isFollowing) {
      store.followers = store.followers.filter((id) => id.toString() !== userId);
    } else {
      store.followers.push(userId);
    }

    await store.save();

    res.status(200).json({
      success: true,
      message: isFollowing ? "Unfollowed store" : "Followed store",
      followersCount: store.followers.length,
    });
  } catch (error) {
    console.error("Follow store error:", error);
    next(error);
  }
};

// Like/Unlike store
export const likeStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return next(errorHandler(404, "Store not found"));
    }

    const userId = req.user.id;
    const isLiked = store.likes.includes(userId);

    if (isLiked) {
      store.likes = store.likes.filter((id) => id.toString() !== userId);
    } else {
      store.likes.push(userId);
    }

    await store.save();

    res.status(200).json({
      success: true,
      message: isLiked ? "Unliked store" : "Liked store",
      likesCount: store.likes.length,
    });
  } catch (error) {
    console.error("Like store error:", error);
    next(error);
  }
};

// Rate store
export const rateStore = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return next(errorHandler(400, "Rating must be between 1 and 5"));
    }

    const store = await Store.findById(req.params.id);
    if (!store) {
      return next(errorHandler(404, "Store not found"));
    }

    const userId = req.user.id;
    const existingRating = store.ratings.find((r) => r.userId.toString() === userId);

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.createdDate = new Date();
    } else {
      store.ratings.push({ userId, rating, comment });
    }

    // Calculate average rating
    const totalRatings = store.ratings.length;
    const sumRatings = store.ratings.reduce((sum, r) => sum + r.rating, 0);
    store.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    await store.save();

    res.status(200).json({
      success: true,
      message: existingRating ? "Rating updated" : "Rating added",
      averageRating: store.averageRating,
    });
  } catch (error) {
    console.error("Rate store error:", error);
    next(error);
  }
};

// Get current user's store
export const getCurrentUserStore = async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user.id, isDeleted: false })
      .populate("owner", "username")
      .populate("products", "title price images");

    if (!store) {
      return next(errorHandler(404, "Store not found"));
    }

    res.status(200).json({
      success: true,
      store,
    });
  } catch (error) {
    console.error("Get current user store error:", error);
    next(error);
  }
};
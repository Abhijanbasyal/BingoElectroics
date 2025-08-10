import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
} from "../helpers/passwordSecurity.js";
import {
  validateRegistration,
  validateUserUpdate,
  getPointsRank,
} from "../helpers/validators.js";
import dotenv from "dotenv";

dotenv.config();

const pagelimitForData = process.env.DATA_FETCH_PAGE_LIMIT || 10;

// Register a new user
export const register = async (req, res, next) => {
  try {
    if (!req.body || !req.body.username || !req.body.password || !req.body.email || !req.body.firstName || !req.body.lastName || !req.body.permanentAddress) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
    const { firstName, lastName, username, email, phoneNumber, password, roles, profilePicture, permanentAddress, additionalAddresses } = req.body;

    // Validate input
    try {
      validateRegistration({ username, email, password });
    } catch (validationError) {
      return next(errorHandler(400, validationError.message));
    }

    // Check password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      return next(
        errorHandler(400, "Password does not meet requirements", {
          requirements: passwordCheck.requirements,
        })
      );
    }

    // Check if email or phoneNumber exists
    const existingQuery = { $or: [{ email }] };
    if (phoneNumber) {
      existingQuery.$or.push({ phoneNumber });
    }
    const existingUser = await User.findOne(existingQuery);
    if (existingUser) {
      return next(errorHandler(400, "Email or phone number already exists"));
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      password: await hashPassword(password),
      roles: roles || "Customer",
      profilePicture: profilePicture || '',
      permanentAddress,
      additionalAddresses: additionalAddresses || []
    });

    await newUser.save();

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return next(errorHandler(400, error.message));
    }
    return next(errorHandler(500, 'Internal server error during registration'));
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phoneNumber: identifier }],
      isDeleted: false 
    });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return next(errorHandler(400, "Invalid credentials"));
    }

    const token = jwt.sign(
      { id: user._id, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: userWithoutPassword,
      });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Edit current user's profile
export const editProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, username, profilePicture, permanentAddress, additionalAddresses } = req.body;
    const userId = req.user.id; // Get user ID from JWT

    // Only allow non-admin fields
    const updateData = { firstName, lastName, username, profilePicture, permanentAddress, additionalAddresses };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Validate input
    try {
      validateUserUpdate(updateData, false); // false indicates non-admin
    } catch (validationError) {
      return next(errorHandler(400, validationError.message));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error('Edit profile error:', error);
    if (error.name === 'ValidationError') {
      return next(errorHandler(400, error.message));
    }
    next(error);
  }
};

// Update user (Admin only)
export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, phoneNumber, roles, points, password, profilePicture, permanentAddress, additionalAddresses } = req.body;
    const isAdmin = req.user.roles === "Admin";
    const userId = req.params.id;

    // Restrict non-admin users to updating only allowed fields
    const allowedFields = { firstName, lastName, username, profilePicture, permanentAddress, additionalAddresses };
    const updateData = isAdmin
      ? { firstName, lastName, username, email, phoneNumber, roles, points, profilePicture, permanentAddress, additionalAddresses }
      : allowedFields;

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    // Validate input
    try {
      validateUserUpdate(updateData, isAdmin);
    } catch (validationError) {
      return next(errorHandler(400, validationError.message));
    }

    // Handle password update (for all users)
    if (password) {
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.isValid) {
        return next(
          errorHandler(400, "Password does not meet requirements", {
            requirements: passwordCheck.requirements,
          })
        );
      }
      updateData.password = await hashPassword(password);
    }

    // Update pointsRank if points are updated (admin only)
    if (isAdmin && points !== undefined) {
      updateData.pointsRank = getPointsRank(points);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      return next(errorHandler(400, error.message));
    }
    next(error);
  }
};

// Logout user
export const logout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};

// Get all users with pagination (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = pagelimitForData;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments({ isDeleted: false });
    const users = await User.find({ isDeleted: false })
      .skip(skip)
      .limit(limit)
      .select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    next(error);
  }
};

// Soft delete user
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.roles !== "Admin") {
      return next(errorHandler(403, "Only admin can delete users"));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "User marked as deleted",
      user,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    next(error);
  }
};

// Permanently delete user
export const deleteUserPermanently = async (req, res, next) => {
  try {
    if (req.user.roles !== "Admin") {
      return next(errorHandler(403, "Only admin can permanently delete users"));
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "User permanently deleted",
    });
  } catch (error) {
    console.error('Permanently delete user error:', error);
    next(error);
  }
};

// Restore user
export const restoreUser = async (req, res, next) => {
  try {
    if (req.user.roles !== "Admin") {
      return next(errorHandler(403, "Only admin can restore users"));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "User restored successfully",
      user,
    });
  } catch (error) {
    console.error('Restore user error:', error);
    next(error);
  }
};

// Get all deleted users with pagination
export const getDeletedUsers = async (req, res, next) => {
  try {
    if (req.user.roles !== "Admin") {
      return next(errorHandler(403, "Only admin can view deleted users"));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = pagelimitForData;
    const skip = (page - 1) * limit;

    const totalDeletedUsers = await User.countDocuments({ isDeleted: true });
    const users = await User.find({ isDeleted: true })
      .skip(skip)
      .limit(limit)
      .select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      totalDeletedUsers,
      page,
      totalPages: Math.ceil(totalDeletedUsers / limit),
      users,
    });
  } catch (error) {
    console.error('Get deleted users error:', error);
    next(error);
  }
};

// Delete all users permanently (Admin only)
export const deleteAllUsersPermanently = async (req, res, next) => {
  try {
    if (req.user.roles !== "Admin") {
      return next(errorHandler(403, "Only admin can perform this action"));
    }

    const result = await User.deleteMany({ isDeleted: true });

    res.status(200).json({
      success: true,
      message: `Permanently deleted ${result.deletedCount} users`,
    });
  } catch (error) {
    console.error('Delete all users permanently error:', error);
    next(error);
  }
};

// Restore all deleted users (Admin only)
export const restoreAllUsers = async (req, res, next) => {
  try {
    if (req.user.roles !== "Admin") {
      return next(errorHandler(403, "Only admin can perform this action"));
    }

    const result = await User.updateMany(
      { isDeleted: true },
      { isDeleted: false }
    );

    res.status(200).json({
      success: true,
      message: `Restored ${result.modifiedCount} users`,
    });
  } catch (error) {
    console.error('Restore all users error:', error);
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return next(errorHandler(404, "User not found"));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};
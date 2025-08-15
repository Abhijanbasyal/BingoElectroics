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
    console.log('Signup request body:', req.body);
    if (
      !req.body ||
      !req.body.username ||
      !req.body.password ||
      !req.body.email ||
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.phoneNumber ||
      !req.body.permanentAddress
    ) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }
    const { firstName, lastName, username, email, phoneNumber, password, roles, profilePicture, permanentAddress, additionalAddresses } = req.body;

    // For protected /register route, check Manager restrictions
    if (req.user && req.user.roles === "Manager" && ["Admin", "Manager"].includes(roles)) {
      return next(errorHandler(403, "Managers cannot create users with Admin or Manager roles"));
    }

    try {
      validateRegistration({ username, email, password, phoneNumber });
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return next(validationError);
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      console.error('Password validation failed:', passwordCheck.requirements);
      return next(
        errorHandler(400, "Password does not meet requirements", {
          requirements: passwordCheck.requirements,
        })
      );
    }

    // Check email and phoneNumber for uniqueness
    const existingQuery = { $or: [{ email }, { phoneNumber }], isDeleted: false };
    const existingUser = await User.findOne(existingQuery);
    if (existingUser) {
      console.log('Existing user found:', existingUser.email);
      return next(errorHandler(400, "Email or phone number already exists"));
    }

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
      additionalAddresses: additionalAddresses || [],
    });

    console.log('Attempting to save new user:', newUser);
    await newUser.save();
    console.log('User saved successfully:', newUser._id);

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    // Skip token and cookie for Admin/Manager (req.user exists)
    if (req.user) {
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: userWithoutPassword,
      });
    }

    // Generate token and set cookie for public signup
    const token = jwt.sign(
      { id: newUser._id, roles: newUser.roles },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        user: userWithoutPassword,
        token,
      });
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyValue: error.keyValue,
    });
    if (error.name === 'ValidationError') {
      return next(errorHandler(400, error.message));
    }
    if (error.code === 11000) {
      const field = error.keyValue ? Object.keys(error.keyValue)[0] : 'unknown';
      console.error(`Duplicate key error on field: ${field}`, error.keyValue);
      return next(errorHandler(400, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`));
    }
    return next(errorHandler(500, 'Internal server error during registration', { details: error.message }));
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    console.log('Login attempt:', { identifier });

    if (!identifier || !password) {
      console.log('Missing identifier or password:', { identifier, password });
      return next(errorHandler(400, "Email/phone number and password are required"));
    }

    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phoneNumber: identifier }],
      isDeleted: false 
    });
    if (!user) {
      console.log('User not found for identifier:', identifier);
      return next(errorHandler(404, "User not found"));
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', identifier);
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
        token,
      });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
    });
    next(errorHandler(500, 'Internal server error during login'));
  }
};

// Edit current user's profile
export const editProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, username, profilePicture, permanentAddress, additionalAddresses, password } = req.body;
    const userId = req.user.id;

    console.log('Edit profile request body:', req.body);

    const updateData = { firstName, lastName, username, profilePicture, permanentAddress, additionalAddresses };
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    if (password) {
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.isValid) {
        console.error('Password validation failed:', passwordCheck.requirements);
        return next(
          errorHandler(400, "Password does not meet requirements", {
            requirements: passwordCheck.requirements,
          })
        );
      }
      updateData.password = await hashPassword(password);
    }

    delete updateData.email;
    delete updateData.phoneNumber;

    try {
      validateUserUpdate(updateData, false);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return next(errorHandler(400, validationError.message));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    console.log('Profile updated successfully:', updatedUser._id);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error('Edit profile error:', {
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
      console.error(`Duplicate key error on field: ${field}`, error.keyValue);
      return next(errorHandler(400, `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`));
    }
    next(errorHandler(500, 'Internal server error during profile update'));
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, phoneNumber, roles, points, password, profilePicture, permanentAddress, additionalAddresses } = req.body;
    const isAdmin = req.user.roles === 'Admin';
    const isManager = req.user.roles === 'Manager';
    const userId = req.params.id;

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return next(errorHandler(404, 'User not found'));
    }
    if (isManager && ['Admin', 'Manager'].includes(targetUser.roles)) {
      return next(errorHandler(403, 'Managers cannot edit Admin or Manager profiles'));
    }
    if (isManager && roles && ['Admin', 'Manager'].includes(roles)) {
      return next(errorHandler(403, 'Managers cannot assign Admin or Manager roles'));
    }

    const allowedFields = isAdmin
      ? { firstName, lastName, username, email, phoneNumber, roles, points, password, profilePicture, permanentAddress, additionalAddresses }
      : { firstName, lastName, username, profilePicture, permanentAddress, additionalAddresses };

    const updateData = {};
    Object.keys(allowedFields).forEach((key) => {
      if (allowedFields[key] !== undefined && allowedFields[key] !== null) {
        updateData[key] = allowedFields[key];
      }
    });

    try {
      validateUserUpdate(updateData, isAdmin);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return next(errorHandler(400, validationError.message));
    }

    if (isAdmin && (email || phoneNumber)) {
      const existingQuery = { $or: [], _id: { $ne: userId }, isDeleted: false };
      if (email && email !== targetUser.email) {
        existingQuery.$or.push({ email });
      }
      if (phoneNumber && phoneNumber !== targetUser.phoneNumber) {
        existingQuery.$or.push({ phoneNumber });
      }
      if (existingQuery.$or.length) {
        const existingUser = await User.findOne(existingQuery);
        if (existingUser) {
          return next(errorHandler(400, 'Email or phone number already exists'));
        }
      }
    }

    if (password && isAdmin) {
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.isValid) {
        return next(errorHandler(400, 'Password does not meet requirements', { requirements: passwordCheck.requirements }));
      }
      updateData.password = await hashPassword(password);
    }

    if (isAdmin && points !== undefined) {
      updateData.pointsRank = getPointsRank(points);
    }

    // Handle nested objects
    if (updateData.permanentAddress) {
      updateData.permanentAddress = {
        street: updateData.permanentAddress.street || '',
        city: updateData.permanentAddress.city || '',
        state: updateData.permanentAddress.state || '',
        postalCode: updateData.permanentAddress.postalCode || '',
        country: updateData.permanentAddress.country || '',
      };
    }
    if (updateData.additionalAddresses) {
      updateData.additionalAddresses = Array.isArray(updateData.additionalAddresses)
        ? updateData.additionalAddresses.map(addr => ({
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            postalCode: addr.postalCode || '',
            country: addr.country || '',
          }))
        : [];
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return next(errorHandler(404, 'User not found'));
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', {
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

// Check unique fields
export const checkUniqueFields = async (req, res, next) => {
  try {
    console.log('checkUniqueFields called with:', req.body);

    if (!req.user || !req.user.roles) {
      console.error('checkUniqueFields: Missing req.user or req.user.roles');
      return next(errorHandler(401, 'Unauthorized: User not authenticated'));
    }

    const { email, phoneNumber, excludeId } = req.body;
    const isManager = req.user.roles === "Manager";

    if (!email && !phoneNumber) {
      console.log('checkUniqueFields: No fields to check');
      return res.status(200).json({ success: true, isUnique: true });
    }

    if (excludeId && isManager) {
      const targetUser = await User.findById(excludeId);
      if (!targetUser) {
        console.log('checkUniqueFields: Target user not found for excludeId:', excludeId);
        return next(errorHandler(404, 'Target user not found'));
      }
      if (targetUser && ['Admin', 'Manager'].includes(targetUser.roles)) {
        console.log('checkUniqueFields: Manager attempted to modify Admin/Manager user:', excludeId);
        return next(errorHandler(403, 'Managers cannot modify Admin or Manager profiles'));
      }
    }

    const query = { $or: [], isDeleted: false };
    const currentUser = excludeId ? await User.findById(excludeId) : null;

    if (email && (!currentUser || email !== currentUser.email)) {
      query.$or.push({ email });
    }
    if (phoneNumber && (!currentUser || phoneNumber !== currentUser.phoneNumber)) {
      query.$or.push({ phoneNumber });
    }

    if (!query.$or.length) {
      console.log('checkUniqueFields: No fields to check, returning isUnique: true');
      return res.status(200).json({ success: true, isUnique: true });
    }
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    console.log('checkUniqueFields: Querying with:', query);
    const existingUser = await User.findOne(query);
    if (existingUser) {
      console.log('checkUniqueFields: Found existing user:', existingUser._id, existingUser.email);
      return res.status(400).json({
        success: false,
        message: 'Email or phone number already exists',
        isUnique: false
      });
    }

    console.log('checkUniqueFields: No conflicting user found');
    res.status(200).json({ success: true, isUnique: true });
  } catch (error) {
    console.error('checkUniqueFields error:', error.message, error.stack);
    next(errorHandler(500, 'Internal server error during uniqueness check'));
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
  console.log('getCurrentUser called for user:', req.user);
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('User not found for ID:', req.user.id);
      return next(errorHandler(404, 'User not found'));
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};
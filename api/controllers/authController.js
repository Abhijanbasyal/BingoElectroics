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

// Register a new user
export const register = async (req, res, next) => {
  try {
    const { username, email, password, roles } = req.body;

    // Validate input
    validateRegistration({ username, email, password });

    

    // Check password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      return next(
        errorHandler(400, "Password does not meet requirements", {
          requirements: passwordCheck.requirements,
        })
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return next(errorHandler(400, "Username or email already exists"));
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password: await hashPassword(password),
      roles: roles || "Customer",
    });

    await newUser.save();

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, isDeleted: false });
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
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: userWithoutPassword,
      });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { username, email, roles, points, password } = req.body;
    const isAdmin = req.user.roles === "Admin";

    // Validate input
    validateUserUpdate({ username, email, roles, points }, isAdmin);

    // Prepare update data
    const updateData = { username, email };

    // Admin-specific updates
    if (isAdmin) {
      if (roles) updateData.roles = roles;
      if (points !== undefined) {
        updateData.points = points;
        updateData.pointsRank = getPointsRank(points);
      }
    }

    // Handle password update
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

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
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
    next(error);
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isDeleted: false }).select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
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
    next(error);
  }
};

// Soft delete user
export const deleteUser = async (req, res, next) => {
  try {
    // Only admin can delete users
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
    next(error);
  }
};

// Permanently delete user
export const deleteUserPermanently = async (req, res, next) => {
  try {
    // Only admin can permanently delete users
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
    next(error);
  }
};

// Restore user
export const restoreUser = async (req, res, next) => {
  try {
    // Only admin can restore users
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
    next(error);
  }
};

// Get all deleted users
export const getDeletedUsers = async (req, res, next) => {
  try {
    // Only admin can view deleted users
    if (req.user.roles !== "Admin") {
      return next(errorHandler(403, "Only admin can view deleted users"));
    }

    const users = await User.find({ isDeleted: true }).select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Delete all users permanently (Admin only)
export const deleteAllUsersPermanently = async (req, res, next) => {
  try {
    // Only admin can perform this action
    if (req.user.roles !== "Admin") {
      return next(errorHandler(403, "Only admin can perform this action"));
    }

    const result = await User.deleteMany({ isDeleted: true });

    res.status(200).json({
      success: true,
      message: `Permanently deleted ${result.deletedCount} users`,
    });
  } catch (error) {
    next(error);
  }
};

// Restore all deleted users (Admin only)
export const restoreAllUsers = async (req, res, next) => {
  try {
    // Only admin can perform this action
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
    next(error);
  }
};

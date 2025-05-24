import { errorHandler } from '../utils/error.js';

// Validate user registration data
export const validateRegistration = (data) => {
    const { username, email, password } = data;
    const errors = {};

    if (!username || username.trim().length < 3) {
        errors.username = 'Username must be at least 3 characters';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Valid email is required';
    }

    if (!password) {
        errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
        throw errorHandler(400, 'Validation failed', errors);
    }

    return true;
};

// Validate user update data
export const validateUserUpdate = (data, isAdmin) => {
    const { username, email, roles, points } = data;
    const errors = {};

    if (username && username.trim().length < 3) {
        errors.username = 'Username must be at least 3 characters';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Valid email is required';
    }

    if (roles && !isAdmin) {
        errors.roles = 'Only admin can update roles';
    }

    if (points !== undefined && !isAdmin) {
        errors.points = 'Only admin can update points';
    }

    if (Object.keys(errors).length > 0) {
        throw errorHandler(400, 'Validation failed', errors);
    }

    return true;
};

// Validate points rank calculation
export const getPointsRank = (points) => {
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    if (points > 0) return 'Bronze';
    return '';
};
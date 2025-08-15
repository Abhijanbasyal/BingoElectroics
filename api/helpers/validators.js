import { errorHandler } from '../utils/error.js';
import { validatePasswordStrength } from '../helpers/passwordSecurity.js';

// Validate user registration data
export const validateRegistration = (data) => {
  const { username, email, password, phoneNumber } = data;
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

  if (!phoneNumber || !/^\+?\d{10,15}$/.test(phoneNumber.trim())) {
    errors.phoneNumber = 'Valid phone number is required (10-15 digits, optional + prefix)';
  }

  if (Object.keys(errors).length > 0) {
    throw errorHandler(400, 'Validation failed', errors);
  }

  return true;
};

// Validate user update data
export const validateUserUpdate = (data, isAdmin) => {
  const { username, email, phoneNumber, roles, points, password } = data;
  const errors = {};

  if (username && username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Valid email is required';
  }

  if (phoneNumber && !/^\+?\d{10,15}$/.test(phoneNumber.trim())) {
    errors.phoneNumber = 'Valid phone number is required (10-15 digits, optional + prefix)';
  }

  if (password) {
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      errors.password = 'Password does not meet requirements';
      errors.requirements = passwordCheck.requirements;
    }
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
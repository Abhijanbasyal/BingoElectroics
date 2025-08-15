import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  console.log('verifyToken called with headers:', req.headers); // Add logging
  const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return next(errorHandler(401, 'Unauthorized: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, user:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return next(errorHandler(401, 'Unauthorized: Invalid token'));
  }
};

export const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.roles)) {
      return next(errorHandler(403, `Access denied: Requires one of the following roles: ${roles.join(', ')}`));
    }
    next();
  };
};
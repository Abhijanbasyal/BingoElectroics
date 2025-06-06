import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    
    if (!token) {
        return next(errorHandler(401, 'Unauthorized'));
    }
    // console.log(process.env.JWT_SECRET);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(errorHandler(403, 'Forbidden'));
        }
        req.user = user;
        // console.log(req.user);
        next();
    });
};

export const verifyRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.roles)) {
            // console.log(req.user)
            return next(errorHandler(403, 'You are not authorized to perform this action'));
        }
        next();
    };
};
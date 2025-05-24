import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: String,
        enum: ['Customer', 'Seller', 'Manager', 'Admin'],
        default: 'Customer'
    },
    points: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    pointsRank: {
        type: String,
        enum: ['', 'Bronze', 'Silver', 'Gold'],
        default: ''
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
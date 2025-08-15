import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    images: [{
        type: String,
        trim: true
    }],
    price: {
        type: Number,
        required: true,
        min: 0
    },
    productQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    modifiedDate: {
        type: Date
    },
    deletedDate: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    views: { type: Number, default: 0 }, // Track views
    bought: { type: Number, default: 0 }, // Track purchases
  // Add viewedBy to track users who viewed (e.g., user IDs)
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comment: {
            type: String,
            required: true,
            trim: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        createdDate: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: false
});

const Product = mongoose.model('Product', productSchema);

export default Product;
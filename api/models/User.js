import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (v) => /^\+?\d{10,15}$/.test(v),
      message: 'Invalid phone number'
    }
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
  pointsRank: {
    type: String,
    enum: ['', 'Bronze', 'Silver', 'Gold'],
    default: ''
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: '',
    trim: true
  },
  permanentAddress: {
    type: addressSchema,
    required: true
  },
  additionalAddresses: {
    type: [addressSchema],
    default: []
  }
}, {
  timestamps: true
});


const User = mongoose.model('User', userSchema);

export default User;
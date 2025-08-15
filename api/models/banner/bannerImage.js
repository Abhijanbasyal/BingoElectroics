import mongoose from 'mongoose';

const bannerImageSchema = new mongoose.Schema({
  image: [{ type: String, required: true, trim: true }], // Store image URL or base64
  link: { type: String, required: false, trim: true }, // Optional link URL
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deletedDate: { type: Date },
}, {
    timestamps: false
});

const Banner = mongoose.model('BannerImage', bannerImageSchema);

export default Banner;
import mongoose from 'mongoose';

const bannerImageSchema = new mongoose.Schema({
  image: { type: String, required: true }, // Store image URL or base64
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('BannerImage', bannerImageSchema);
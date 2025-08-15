import BannerImage from '../../models/banner/bannerImage.js';
import dotenv from 'dotenv';

dotenv.config();

export const uploadBannerImage = async (req, res) => {
  try {
    const { image, link } = req.body; // Expecting an array of image URLs and optional link
    if (!image || !Array.isArray(image) || image.length === 0) {
      return res.status(400).json({ message: 'At least one image URL is required' });
    }

    const newBanner = new BannerImage({ image, link });
    await newBanner.save();

    res.status(201).json({ message: 'Banner image uploaded', imageUrl: image, link });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBannerImages = async (req, res) => {
  try {
    const banners = await BannerImage.find({ isDeleted: false }).select('image link createdAt updatedAt');
    res.status(200).json({ banners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeletedBannerImages = async (req, res) => {
  try {
    const banners = await BannerImage.find({ isDeleted: true }).select('image link createdAt updatedAt');
    res.status(200).json({ banners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await BannerImage.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedDate: new Date() },
      { new: true }
    ).select('image link createdAt updatedAt');

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Banner marked as deleted',
      banner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const permanentDeleteBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await BannerImage.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Banner permanently deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await BannerImage.findByIdAndUpdate(
      id,
      { isDeleted: false, deletedDate: null },
      { new: true }
    ).select('image link createdAt updatedAt');

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Banner restored successfully',
      banner,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
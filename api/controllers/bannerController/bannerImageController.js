import BannerImage from '../models/bannerImageModel.js';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: './uploads/banners/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

export const uploadBannerImage = [
  upload.single('image'),
  async (req, res) => {
    try {
      const { file } = req;
      if (!file) return res.status(400).json({ message: 'No image uploaded' });

      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/banners/${file.filename}`;
      const newBanner = new BannerImage({ image: imageUrl });
      await newBanner.save();

      res.status(201).json({ message: 'Banner image uploaded', imageUrl });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
];

export const getBannerImages = async (req, res) => {
  try {
    const banners = await BannerImage.find().select('image createdDate');
    res.status(200).json({ banners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeletedBannerImages = async (req, res) => {
  try {
    const banners = await BannerImage.findDeleted().select('image createdDate');
    res.status(200).json({ banners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await BannerImage.findById(id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    await banner.softDelete();
    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const permanentDeleteBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await BannerImage.findOneDeleted({ _id: id });
    if (!banner) return res.status(404).json({ message: 'Deleted banner not found' });
    await banner.deleteOne();
    res.status(200).json({ message: 'Banner permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreBannerImage = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await BannerImage.findOneDeleted({ _id: id });
    if (!banner) return res.status(404).json({ message: 'Deleted banner not found' });
    await banner.restore();
    res.status(200).json({ message: 'Banner restored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
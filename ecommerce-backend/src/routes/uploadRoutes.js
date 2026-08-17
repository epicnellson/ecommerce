import express from 'express';
import multer from 'multer';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadImage } from '../services/uploadService.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  '/image',
  protect,
  admin,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
      }

      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await uploadImage(dataURI);

      res.json({
        url: result.url,
        publicId: result.publicId,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
);

export default router;

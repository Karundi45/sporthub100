import express, { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '1234567890',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fittrack_pro',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  } as any,
});

const upload = multer({ storage: storage });

// Fallback logic if cloudinary fails due to missing keys
const mockUpload = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Mock upload successful',
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'
  });
};

router.post('/', protect, async (req: Request, res: Response, next) => {
  // If no cloudinary keys are present in env, we just return a mock URL so the app doesn't crash
  if (!process.env.CLOUDINARY_API_KEY) {
    return mockUpload(req, res);
  }

  // Otherwise, run actual multer middleware
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading file', error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'Upload successful',
      url: req.file.path // Cloudinary URL
    });
  });
});

export default router;

import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// @route   POST /api/upload
// @desc    Upload product images (up to 5)
// @access  Admin
router.post('/', verifyAdmin, upload.array('images', 5), (req, res) => {
  try {
    const imageUrls = req.files.map(
      (file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    );
    res.json({ imageUrls });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default router;


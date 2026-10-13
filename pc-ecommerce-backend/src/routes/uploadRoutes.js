const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Đảm bảo thư mục uploads luôn tồn tại
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpg|jpeg|png|webp/;
  const isExtValid = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedExtensions.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WEBP image files are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded' });
  }
  // Trả về đường dẫn truy cập ảnh tĩnh
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.status(201).json({
    message: 'Image uploaded successfully',
    imageUrl,
  });
});

module.exports = router;
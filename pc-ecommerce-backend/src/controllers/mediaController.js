const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// @desc    Get list of all uploaded files
// @route   GET /api/v1/media
exports.getAllMediaFiles = async (req, res) => {
  try {
    const files = await fs.promises.readdir(UPLOADS_DIR);

    const mediaList = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = await fs.promises.stat(filePath);

        return {
          name: filename,
          url: `/uploads/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime || stats.mtime,
        };
      })
    );

    // Sort newest first
    mediaList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(mediaList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete media file from storage
// @route   DELETE /api/v1/media/:filename
exports.deleteMediaFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return res.json({ message: 'Media asset deleted successfully.' });
    }

    res.status(404).json({ message: 'File not found on storage.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
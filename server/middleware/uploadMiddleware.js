const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'consultations');
const profileUploadDirectory = path.join(__dirname, '..', 'uploads', 'profiles');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

if (!fs.existsSync(profileUploadDirectory)) {
  fs.mkdirSync(profileUploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);

    cb(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png']);

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname || '').toLowerCase();
  const isMimeAllowed = allowedMimeTypes.includes((file.mimetype || '').toLowerCase());
  const isExtensionAllowed = allowedExtensions.has(extension);

  if (!isMimeAllowed || !isExtensionAllowed) {
    return cb(new Error('Only JPG, JPEG, and PNG image files are allowed'));
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 3,
  },
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDirectory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);

    cb(null, `${Date.now()}-${baseName}${extension}`);
  },
});

const profileUpload = multer({
  storage: profileStorage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});

const uploadConsultationImages = (req, res, next) => {
  upload.array('images', 3)(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Each image must be 2MB or smaller' });
      }

      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: 'You can upload up to 3 images per consultation' });
      }

      return res.status(400).json({ success: false, message: 'Invalid image upload payload' });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Image upload failed',
    });
  });
};

const uploadAdminReplyImages = (req, res, next) => {
  upload.array('replyImages', 3)(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Each image must be 2MB or smaller' });
      }

      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: 'You can upload up to 3 reply images' });
      }

      return res.status(400).json({ success: false, message: 'Invalid reply image upload payload' });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Reply image upload failed',
    });
  });
};

const uploadProfileImage = (req, res, next) => {
  profileUpload.single('profileImage')(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Profile image must be 2MB or smaller' });
      }

      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: 'Only one profile image is allowed' });
      }

      return res.status(400).json({ success: false, message: 'Invalid profile image upload payload' });
    }

    return res.status(400).json({
      success: false,
      message: err.message || 'Profile image upload failed',
    });
  });
};

module.exports = {
  uploadConsultationImages,
  uploadAdminReplyImages,
  uploadProfileImage,
};

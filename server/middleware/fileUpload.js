// middleware/fileUpload.js
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.memoryStorage();

// File upload restrictions
const fileFilter = (req, file, cb) => {
  // Allow only PDF and DOCX formats
  const allowedFileTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'), false);
  }
};

// Initialize upload with file size limit (5MB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Single file upload middleware
const uploadCV = upload.single('cv');

// middleware/fileUpload.js - Add better error messages
const handleUploadErrors = (req, res, next) => {
  uploadCV(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed'
      });
    }
    next();
  });
};


module.exports = { handleUploadErrors };
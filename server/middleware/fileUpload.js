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

// Handle multer errors
const handleUploadErrors = (req, res, next) => {
  uploadCV(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // Multer error occurred (e.g., file too large)
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size exceeds the 5MB limit.'
          });
        }
        return res.status(400).json({
          success: false,
          error: err.message
        });
      } else {
        // Other errors
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
    }
    
    // Check if a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a CV file.'
      });
    }
    
    next();
  });
};

module.exports = { handleUploadErrors };
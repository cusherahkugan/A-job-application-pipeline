// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const { handleUploadErrors } = require('../middleware/fileUpload');
const applicationController = require('../controllers/applicationController');

// Application submission endpoint
router.post('/submit', handleUploadErrors, applicationController.submitApplication);

// Application status endpoint
router.get('/status/:email', applicationController.getApplicationStatus);

module.exports = router;
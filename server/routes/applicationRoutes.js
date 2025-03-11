const express = require('express');
const applicationController = require('../controllers/applicationController');
const { handleUploadErrors } = require('../middleware/fileUpload');

const router = express.Router();

/**
 * @route   POST /api/applications/submit
 * @desc    Submit a new job application
 * @access  Public
 */
router.post('/submit', handleUploadErrors, applicationController.submitApplication);

/**
 * @route   GET /api/applications/status/:email
 * @desc    Get application status by email
 * @access  Public
 */
router.get('/status/:email', applicationController.getApplicationStatus);

module.exports = router;
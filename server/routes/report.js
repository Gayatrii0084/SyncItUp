const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { submitReport, getMyReports } = require('../controllers/reportController');

// POST /api/report — Submit a report
router.post('/', authMiddleware, submitReport);

// GET /api/report/my — Get reports submitted by current user
router.get('/my', authMiddleware, getMyReports);

module.exports = router;

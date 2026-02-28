const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getRecommendations } = require('../controllers/matchingController');

// GET /api/matching/recommendations
router.get('/recommendations', authMiddleware, getRecommendations);

module.exports = router;

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getProfile, updateProfile, getCurrentUser } = require('../controllers/profileController');

// GET /api/profile/me - Get current user
router.get('/me', authMiddleware, getCurrentUser);

// GET /api/profile/:id - Get user by ID
router.get('/:id', authMiddleware, getProfile);

// PUT /api/profile - Update profile
router.put('/', authMiddleware, updateProfile);

module.exports = router;

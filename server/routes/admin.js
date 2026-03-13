const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    getUsers,
    getTeams,
    getReports,
    blockUser,
    unblockUser,
    removeTeam
} = require('../controllers/adminController');

// All admin routes require valid JWT + admin role
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/users — list all users from admin's college
router.get('/users', getUsers);

// GET /api/admin/teams — list all teams in admin's college
router.get('/teams', getTeams);

// GET /api/admin/reports — list all reports in admin's college
router.get('/reports', getReports);

// PUT /api/admin/users/:userId/block
router.put('/users/:userId/block', blockUser);

// PUT /api/admin/users/:userId/unblock
router.put('/users/:userId/unblock', unblockUser);

// DELETE /api/admin/teams/:teamId
router.delete('/teams/:teamId', removeTeam);

module.exports = router;

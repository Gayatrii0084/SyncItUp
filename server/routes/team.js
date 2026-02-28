const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    sendRequest,
    getReceivedRequests,
    getSentRequests,
    updateRequest,
    getMyTeams,
    getTeamDetails
} = require('../controllers/teamController');

// POST /api/team/request - Send collaboration request
router.post('/request', authMiddleware, sendRequest);

// GET /api/team/requests/received - Get received requests
router.get('/requests/received', authMiddleware, getReceivedRequests);

// GET /api/team/requests/sent - Get sent requests
router.get('/requests/sent', authMiddleware, getSentRequests);

// PUT /api/team/request/:requestId - Accept/Reject request
router.put('/request/:requestId', authMiddleware, updateRequest);

// GET /api/team/my-teams - Get user's teams
router.get('/my-teams', authMiddleware, getMyTeams);

// GET /api/team/:teamId - Get team details
router.get('/:teamId', authMiddleware, getTeamDetails);

module.exports = router;

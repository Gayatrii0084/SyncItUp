const Request = require('../models/Request');
const Team = require('../models/Team');
const User = require('../models/User');

// Helper to enforce that admins cannot use team collaboration features
function ensureStudentRole(req, res) {
    if (req.userRole === 'admin') {
        res.status(403).json({ message: 'Admin accounts cannot use team collaboration features.' });
        return false;
    }
    return true;
}

// Send collaboration request
exports.sendRequest = async (req, res) => {
    if (!ensureStudentRole(req, res)) return;
    try {
        const { receiverId, message } = req.body;

        // Check if request already exists
        const existingRequest = await Request.findOne({
            sender: req.userId,
            receiver: receiverId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Request already sent' });
        }

        const request = new Request({
            sender: req.userId,
            receiver: receiverId,
            message: message || 'Let\'s collaborate!'
        });

        await request.save();
        await request.populate('sender receiver', 'name email college branch skills');

        res.status(201).json({ message: 'Request sent successfully', request });
    } catch (error) {
        console.error('Send request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get received requests
exports.getReceivedRequests = async (req, res) => {
    if (!ensureStudentRole(req, res)) return;
    try {
        const requests = await Request.find({
            receiver: req.userId,
            status: 'pending'
        }).populate('sender', 'name email college branch skills experienceLevel');

        res.json({ requests });
    } catch (error) {
        console.error('Get received requests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get sent requests
exports.getSentRequests = async (req, res) => {
    if (!ensureStudentRole(req, res)) return;
    try {
        const requests = await Request.find({
            sender: req.userId
        }).populate('receiver', 'name email college branch skills experienceLevel');

        res.json({ requests });
    } catch (error) {
        console.error('Get sent requests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Accept/Reject request
exports.updateRequest = async (req, res) => {
    if (!ensureStudentRole(req, res)) return;
    try {
        const { requestId } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'

        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Verify the current user is the receiver
        if (request.receiver.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        request.status = status;
        request.updatedAt = Date.now();
        await request.save();

        // If accepted, create a team
        if (status === 'accepted') {
            // Check if team already exists between these users
            let team = await Team.findOne({
                members: { $all: [request.sender, request.receiver] }
            });

            if (!team) {
                team = new Team({
                    name: 'Collaboration Team',
                    members: [request.sender, request.receiver],
                    createdBy: request.receiver
                });
                await team.save();
            }

            await request.populate('sender receiver', 'name email');
            return res.json({
                message: 'Request accepted and team created',
                request,
                team
            });
        }

        res.json({ message: `Request ${status}`, request });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's teams
exports.getMyTeams = async (req, res) => {
    if (!ensureStudentRole(req, res)) return;
    try {
        const teams = await Team.find({
            members: req.userId
        }).populate('members', 'name email college branch skills');

        res.json({ teams });
    } catch (error) {
        console.error('Get my teams error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get team details
exports.getTeamDetails = async (req, res) => {
    if (!ensureStudentRole(req, res)) return;
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId).populate('members', 'name email college branch skills experienceLevel');

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Check if user is a member
        if (!team.members.some(member => member._id.toString() === req.userId)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({ team });
    } catch (error) {
        console.error('Get team details error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

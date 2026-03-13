const User = require('../models/User');
const Team = require('../models/Team');
const Report = require('../models/Report');
const mongoose = require('mongoose');

// GET /api/admin/users — all users from same college
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({
            college: req.userCollege
        })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({ users });
    } catch (error) {
        console.error('Admin getUsers error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/admin/students — only student-role users from same college
exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({
            college: req.userCollege,
            role: { $in: ['user', 'student'] }
        })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({ students });
    } catch (error) {
        console.error('Admin getStudents error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/admin/teams — teams where at least one member is from the admin's college
exports.getTeams = async (req, res) => {
    try {
        // Find user IDs from the same college
        const collegeUsers = await User.find({ college: req.userCollege }).select('_id');
        const collegeUserIds = collegeUsers.map(u => u._id);

        const teams = await Team.find({
            members: { $in: collegeUserIds }
        }).populate('members', 'name email college branch skills')
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 });

        res.json({ teams });
    } catch (error) {
        console.error('Admin getTeams error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/admin/reports — all reports for admin's college
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find({ college: req.userCollege })
            .populate('reporterId', 'name email')
            .populate('reportedUserId', 'name email isBlocked')
            .sort({ timestamp: -1 });

        res.json({ reports });
    } catch (error) {
        console.error('Admin getReports error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT /api/admin/users/:userId/block
exports.blockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Cannot block another admin
        const target = await User.findById(userId);
        if (!target) return res.status(404).json({ message: 'User not found' });
        if (target.role === 'admin') return res.status(403).json({ message: 'Cannot block an admin' });
        if (target.college !== req.userCollege) return res.status(403).json({ message: 'User not in your college' });

        target.isBlocked = true;
        await target.save();

        res.json({ message: `${target.name} has been blocked.`, user: { id: target._id, name: target.name, isBlocked: true } });
    } catch (error) {
        console.error('Admin blockUser error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT /api/admin/users/:userId/unblock
exports.unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const target = await User.findById(userId);
        if (!target) return res.status(404).json({ message: 'User not found' });
        if (target.college !== req.userCollege) return res.status(403).json({ message: 'User not in your college' });

        target.isBlocked = false;
        await target.save();

        res.json({ message: `${target.name} has been unblocked.`, user: { id: target._id, name: target.name, isBlocked: false } });
    } catch (error) {
        console.error('Admin unblockUser error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PATCH /api/admin/block/:id — toggle block status for a student
exports.toggleBlockStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const target = await User.findById(id);
        if (!target) return res.status(404).json({ message: 'User not found' });

        // Only manage students from same college
        if (target.role === 'admin') {
            return res.status(403).json({ message: 'Cannot block or unblock an admin' });
        }
        if (target.college !== req.userCollege) {
            return res.status(403).json({ message: 'User not in your college' });
        }

        target.isBlocked = !target.isBlocked;
        await target.save();

        res.json({
            message: target.isBlocked ? `${target.name} has been blocked.` : `${target.name} has been unblocked.`,
            user: { id: target._id, name: target.name, isBlocked: target.isBlocked }
        });
    } catch (error) {
        console.error('Admin toggleBlockStudent error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// DELETE /api/admin/teams/:teamId
exports.removeTeam = async (req, res) => {
    try {
        const { teamId } = req.params;

        const team = await Team.findById(teamId).populate('members', 'college');
        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Ensure at least one member is from admin's college
        const hasCollegeMember = team.members.some(m => m.college === req.userCollege);
        if (!hasCollegeMember) return res.status(403).json({ message: 'Team not in your college jurisdiction' });

        await Team.findByIdAndDelete(teamId);

        res.json({ message: 'Team removed successfully' });
    } catch (error) {
        console.error('Admin removeTeam error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

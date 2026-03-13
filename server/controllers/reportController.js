const Report = require('../models/Report');
const User = require('../models/User');
const Team = require('../models/Team');
const Message = require('../models/Message');

// POST /api/report — Submit a report against another user
exports.submitReport = async (req, res) => {
    try {
        const { reportedUserEmail, reason } = req.body;

        if (!reportedUserEmail || !reason) {
            return res.status(400).json({ message: 'Reported user email and reason are required.' });
        }

        const validReasons = ['Spam', 'Harassment', 'Fake profile', 'Inappropriate behaviour'];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({ message: 'Invalid reason provided.' });
        }

        // Get reporter
        const reporter = await User.findById(req.userId).select('name email college');
        if (!reporter) return res.status(404).json({ message: 'Reporter not found.' });

        // Get reported user
        const reportedUser = await User.findOne({ email: reportedUserEmail.toLowerCase().trim() }).select('_id name college');
        if (!reportedUser) return res.status(404).json({ message: 'User to report not found.' });

        if (reportedUser._id.toString() === req.userId) {
            return res.status(400).json({ message: 'You cannot report yourself.' });
        }

        // Fetch last 5 chat messages between the two users in any shared team
        let lastMessages = [];
        try {
            // Find teams both users are members of
            const sharedTeams = await Team.find({
                members: { $all: [req.userId, reportedUser._id] }
            }).select('_id');

            if (sharedTeams.length > 0) {
                const teamIds = sharedTeams.map(t => t._id);
                const messages = await Message.find({
                    team: { $in: teamIds },
                    sender: { $in: [req.userId, reportedUser._id] }
                })
                    .populate('sender', 'name')
                    .sort({ timestamp: -1 })
                    .limit(5);

                lastMessages = messages.reverse().map(m => ({
                    senderName: m.sender.name,
                    content: m.content,
                    timestamp: m.timestamp
                }));
            }
        } catch (msgErr) {
            console.error('Could not fetch messages for report:', msgErr);
            // Non-fatal — proceed without messages
        }

        // Check for existing report (duplicate prevention via unique index)
        const existingReport = await Report.findOne({
            reporterId: req.userId,
            reportedUserId: reportedUser._id
        });
        if (existingReport) {
            return res.status(400).json({ message: 'You have already submitted a report against this user.' });
        }

        const report = new Report({
            reporterId: req.userId,
            reportedUserId: reportedUser._id,
            reason,
            college: reporter.college,
            lastMessages
        });

        await report.save();

        res.status(201).json({ message: 'Report submitted successfully. Admins will review it shortly.' });
    } catch (error) {
        console.error('Submit report error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// GET /api/report/my — Reports submitted by current user
exports.getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ reporterId: req.userId })
            .populate('reportedUserId', 'name email')
            .sort({ timestamp: -1 });

        res.json({ reports });
    } catch (error) {
        console.error('Get my reports error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

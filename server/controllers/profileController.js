const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.id || req.userId;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, skills, experienceLevel, preferredRole, availableHours, hackathonInterests } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (skills) updateData.skills = skills;
        if (experienceLevel) updateData.experienceLevel = experienceLevel;
        if (preferredRole) updateData.preferredRole = preferredRole;
        if (availableHours !== undefined) updateData.availableHours = availableHours;
        if (hackathonInterests) updateData.hackathonInterests = hackathonInterests;

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true }
        ).select('-password');

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

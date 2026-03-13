const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        enum: ['Spam', 'Harassment', 'Fake profile', 'Inappropriate behaviour'],
        required: true
    },
    college: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    // Alias to make it clearer in APIs that this is the creation time
    createdAt: {
    type: Date,
    default: Date.now
    },
    lastMessages: [
        {
            senderName: String,
            content: String,
            timestamp: Date
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'reviewed'],
        default: 'pending'
    }
});

// Prevent duplicate reports from same reporter → reported pair
reportSchema.index({ reporterId: 1, reportedUserId: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    skills: [{
        type: String,
        trim: true
    }],
    experienceLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    preferredRole: {
        type: String,
        enum: ['Looking for team', 'Looking for members'],
        default: 'Looking for team'
    },
    availableHours: {
        type: Number,
        default: 10,
        min: 0,
        max: 168
    },
    hackathonInterests: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);

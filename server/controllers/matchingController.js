const User = require('../models/User');

// Smart matching algorithm
exports.getRecommendations = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get all other users
        const allUsers = await User.find({ _id: { $ne: req.userId } }).select('-password');

        // Calculate match scores
        const matches = allUsers.map(user => {
            const score = calculateMatchScore(currentUser, user);
            return {
                user,
                score: score.total,
                breakdown: score.breakdown
            };
        });

        // Sort by score and return top 10
        matches.sort((a, b) => b.score - a.score);
        const topMatches = matches.slice(0, 10);

        res.json({ recommendations: topMatches });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Calculate match score between two users
function calculateMatchScore(user1, user2) {
    // Ensure safe defaults so matching works even when users have incomplete profiles
    const u1Skills = Array.isArray(user1.skills) ? user1.skills : [];
    const u2Skills = Array.isArray(user2.skills) ? user2.skills : [];
    const u1Interests = Array.isArray(user1.hackathonInterests) ? user1.hackathonInterests : [];
    const u2Interests = Array.isArray(user2.hackathonInterests) ? user2.hackathonInterests : [];
    const u1Hours = typeof user1.availableHours === 'number' ? user1.availableHours : 0;
    const u2Hours = typeof user2.availableHours === 'number' ? user2.availableHours : 0;
    const u1Exp = user1.experienceLevel || 'Beginner';
    const u2Exp = user2.experienceLevel || 'Beginner';

    let skillScore = 0;
    let interestScore = 0;
    let availabilityScore = 0;
    let experienceScore = 0;

    // 40% - Skill Complementarity
    // Frontend should match with Backend/ML, not another Frontend
    const skillComplementarity = calculateSkillComplementarity(u1Skills, u2Skills);
    skillScore = skillComplementarity * 0.4;

    // 25% - Common Interests
    const commonInterests = u1Interests.filter(interest =>
        u2Interests.includes(interest)
    ).length;
    const maxInterests = Math.max(u1Interests.length, u2Interests.length, 1);
    interestScore = (commonInterests / maxInterests) * 0.25;

    // 20% - Availability Overlap
    const availDiff = Math.abs(u1Hours - u2Hours);
    const maxAvail = Math.max(u1Hours, u2Hours, 1);
    availabilityScore = (1 - (availDiff / maxAvail)) * 0.2;

    // 15% - Experience Compatibility
    const expLevels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
    const expDiff = Math.abs(expLevels[u1Exp] - expLevels[u2Exp]);
    experienceScore = (1 - (expDiff / 2)) * 0.15;

    const total = skillScore + interestScore + availabilityScore + experienceScore;

    return {
        total: Math.round(total * 100), // Convert to percentage
        breakdown: {
            skillComplementarity: Math.round(skillScore * 100),
            commonInterests: Math.round(interestScore * 100),
            availabilityOverlap: Math.round(availabilityScore * 100),
            experienceCompatibility: Math.round(experienceScore * 100)
        }
    };
}

// Calculate skill complementarity
function calculateSkillComplementarity(skills1, skills2) {
    const safeSkills1 = Array.isArray(skills1) ? skills1 : [];
    const safeSkills2 = Array.isArray(skills2) ? skills2 : [];

    if (safeSkills1.length === 0 || safeSkills2.length === 0) return 0;

    // Define skill categories
    const skillCategories = {
        frontend: ['frontend', 'react', 'vue', 'angular', 'html', 'css', 'javascript', 'ui/ux', 'design'],
        backend: ['backend', 'node', 'express', 'django', 'flask', 'spring', 'api', 'rest', 'graphql'],
        ml: ['ml', 'machine learning', 'ai', 'deep learning', 'python', 'tensorflow', 'pytorch'],
        mobile: ['mobile', 'android', 'ios', 'react native', 'flutter'],
        devops: ['devops', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd'],
        blockchain: ['blockchain', 'web3', 'ethereum', 'solidity', 'smart contracts'],
        iot: ['iot', 'arduino', 'raspberry pi', 'embedded']
    };

    // Categorize user skills
    const user1Categories = new Set();
    const user2Categories = new Set();

    safeSkills1.forEach(skill => {
        const skillLower = skill.toLowerCase();
        for (const [category, keywords] of Object.entries(skillCategories)) {
            if (keywords.some(keyword => skillLower.includes(keyword))) {
                user1Categories.add(category);
            }
        }
    });

    safeSkills2.forEach(skill => {
        const skillLower = skill.toLowerCase();
        for (const [category, keywords] of Object.entries(skillCategories)) {
            if (keywords.some(keyword => skillLower.includes(keyword))) {
                user2Categories.add(category);
            }
        }
    });

    // Calculate complementarity
    const commonCategories = [...user1Categories].filter(cat => user2Categories.has(cat)).length;
    const differentCategories = [...user1Categories].filter(cat => !user2Categories.has(cat)).length +
        [...user2Categories].filter(cat => !user1Categories.has(cat)).length;

    // Prefer different but complementary skills
    // If both have same categories only: lower score
    // If they have different categories: higher score
    const totalCategories = user1Categories.size + user2Categories.size;
    if (totalCategories === 0) return 0;

    // Weight complementary skills higher than matching skills
    const complementarityScore = (differentCategories * 0.7 + commonCategories * 0.3) / totalCategories;

    return Math.min(complementarityScore, 1);
}

module.exports = exports;

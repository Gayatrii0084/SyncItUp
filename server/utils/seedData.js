require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

const demoUsers = [
    {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'password123',
        college: 'IIT Delhi',
        branch: 'Computer Science',
        year: '3rd Year',
        bio: 'Passionate about web development and AI. Looking to build innovative solutions.',
        skills: ['React', 'Node.js', 'MongoDB', 'Frontend'],
        experienceLevel: 'Intermediate',
        preferredRole: 'Looking for team',
        availableHours: 15,
        hackathonInterests: ['Web Development', 'AI/ML', 'Social Impact']
    },
    {
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        password: 'password123',
        college: 'BITS Pilani',
        branch: 'Electronics',
        year: '2nd Year',
        bio: 'ML enthusiast and Python developer.',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'ML'],
        experienceLevel: 'Advanced',
        preferredRole: 'Looking for members',
        availableHours: 20,
        hackathonInterests: ['AI/ML', 'Data Science', 'Healthcare']
    },
    {
        name: 'Ananya Singh',
        email: 'ananya@example.com',
        password: 'password123',
        college: 'NIT Trichy',
        branch: 'Information Technology',
        year: '4th Year',
        bio: 'Full-stack developer with interest in blockchain.',
        skills: ['Backend', 'Express', 'PostgreSQL', 'Docker'],
        experienceLevel: 'Advanced',
        preferredRole: 'Looking for members',
        availableHours: 12,
        hackathonInterests: ['Blockchain', 'Web Development', 'FinTech']
    },
    {
        name: 'Vikram Mehta',
        email: 'vikram@example.com',
        password: 'password123',
        college: 'DTU Delhi',
        branch: 'Computer Science',
        year: '2nd Year',
        bio: 'UI/UX designer and frontend developer.',
        skills: ['UI/UX', 'Figma', 'HTML', 'CSS', 'JavaScript', 'Frontend'],
        experienceLevel: 'Intermediate',
        preferredRole: 'Looking for team',
        availableHours: 10,
        hackathonInterests: ['Design', 'Web Development', 'Mobile Apps']
    },
    {
        name: 'Sneha Reddy',
        email: 'sneha@example.com',
        password: 'password123',
        college: 'VIT Vellore',
        branch: 'Computer Science',
        year: '3rd Year',
        bio: 'Android developer passionate about mobile tech.',
        skills: ['Android', 'Kotlin', 'Flutter', 'Mobile'],
        experienceLevel: 'Intermediate',
        preferredRole: 'Looking for team',
        availableHours: 18,
        hackathonInterests: ['Mobile Apps', 'IoT', 'EdTech']
    },
    {
        name: 'Arjun Patel',
        email: 'arjun@example.com',
        password: 'password123',
        college: 'IIT Bombay',
        branch: 'Mechanical Engineering',
        year: '2nd Year',
        bio: 'IoT and hardware enthusiast.',
        skills: ['IoT', 'Arduino', 'Raspberry Pi', 'Python'],
        experienceLevel: 'Beginner',
        preferredRole: 'Looking for members',
        availableHours: 8,
        hackathonInterests: ['IoT', 'Hardware', 'Smart Cities']
    },
    {
        name: 'Kavya Kumar',
        email: 'kavya@example.com',
        password: 'password123',
        college: 'Anna University',
        branch: 'Information Science',
        year: '4th Year',
        bio: 'DevOps engineer and cloud enthusiast.',
        skills: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        experienceLevel: 'Advanced',
        preferredRole: 'Looking for team',
        availableHours: 14,
        hackathonInterests: ['Cloud Computing', 'DevOps', 'Automation']
    },
    {
        name: 'Rohan Gupta',
        email: 'rohan@example.com',
        password: 'password123',
        college: 'MIT Manipal',
        branch: 'Computer Science',
        year: '3rd Year',
        bio: 'Blockchain developer interested in Web3.',
        skills: ['Blockchain', 'Solidity', 'Web3', 'Ethereum'],
        experienceLevel: 'Intermediate',
        preferredRole: 'Looking for members',
        availableHours: 16,
        hackathonInterests: ['Blockchain', 'Web3', 'FinTech']
    },
    {
        name: 'Ishita Joshi',
        email: 'ishita@example.com',
        password: 'password123',
        college: 'IIIT Hyderabad',
        branch: 'Computer Science',
        year: '2nd Year',
        bio: 'Data science and analytics enthusiast.',
        skills: ['Python', 'Data Science', 'Pandas', 'Visualization'],
        experienceLevel: 'Beginner',
        preferredRole: 'Looking for team',
        availableHours: 12,
        hackathonInterests: ['Data Science', 'AI/ML', 'Analytics']
    },
    {
        name: 'Aditya Rao',
        email: 'aditya@example.com',
        password: 'password123',
        college: 'BIT Mesra',
        branch: 'Computer Science',
        year: '4th Year',
        bio: 'Backend specialist with microservices expertise.',
        skills: ['Backend', 'Java', 'Spring Boot', 'Microservices'],
        experienceLevel: 'Advanced',
        preferredRole: 'Looking for members',
        availableHours: 10,
        hackathonInterests: ['Backend', 'Scalability', 'APIs']
    },
    {
        name: 'Neha Kapoor',
        email: 'neha@example.com',
        password: 'password123',
        college: 'Jadavpur University',
        branch: 'Information Technology',
        year: '3rd Year',
        bio: 'Game developer and graphics programmer.',
        skills: ['Game Development', 'Unity', 'C#', 'Graphics'],
        experienceLevel: 'Intermediate',
        preferredRole: 'Looking for team',
        availableHours: 20,
        hackathonInterests: ['Gaming', 'VR/AR', 'Graphics']
    },
    {
        name: 'Karthik Nair',
        email: 'karthik@example.com',
        password: 'password123',
        college: 'NIT Warangal',
        branch: 'Computer Science',
        year: '2nd Year',
        bio: 'Cybersecurity researcher and ethical hacker.',
        skills: ['Cybersecurity', 'Ethical Hacking', 'Linux', 'Networking'],
        experienceLevel: 'Intermediate',
        preferredRole: 'Looking for members',
        availableHours: 15,
        hackathonInterests: ['Cybersecurity', 'Privacy', 'Security']
    },
    {
        name: 'Pooja Desai',
        email: 'pooja@example.com',
        password: 'password123',
        college: 'PSG Tech',
        branch: 'Computer Science',
        year: '4th Year',
        bio: 'Full-stack developer with React and Node.js expertise.',
        skills: ['React', 'Node.js', 'Frontend', 'Backend', 'Full-stack'],
        experienceLevel: 'Advanced',
        preferredRole: 'Looking for team',
        availableHours: 18,
        hackathonInterests: ['Web Development', 'Startups', 'Social Impact']
    },
    {
        name: 'Siddharth Iyer',
        email: 'siddharth@example.com',
        password: 'password123',
        college: 'SRM University',
        branch: 'Computer Science',
        year: '2nd Year',
        bio: 'Computer vision and image processing enthusiast.',
        skills: ['Computer Vision', 'OpenCV', 'Python', 'AI'],
        experienceLevel: 'Beginner',
        preferredRole: 'Looking for team',
        availableHours: 10,
        hackathonInterests: ['AI/ML', 'Computer Vision', 'Robotics']
    },
    {
        name: 'Tanvi Agarwal',
        email: 'tanvi@example.com',
        password: 'password123',
        college: 'Amity University',
        branch: 'Computer Science',
        year: '3rd Year',
        bio: 'Product designer with passion for user experience.',
        skills: ['UI/UX', 'Product Design', 'Adobe XD', 'User Research'],
        experienceLevel: 'Intermediate',
        preferredRole: 'Looking for members',
        availableHours: 13,
        hackathonInterests: ['Design', 'UX Research', 'Product']
    }
];

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();

        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️  Cleared existing users');

        // Hash passwords and create users
        for (const userData of demoUsers) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        // Insert demo users
        await User.insertMany(demoUsers);
        console.log(`✅ Successfully seeded ${demoUsers.length} demo users`);

        // Display login credentials
        console.log('\n📋 Demo User Credentials (all passwords: password123):');
        console.log('─────────────────────────────────────────────────');
        demoUsers.forEach(user => {
            console.log(`${user.name.padEnd(20)} | ${user.email}`);
        });
        console.log('─────────────────────────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();

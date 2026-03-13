const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { saveOTP, verifyOTP } = require('../utils/otpStore');
const { sendOTPEmail } = require('../utils/emailService');

// ── Signup ────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
    try {
        const { name, email, password, college, branch, year, bio } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name,
            email,
            password: hashedPassword,
            college,
            branch,
            year,
            bio: bio || ''
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                college: user.college,
                branch: user.branch,
                year: user.year
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ── Login (Step 1: Validate credentials → send OTP) ───────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if account is blocked
        if (user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked by admin.' });
        }

        // ✅ Credentials valid — generate & send OTP
        const otp = saveOTP(email);

        try {
            await sendOTPEmail(email, otp);
            console.log(`📧 OTP sent to ${email}`);
        } catch (emailErr) {
            console.error('Email send error:', emailErr);
            // If email fails, fall back to logging OTP in dev (remove in production)
            console.log(`[DEV] OTP for ${email}: ${otp}`);
        }

        return res.status(200).json({
            otpSent: true,
            message: `OTP sent to ${email}. Please verify to complete login.`,
            email // Send back so frontend can use it in verify-otp call
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ── Verify OTP (Step 2: Complete login) ───────────────────────────
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const result = verifyOTP(email, otp);

        if (!result.valid) {
            return res.status(400).json({ message: result.reason });
        }

        // OTP valid — fetch user and issue JWT
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                college: user.college,
                branch: user.branch,
                year: user.year,
                role: user.role,
                skills: user.skills,
                experienceLevel: user.experienceLevel,
                preferredRole: user.preferredRole,
                availableHours: user.availableHours,
                hackathonInterests: user.hackathonInterests
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ── Resend OTP ────────────────────────────────────────────────────
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        // Check user exists before resending
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'No account found with this email.' });
        }

        const otp = saveOTP(email);

        try {
            await sendOTPEmail(email, otp);
            console.log(`📧 OTP resent to ${email}`);
        } catch (emailErr) {
            console.error('Resend email error:', emailErr);
            console.log(`[DEV] Resent OTP for ${email}: ${otp}`);
        }

        return res.status(200).json({
            message: `A new OTP has been sent to ${email}.`
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

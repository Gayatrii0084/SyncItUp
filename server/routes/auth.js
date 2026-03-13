const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

// ── Signup Route ──────────────────────────────────────────────────
router.post('/signup', [
    // 1. Name check
    body('name').notEmpty().withMessage('Full name is required'),

    // 2. Email check
    body('email').isEmail().withMessage('Please provide a valid college email address'),

    // 3. Password check — exactly 8 chars, uppercase, lowercase, number, special char
    body('password')
        .isLength({ min: 8, max: 8 }).withMessage('Password must be exactly 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter (A–Z)')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter (a–z)')
        .matches(/\d/).withMessage('Password must contain at least one number (0–9)')
        .matches(/[@#$%&*]/).withMessage('Password must contain at least one special character (@, #, $, %, &, *)'),

    // 4. Required fields check
    body('college').notEmpty().withMessage('College is required'),
    body('branch').notEmpty().withMessage('Branch is required')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, authController.signup);

// ── Login Route (Step 1 — validates credentials, sends OTP) ───────
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, authController.login);

// ── NEW: Send / Resend OTP ────────────────────────────────────────
router.post('/send-otp', [
    body('email').isEmail().withMessage('Valid email is required')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, authController.sendOTP);

// ── NEW: Verify OTP (Step 2 — issues JWT on success) ─────────────
router.post('/verify-otp', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits').isNumeric().withMessage('OTP must be numeric')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}, authController.verifyOTP);

// THE FILE MUST END HERE - NO BROWSER CODE BELOW
module.exports = router;
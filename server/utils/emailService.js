// ─────────────────────────────────────────────────────────────────
//  server/utils/emailService.js
//  Nodemailer transporter + OTP email sender for SyncItUp
// ─────────────────────────────────────────────────────────────────

const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter using credentials from .env
 *
 * Required .env variables:
 *   EMAIL_USER  — your Gmail address   (e.g. yourapp@gmail.com)
 *   EMAIL_PASS  — Gmail App Password   (NOT your normal Gmail password)
 *
 * To generate a Gmail App Password:
 *   Google Account → Security → 2-Step Verification → App Passwords
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Sends a 6-digit OTP to the given email address.
 * @param {string} toEmail   - recipient email
 * @param {string} otp       - 6-digit OTP string
 * @returns {Promise}
 */
async function sendOTPEmail(toEmail, otp) {
    const mailOptions = {
        from: `"SyncItUp" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔐 Your SyncItUp Login OTP',
        html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f1a; border-radius: 16px; border: 1px solid #1e1e3a; color: #e2e8f0;">
                <div style="text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 2rem;">⚡</span>
                    <h2 style="margin: 8px 0 0; color: #a78bfa; font-size: 1.5rem;">SyncItUp</h2>
                </div>

                <p style="margin: 0 0 8px; color: #94a3b8; font-size: 0.9rem;">Your one-time login verification code is:</p>

                <div style="text-align: center; margin: 24px 0;">
                    <span style="display: inline-block; letter-spacing: 0.5rem; font-size: 2.5rem; font-weight: 700; color: #a78bfa; background: #1e1e3a; padding: 16px 28px; border-radius: 12px; border: 2px solid #4c1d95;">
                        ${otp}
                    </span>
                </div>

                <p style="margin: 0; color: #ef4444; font-size: 0.85rem; text-align: center;">
                    ⏱ This OTP will expire in <strong>2 minutes</strong>.
                </p>

                <hr style="border: none; border-top: 1px solid #1e1e3a; margin: 24px 0;" />

                <p style="margin: 0; color: #475569; font-size: 0.8rem; text-align: center;">
                    If you didn't request this, you can safely ignore this email.<br>
                    Never share your OTP with anyone.
                </p>
            </div>
        `,
        // Plain text fallback
        text: `Your SyncItUp login OTP is: ${otp}\nThis OTP will expire in 2 minutes.\n\nIf you didn't request this, ignore this email.`
    };

    return transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail };

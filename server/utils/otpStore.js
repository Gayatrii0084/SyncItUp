// ─────────────────────────────────────────────────────────────────
//  server/utils/otpStore.js
//  In-memory OTP store with expiration + attempt tracking
// ─────────────────────────────────────────────────────────────────

/**
 * Map structure: email → { otp, expiresAt, attempts }
 *  - otp       : 6-digit string
 *  - expiresAt : timestamp (ms)
 *  - attempts  : number of wrong guesses (max 3)
 */
const otpMap = new Map();

const OTP_TTL_MS = 2 * 60 * 1000; // 2 minutes
const MAX_ATTEMPTS = 3;

/** Generates a cryptographically simple 6-digit OTP string */
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Save a new OTP for the given email (overwrites any existing entry) */
function saveOTP(email) {
    const otp = generateOTP();
    otpMap.set(email.toLowerCase(), {
        otp,
        expiresAt: Date.now() + OTP_TTL_MS,
        attempts: 0
    });
    return otp;
}

/**
 * Verify OTP for an email.
 * @returns {{ valid: boolean, reason?: string }}
 */
function verifyOTP(email, inputOtp) {
    const key = email.toLowerCase();
    const record = otpMap.get(key);

    if (!record) {
        return { valid: false, reason: 'No OTP found. Please request a new one.' };
    }

    if (Date.now() > record.expiresAt) {
        otpMap.delete(key);
        return { valid: false, reason: 'OTP has expired. Please request a new one.' };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
        otpMap.delete(key);
        return { valid: false, reason: 'Maximum attempts exceeded. Please request a new OTP.' };
    }

    if (record.otp !== inputOtp.toString()) {
        record.attempts += 1;
        const remaining = MAX_ATTEMPTS - record.attempts;
        return {
            valid: false,
            reason: remaining > 0
                ? `Incorrect OTP. ${remaining} attempt(s) remaining.`
                : 'Maximum attempts exceeded. Please request a new OTP.'
        };
    }

    // ✅ Valid — clean up
    otpMap.delete(key);
    return { valid: true };
}

/** Remove OTP entry (e.g. on resend) */
function clearOTP(email) {
    otpMap.delete(email.toLowerCase());
}

module.exports = { saveOTP, verifyOTP, clearOTP, generateOTP };

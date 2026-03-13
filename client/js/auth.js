// ─────────────────────────────────────────────────────────────────
//  SyncItUp — auth.js
//  Handles: signup (with password validation) + login (with OTP)
// ─────────────────────────────────────────────────────────────────

const API_URL = 'http://localhost:5000/api';

// ══════════════════════════════════════════════════════════════════
//  SHARED UTILITIES
// ══════════════════════════════════════════════════════════════════

function showMsg(id, text, hide = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.style.display = hide ? 'none' : 'block';
    if (hide) el.classList.add('hidden');
    else el.classList.remove('hidden');
}

function hideMsg(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hidden');
    el.style.display = 'none';
}

// ══════════════════════════════════════════════════════════════════
//  PASSWORD VALIDATION (Signup page)
// ══════════════════════════════════════════════════════════════════

function validatePassword(password) {
    const errors = [];
    if (password.length !== 8) errors.push('Password must be exactly 8 characters long.');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter (A–Z).');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter (a–z).');
    if (!/\d/.test(password)) errors.push('Password must contain at least one number (0–9).');
    if (!/[@#$%&*]/.test(password)) errors.push('Password must contain at least one special character (@, #, $, %, &, *).');
    return errors;
}

const rules = [
    { id: 'rule-length', test: p => p.length === 8, text: 'Exactly 8 characters' },
    { id: 'rule-upper', test: p => /[A-Z]/.test(p), text: 'At least one uppercase letter' },
    { id: 'rule-lower', test: p => /[a-z]/.test(p), text: 'At least one lowercase letter' },
    { id: 'rule-number', test: p => /\d/.test(p), text: 'At least one number' },
    { id: 'rule-special', test: p => /[@#$%&*]/.test(p), text: 'At least one special character (@#$%&*)' }
];

const passwordInput = document.getElementById('password');
const rulesBox = document.getElementById('password-rules');

if (rulesBox) {
    rulesBox.innerHTML = rules.map(r =>
        `<div id="${r.id}" class="pw-rule pw-rule--pending">
            <span class="pw-rule__icon">○</span>
            <span>${r.text}</span>
        </div>`
    ).join('');
}

if (passwordInput && rulesBox) {
    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        rules.forEach(r => {
            const el = document.getElementById(r.id);
            if (!el) return;
            const pass = r.test(val);
            el.className = 'pw-rule ' + (pass ? 'pw-rule--pass' : 'pw-rule--fail');
            el.querySelector('.pw-rule__icon').textContent = pass ? '✓' : '✗';
        });
    });
}

// ══════════════════════════════════════════════════════════════════
//  SIGNUP
// ══════════════════════════════════════════════════════════════════

const signupForm = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;
        const college = document.getElementById('college')?.value.trim();
        const branch = document.getElementById('branch')?.value.trim();
        const year = document.getElementById('year')?.value;
        const bio = document.getElementById('bio')?.value.trim();

        hideMsg('errorMessage');

        // Frontend password validation
        const pwErrors = validatePassword(password);
        if (pwErrors.length > 0) {
            showMsg('errorMessage', pwErrors.join('\n'));
            rules.forEach(r => {
                const el = document.getElementById(r.id);
                if (!el) return;
                const pass = r.test(password);
                el.className = 'pw-rule ' + (pass ? 'pw-rule--pass' : 'pw-rule--fail');
                el.querySelector('.pw-rule__icon').textContent = pass ? '✓' : '✗';
            });
            return;
        }

        signupBtn.textContent = 'Creating Account...';
        signupBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, college, branch, year, bio })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                const msg = data.errors?.map(e => e.msg).join('\n') || data.message || 'Signup failed.';
                showMsg('errorMessage', msg);
                signupBtn.textContent = 'Create Account';
                signupBtn.disabled = false;
            }
        } catch (err) {
            showMsg('errorMessage', 'Server is offline. Please try again later.');
            signupBtn.textContent = 'Create Account';
            signupBtn.disabled = false;
        }
    });
}

// ══════════════════════════════════════════════════════════════════
//  LOGIN — STEP 1: Credentials
// ══════════════════════════════════════════════════════════════════

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const otpSection = document.getElementById('otpSection');

// Stores the email after successful credential check (used in OTP step)
let _otpEmail = '';

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;

        hideMsg('errorMessage');

        loginBtn.textContent = 'Verifying...';
        loginBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.otpSent) {
                // ✅ Credentials OK — switch to OTP form
                _otpEmail = data.email || email;
                showOTPSection(_otpEmail);
            } else {
                const msg = data.errors?.map(e => e.msg).join('\n') || data.message || 'Invalid email or password.';
                showMsg('errorMessage', msg);
                loginBtn.textContent = 'Login';
                loginBtn.disabled = false;
            }
        } catch (err) {
            showMsg('errorMessage', 'Server is offline. Please try again later.');
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
    });
}

// ══════════════════════════════════════════════════════════════════
//  OTP SECTION — Show / Hide + Timer + Input UX
// ══════════════════════════════════════════════════════════════════

let _timerInterval = null;

function showOTPSection(email) {
    // Update title
    document.getElementById('formTitle').textContent = 'Verify Your Identity';
    document.getElementById('formSubtitle').textContent = 'Enter the 6-digit OTP sent to your email';

    // Hide login form, show otp section
    loginForm.style.display = 'none';
    otpSection.style.display = 'block';

    // Display email
    const emailDisplay = document.getElementById('otpEmailDisplay');
    if (emailDisplay) emailDisplay.textContent = email;

    // Clear inputs
    getOTPInputs().forEach(inp => { inp.value = ''; inp.classList.remove('filled'); });
    getOTPInputs()[0]?.focus();

    hideMsg('errorMessage2');
    hideMsg('successMessage');

    // Start 2-minute countdown
    startOTPTimer(120);

    // Start resend countdown (60s disable)
    startResendCountdown(60);
}

function hideOTPSection() {
    document.getElementById('formTitle').textContent = 'Welcome Back!';
    document.getElementById('formSubtitle').textContent = 'Login to find your perfect teammates';
    loginForm.style.display = 'block';
    otpSection.style.display = 'none';
    loginBtn.textContent = 'Login';
    loginBtn.disabled = false;
    clearInterval(_timerInterval);
}

function getOTPInputs() {
    return Array.from({ length: 6 }, (_, i) => document.getElementById(`otp-${i}`)).filter(Boolean);
}

function getOTPValue() {
    return getOTPInputs().map(i => i.value).join('');
}

// ── OTP digit input navigation ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    getOTPInputs().forEach((input, idx) => {
        input.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\D/g, '');
            e.target.value = val;
            if (val) {
                e.target.classList.add('filled');
                if (idx < 5) getOTPInputs()[idx + 1]?.focus();
            } else {
                e.target.classList.remove('filled');
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && idx > 0) {
                getOTPInputs()[idx - 1]?.focus();
            }
            if (e.key === 'Enter') {
                document.getElementById('verifyOtpBtn')?.click();
            }
        });
        // Allow paste of full OTP
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
            const inputs = getOTPInputs();
            pasted.split('').forEach((ch, i) => {
                if (inputs[i]) { inputs[i].value = ch; inputs[i].classList.add('filled'); }
            });
            inputs[Math.min(pasted.length, 5)]?.focus();
        });
    });
});

// ── Countdown timer ───────────────────────────────────────────────
function startOTPTimer(seconds) {
    clearInterval(_timerInterval);
    const timerEl = document.getElementById('otpTimer');
    let remaining = seconds;

    function tick() {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        const label = `⏱ ${m}:${String(s).padStart(2, '0')} remaining`;
        if (timerEl) {
            timerEl.textContent = label;
            timerEl.className = 'otp-timer ' + (remaining <= 30 ? 'warning' : 'ok');
        }
        if (remaining <= 0) {
            clearInterval(_timerInterval);
            if (timerEl) timerEl.textContent = '⏱ OTP expired';
        } else {
            remaining--;
        }
    }

    tick();
    _timerInterval = setInterval(tick, 1000);
}

// ── Resend countdown ──────────────────────────────────────────────
function startResendCountdown(seconds) {
    const btn = document.getElementById('resendOtpBtn');
    if (!btn) return;
    btn.disabled = true;
    let remaining = seconds;

    const iv = setInterval(() => {
        remaining--;
        btn.textContent = `Resend OTP (wait ${remaining}s)`;
        if (remaining <= 0) {
            clearInterval(iv);
            btn.textContent = 'Resend OTP';
            btn.disabled = false;
        }
    }, 1000);
}

// ── Back to login ─────────────────────────────────────────────────
document.getElementById('backToLoginBtn')?.addEventListener('click', hideOTPSection);

// ══════════════════════════════════════════════════════════════════
//  LOGIN — STEP 2: Verify OTP
// ══════════════════════════════════════════════════════════════════

document.getElementById('verifyOtpBtn')?.addEventListener('click', async () => {
    const otp = getOTPValue();

    hideMsg('errorMessage2');
    hideMsg('successMessage');

    if (otp.length !== 6) {
        showMsg('errorMessage2', 'Please enter the complete 6-digit OTP.');
        return;
    }

    const verifyBtn = document.getElementById('verifyOtpBtn');
    verifyBtn.textContent = 'Verifying...';
    verifyBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: _otpEmail, otp })
        });

        const data = await response.json();

        if (response.ok) {
            showMsg('successMessage', '✅ Verified! Redirecting...');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            clearInterval(_timerInterval);
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
        } else {
            showMsg('errorMessage2', data.message || 'Incorrect OTP. Please try again.');
            verifyBtn.textContent = 'Verify OTP';
            verifyBtn.disabled = false;
        }
    } catch (err) {
        showMsg('errorMessage2', 'Server is offline. Please try again later.');
        verifyBtn.textContent = 'Verify OTP';
        verifyBtn.disabled = false;
    }
});

// ══════════════════════════════════════════════════════════════════
//  Resend OTP
// ══════════════════════════════════════════════════════════════════

document.getElementById('resendOtpBtn')?.addEventListener('click', async () => {
    hideMsg('errorMessage2');

    try {
        const response = await fetch(`${API_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: _otpEmail })
        });

        const data = await response.json();
        if (response.ok) {
            showMsg('successMessage', '📧 New OTP sent! Check your email.');
            startOTPTimer(120);
            startResendCountdown(60);
            getOTPInputs().forEach(inp => { inp.value = ''; inp.classList.remove('filled'); });
            getOTPInputs()[0]?.focus();
        } else {
            showMsg('errorMessage2', data.message || 'Failed to resend OTP.');
        }
    } catch (err) {
        showMsg('errorMessage2', 'Server is offline. Please try again later.');
    }
});
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
//  AUTH HEADER HELPER
// ─────────────────────────────────────────────
function getAuthHeaders() {
    const token = localStorage.getItem('token');

    // Ensure headers always return correctly
    const headers = {
        'Content-Type': 'application/json'
    };

    // Add Authorization only if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

// make it globally accessible for other JS files (matching.js, teams.js, etc.)
window.getAuthHeaders = getAuthHeaders;

// ─────────────────────────────────────────────
//  LOGOUT HELPER
// ─────────────────────────────────────────────
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

window.logout = logout;
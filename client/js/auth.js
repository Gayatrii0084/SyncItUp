// API Base URL
const API_URL = 'http://localhost:5000/api';

// Check if already logged in
const checkAuth = () => {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;

    if (token && (currentPage.includes('login.html') || currentPage.includes('signup.html'))) {
        window.location.href = 'dashboard.html';
    }

    if (!token && !currentPage.includes('login.html') && !currentPage.includes('signup.html') && !currentPage.includes('index.html')) {
        window.location.href = 'login.html';
    }
};

// Run check on load
checkAuth();

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const errorMsg = document.getElementById('errorMessage');

        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;
        errorMsg.classList.add('hidden');

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.textContent = data.message || 'Login failed';
                errorMsg.classList.remove('hidden');
                loginBtn.textContent = 'Login';
                loginBtn.disabled = false;
            }
        } catch (error) {
            errorMsg.textContent = 'Network error. Please try again.';
            errorMsg.classList.remove('hidden');
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
    });
}

// Signup Form Handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            college: document.getElementById('college').value,
            branch: document.getElementById('branch').value,
            year: document.getElementById('year').value,
            bio: document.getElementById('bio').value
        };

        const signupBtn = document.getElementById('signupBtn');
        const errorMsg = document.getElementById('errorMessage');

        signupBtn.textContent = 'Creating account...';
        signupBtn.disabled = true;
        errorMsg.classList.add('hidden');

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = 'dashboard.html';
            } else {
                errorMsg.textContent = data.message || 'Signup failed';
                errorMsg.classList.remove('hidden');
                signupBtn.textContent = 'Create Account';
                signupBtn.disabled = false;
            }
        } catch (error) {
            errorMsg.textContent = 'Network error. Please try again.';
            errorMsg.classList.remove('hidden');
            signupBtn.textContent = 'Create Account';
            signupBtn.disabled = false;
        }
    });
}

// Logout function
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
};

// Get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Export for use in other files
window.logout = logout;
window.getAuthHeaders = getAuthHeaders;
window.API_URL = API_URL;

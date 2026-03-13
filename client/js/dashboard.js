// Dashboard page logic (recommendations + collaboration requests)

document.addEventListener('DOMContentLoaded', () => {
    // Auth guard — redirect to login if not authenticated
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Personalize welcome text
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const welcomeEl = document.getElementById('welcomeText');
    if (user && user.name && welcomeEl) {
        welcomeEl.textContent = `Welcome back, ${user.name.split(' ')[0]}! 👋`;
    }

    // Add admin link if applicable
    if (user && user.role === 'admin') {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.getElementById('adminNavLink')) {
            const adminLi = document.createElement('li');
            adminLi.id = 'adminNavLink';
            adminLi.innerHTML = '<a href="/admin/dashboard" style="color: #f59e0b; font-weight: 600;">🛡 Admin</a>';
            navLinks.insertBefore(adminLi, navLinks.lastElementChild);
        }
    }

    // Load dashboard sections
    try {
        if (typeof loadRecommendations === 'function') {
            loadRecommendations(3);
        }
    } catch (err) {
        console.error('Failed to load recommendations:', err);
        const container = document.getElementById('recommendationsContainer');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem; grid-column: 1 / -1;">Failed to load recommendations.</p>';
        }
    }

    // Collaboration requests
    loadRequests();
});

async function loadRequests() {
    const container = document.getElementById('requestsContainer');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/team/requests/received`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            container.innerHTML = `<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">${errData.message || 'Failed to load requests.'}</p>`;
            return;
        }

        const data = await response.json();

        if (!data.requests || data.requests.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No pending requests</p>';
            return;
        }

        container.innerHTML = data.requests.map(req => `
          <div class="card mb-2">
            <div class="flex-between">
              <div>
                <h4>${req.sender.name}</h4>
                <p style="font-size: 0.875rem; color: var(--text-secondary);">${req.sender.college} - ${req.sender.branch}</p>
                <div class="skill-tags mt-1">
                  ${(req.sender.skills || []).map(s => `<span class="skill-tag ${getSkillCategory(s)}">${s}</span>`).join('')}
                </div>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-primary btn-small" data-request-id="${req._id}" data-status="accepted">Accept</button>
                <button class="btn btn-secondary btn-small" data-request-id="${req._id}" data-status="rejected">Reject</button>
              </div>
            </div>
          </div>
        `).join('');

        // Attach click handlers using event delegation
        container.addEventListener('click', async (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;
            const requestId = target.getAttribute('data-request-id');
            const status = target.getAttribute('data-status');
            if (requestId && status) {
                await handleRequest(requestId, status);
            }
        }, { once: true });
    } catch (error) {
        console.error('Load requests error:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">Error loading requests. Please refresh.</p>';
    }
}

async function handleRequest(requestId, status) {
    try {
        const response = await fetch(`${API_URL}/team/request/${requestId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            await loadRequests();
            if (status === 'accepted') {
                alert('Request accepted! Team created.');
            }
        } else {
            const data = await response.json().catch(() => ({}));
            alert(data.message || 'Failed to update request.');
        }
    } catch (error) {
        console.error('Handle request error:', error);
        alert('Failed to update request. Please try again.');
    }
}

// Expose for potential future use
window.loadRequests = loadRequests;

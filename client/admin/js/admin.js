// ─────────────────────────────────────────────────────────────────
//  SyncItUp — Admin Dashboard JavaScript
// ─────────────────────────────────────────────────────────────────

const API_URL = 'http://localhost:5000/api';

// ── Helpers ───────────────────────────────────────────────────────

function getToken() {
    return localStorage.getItem('token');
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

function showToast(msg, color = '#10b981') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = color;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

function adminLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// ── Auth & Role Guard ────────────────────────────────────────────

const _token = getToken();
if (!_token) {
    window.location.href = '/login.html';
}

const _storedUser = JSON.parse(localStorage.getItem('user') || '{}');
if (_storedUser.role !== 'admin') {
    alert('Access denied. Admins only.');
    window.location.href = '/dashboard.html';
}

// Display admin's college
document.addEventListener('DOMContentLoaded', () => {
    const collegeEl = document.getElementById('adminCollegeDisplay');
    if (collegeEl && _storedUser.college) {
        collegeEl.textContent = `🏫 ${_storedUser.college}`;
    }
    loadAll();
});

// ── Data Cache ────────────────────────────────────────────────────

let _users = [];
let _teams = [];
let _reports = [];

// ── Load All Data ─────────────────────────────────────────────────

async function loadAll() {
    await Promise.allSettled([
        loadUsers(),
        loadTeams(),
        loadReports()
    ]);
}

// ── Tab Switching ──────────────────────────────────────────────────

function switchTab(tab, btnEl) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    btnEl.classList.add('active');
}

// ── Users ─────────────────────────────────────────────────────────

async function loadUsers() {
    const content = document.getElementById('usersContent');
    try {
        const res = await fetch(`${API_URL}/admin/users`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to load users');
        const data = await res.json();
        _users = data.users || [];
        renderUsers();
        updateStats();
    } catch (err) {
        content.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`;
    }
}

function renderUsers(list = _users) {
    const content = document.getElementById('usersContent');
    const blockedContent = document.getElementById('blockedContent');

    if (list.length === 0) {
        content.innerHTML = '<div class="empty-state"><div class="icon">👥</div><p>No users found.</p></div>';
    } else {
        content.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Branch</th>
                        <th>Year</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.filter(u => !u.isBlocked).map(u => userRow(u)).join('')}
                </tbody>
            </table>
        `;
    }

    // Also update blocked tab
    const blockedUsers = _users.filter(u => u.isBlocked);
    if (blockedUsers.length === 0) {
        blockedContent.innerHTML = '<div class="empty-state"><div class="icon">✅</div><p>No blocked users.</p></div>';
    } else {
        blockedContent.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Branch</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${blockedUsers.map(u => blockedRow(u)).join('')}
                </tbody>
            </table>
        `;
    }
}

function userRow(u) {
    const statusBadge = u.isBlocked
        ? `<span class="blocked-badge">🚫 Blocked</span>`
        : `<span class="active-badge">✅ Active</span>`;
    const roleTag = u.role === 'admin' ? `<span class="admin-badge">Admin</span>` : '';

    return `
        <tr>
            <td><strong>${escHtml(u.name)}</strong>${roleTag}</td>
            <td>${escHtml(u.email)}</td>
            <td>${escHtml(u.branch || '—')}</td>
            <td>${escHtml(u.year || '—')}</td>
            <td>${statusBadge}</td>
            <td>
                ${u.role !== 'admin'
                    ? `<button class="btn btn-danger" onclick="blockUser('${u._id}', '${escHtml(u.name)}')">Block</button>`
                    : '<span style="color: var(--text-tertiary); font-size: 0.75rem;">—</span>'
                }
            </td>
        </tr>
    `;
}

function blockedRow(u) {
    return `
        <tr>
            <td><strong>${escHtml(u.name)}</strong> <span class="blocked-badge">🚫 Blocked</span></td>
            <td>${escHtml(u.email)}</td>
            <td>${escHtml(u.branch || '—')}</td>
            <td>
                <button class="btn btn-success" onclick="unblockUser('${u._id}', '${escHtml(u.name)}')">Unblock</button>
            </td>
        </tr>
    `;
}

function filterUsers() {
    const q = document.getElementById('userSearch').value.toLowerCase();
    const filtered = _users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
    renderUsers(filtered);
}

async function blockUser(userId, name) {
    if (!confirm(`Block ${name}? They will lose all access until unblocked.`)) return;
    try {
        const res = await fetch(`${API_URL}/admin/users/${userId}/block`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`🚫 ${name} has been blocked.`, '#ef4444');
            await loadUsers();
            updateStats();
        } else {
            showToast(data.message || 'Failed to block user.', '#ef4444');
        }
    } catch (err) {
        showToast('Server error.', '#ef4444');
    }
}

async function unblockUser(userId, name) {
    if (!confirm(`Unblock ${name}?`)) return;
    try {
        const res = await fetch(`${API_URL}/admin/users/${userId}/unblock`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`✅ ${name} has been unblocked.`, '#10b981');
            await loadUsers();
            updateStats();
        } else {
            showToast(data.message || 'Failed to unblock user.', '#ef4444');
        }
    } catch (err) {
        showToast('Server error.', '#ef4444');
    }
}

// ── Teams ─────────────────────────────────────────────────────────

async function loadTeams() {
    const content = document.getElementById('teamsContent');
    try {
        const res = await fetch(`${API_URL}/admin/teams`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to load teams');
        const data = await res.json();
        _teams = data.teams || [];
        renderTeams();
        updateStats();
    } catch (err) {
        content.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`;
    }
}

function renderTeams() {
    const content = document.getElementById('teamsContent');
    if (_teams.length === 0) {
        content.innerHTML = '<div class="empty-state"><div class="icon">🤝</div><p>No teams found.</p></div>';
        return;
    }
    content.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Team Name</th>
                    <th>Members</th>
                    <th>Created By</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${_teams.map(t => `
                    <tr>
                        <td><strong>${escHtml(t.name || 'Collaboration Team')}</strong></td>
                        <td>
                            ${(t.members || []).map(m =>
                                `<div style="font-size:0.8rem;">${escHtml(m.name)} <span style="color:var(--text-tertiary)">(${escHtml(m.college || '')})</span></div>`
                            ).join('')}
                        </td>
                        <td>${t.createdBy ? escHtml(t.createdBy.name) : '—'}</td>
                        <td style="white-space:nowrap; color:var(--text-secondary);">${new Date(t.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-danger" onclick="removeTeam('${t._id}', '${escHtml(t.name || 'Team')}')">Remove</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function removeTeam(teamId, name) {
    if (!confirm(`Remove team "${name}"? This cannot be undone.`)) return;
    try {
        const res = await fetch(`${API_URL}/admin/teams/${teamId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok) {
            showToast(`🗑 Team removed.`, '#f59e0b');
            await loadTeams();
            updateStats();
        } else {
            showToast(data.message || 'Failed to remove team.', '#ef4444');
        }
    } catch (err) {
        showToast('Server error.', '#ef4444');
    }
}

// ── Reports ───────────────────────────────────────────────────────

async function loadReports() {
    const content = document.getElementById('reportsContent');
    try {
        const res = await fetch(`${API_URL}/admin/reports`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to load reports');
        const data = await res.json();
        _reports = data.reports || [];
        renderReports();
        updateStats();
    } catch (err) {
        content.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`;
    }
}

function renderReports() {
    const content = document.getElementById('reportsContent');
    if (_reports.length === 0) {
        content.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>No reports filed yet.</p></div>';
        return;
    }
    content.innerHTML = _reports.map(r => `
        <div class="report-card">
            <div class="flex-between">
                <div>
                    <strong>Reporter:</strong> ${escHtml(r.reporterId?.name || 'Unknown')} 
                    <span style="color:var(--text-tertiary); font-size:0.8rem;">(${escHtml(r.reporterId?.email || '')})</span>
                </div>
                <span style="font-size:0.75rem; color:var(--text-tertiary);">${new Date(r.timestamp).toLocaleString()}</span>
            </div>
            <div style="margin-top:0.5rem;">
                <strong>Reported:</strong> ${escHtml(r.reportedUserId?.name || 'Unknown')}
                <span style="color:var(--text-tertiary); font-size:0.8rem;">(${escHtml(r.reportedUserId?.email || '')})</span>
                ${r.reportedUserId?.isBlocked ? '<span class="blocked-badge" style="margin-left:0.5rem;">🚫 Blocked</span>' : ''}
            </div>
            <div style="margin-top:0.5rem;">
                <strong>Reason:</strong> 
                <span style="background:rgba(239,68,68,0.12); color:#ef4444; padding:0.15rem 0.5rem; border-radius:0.3rem; font-size:0.8rem; font-weight:600;">
                    ${escHtml(r.reason)}
                </span>
            </div>

            ${r.lastMessages && r.lastMessages.length > 0 ? `
                <div class="report-messages">
                    <strong style="font-size:0.8rem; color:var(--text-secondary);">📨 Last Chat Messages (${r.lastMessages.length}):</strong>
                    <div style="margin-top:0.5rem;">
                        ${r.lastMessages.map(m => `
                            <div class="msg-bubble">
                                <span class="msg-sender">${escHtml(m.senderName)}:</span>
                                <span style="color:var(--text-primary);">${escHtml(m.content)}</span>
                                <span style="color:var(--text-tertiary); font-size:0.7rem; margin-left:auto; white-space:nowrap;">${new Date(m.timestamp).toLocaleTimeString()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : `<div style="margin-top:0.5rem; font-size:0.8rem; color:var(--text-tertiary);">💬 No shared chat history found.</div>`}

            <div style="margin-top:1rem; display:flex; gap:0.5rem;">
                ${!r.reportedUserId?.isBlocked
                    ? `<button class="btn btn-danger" onclick="blockUser('${r.reportedUserId?._id}', '${escHtml(r.reportedUserId?.name || '')}')">Block Reported User</button>`
                    : `<button class="btn btn-success" onclick="unblockUser('${r.reportedUserId?._id}', '${escHtml(r.reportedUserId?.name || '')}')">Unblock User</button>`
                }
            </div>
        </div>
    `).join('');
}

// ── Stats ─────────────────────────────────────────────────────────

function updateStats() {
    document.getElementById('statUsers').textContent = _users.length || '—';
    document.getElementById('statTeams').textContent = _teams.length || '—';
    document.getElementById('statReports').textContent = _reports.length || '—';
    document.getElementById('statBlocked').textContent = _users.filter(u => u.isBlocked).length || '0';
}

// ── Security: XSS escaping ────────────────────────────────────────
function escHtml(str) {
    if (typeof str !== 'string') return str || '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Make functions available in HTML onclick handlers
window.switchTab = switchTab;
window.blockUser = blockUser;
window.unblockUser = unblockUser;
window.removeTeam = removeTeam;
window.filterUsers = filterUsers;
window.adminLogout = adminLogout;

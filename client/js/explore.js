// Explore users JavaScript

let allUsers = [];
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const isAdminUser = currentUser && currentUser.role === 'admin';

// Get skill category helper
function getSkillCategory(skill) {
    const skillLower = skill.toLowerCase();
    if (['react', 'vue', 'angular', 'html', 'css', 'javascript', 'frontend'].some(k => skillLower.includes(k))) return 'frontend';
    if (['backend', 'node', 'express', 'django', 'flask', 'spring', 'api'].some(k => skillLower.includes(k))) return 'backend';
    if (['ml', 'machine learning', 'ai', 'python', 'tensorflow', 'pytorch'].some(k => skillLower.includes(k))) return 'ml';
    if (['mobile', 'android', 'ios', 'react native', 'flutter'].some(k => skillLower.includes(k))) return 'mobile';
    if (['devops', 'docker', 'kubernetes', 'aws', 'azure'].some(k => skillLower.includes(k))) return 'devops';
    if (['blockchain', 'web3', 'ethereum', 'solidity'].some(k => skillLower.includes(k))) return 'blockchain';
    if (['iot', 'arduino', 'raspberry'].some(k => skillLower.includes(k))) return 'iot';
    if (['ui/ux', 'figma', 'adobe', 'design'].some(k => skillLower.includes(k))) return 'design';
    if (['data', 'pandas', 'visualization'].some(k => skillLower.includes(k))) return 'data';
    return 'default';
}

// Load all users with recommendations
async function loadUsers() {
    // Admin accounts should not use the explore/matching system
    if (isAdminUser) {
        const container = document.getElementById('usersContainer');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 3rem; grid-column: 1 / -1;">Admin accounts cannot explore teammates. Use the Admin Dashboard instead.</p>';
        }
        return;
    }
    try {
        const response = await fetch(`${API_URL}/matching/recommendations`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        allUsers = (data.recommendations || []).map(rec => ({
            ...(rec.user || {}),
            score: rec.score
        }));

        displayUsers(allUsers);
    } catch (error) {
        console.error('Load users error:', error);
    }
}

// Display users
function displayUsers(users) {
    const container = document.getElementById('usersContainer');

    if (!Array.isArray(users) || users.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 3rem; grid-column: 1 / -1;">No users found</p>';
        return;
    }

    container.innerHTML = users.map(user => {
    const skills = Array.isArray(user.skills) ? user.skills : [];
    return `
    <div class="card">
      <div class="flex-between mb-2">
        <h3 class="card-title">${user.name}</h3>
        ${user.score ? `<div class="compatibility-badge">${user.score}%</div>` : ''}
      </div>
      
      <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
        ${user.college} - ${user.year}
      </p>
      
      <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem; min-height: 3rem;">
        ${user.bio || 'No bio provided'}
      </p>
      
      <div class="mb-2">
        <strong style="font-size: 0.875rem;">Skills:</strong>
        <div class="skill-tags">
          ${skills.slice(0, 4).map(skill =>
        `<span class="skill-tag ${getSkillCategory(skill)}">${skill}</span>`
    ).join('')}
          ${skills.length > 4 ? `<span class="skill-tag default">+${skills.length - 4}</span>` : ''}
        </div>
      </div>
      
      <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 0.5rem;">
        <div>📊 ${user.experienceLevel}</div>
        <div>⏰ ${user.availableHours} hrs/week</div>
        <div>👥 ${user.preferredRole}</div>
      </div>
      
      ${user.score ? `
        <div class="progress-bar mb-2">
          <div class="progress-fill" style="width: ${user.score}%"></div>
        </div>
      ` : ''}
      
      <button class="btn btn-primary btn-small" style="width: 100%;" onclick="sendRequest('${user._id}')">
        Send Request
      </button>
    </div>
  `).join('');
}

// Apply filters
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const skillFilter = document.getElementById('skillFilter').value;
    const experienceFilter = document.getElementById('experienceFilter').value;

    let filtered = allUsers;

    // Search filter
    if (search) {
        filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(search) ||
            user.college.toLowerCase().includes(search) ||
            user.branch.toLowerCase().includes(search)
        );
    }

    // Skill filter
    if (skillFilter) {
        filtered = filtered.filter(user =>
            user.skills.some(skill => getSkillCategory(skill) === skillFilter)
        );
    }

    // Experience filter
    if (experienceFilter) {
        filtered = filtered.filter(user => user.experienceLevel === experienceFilter);
    }

    displayUsers(filtered);
}

// Send request
async function sendRequest(userId) {
    try {
        const response = await fetch(`${API_URL}/team/request`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ receiverId: userId, message: 'Let\'s collaborate!' })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Request sent successfully!');
        } else {
            alert(data.message || 'Failed to send request');
        }
    } catch (error) {
        console.error('Send request error:', error);
        alert('Failed to send request');
    }
}

// Make functions global
window.applyFilters = applyFilters;
window.sendRequest = sendRequest;

// Load users on page load
loadUsers();

// Real-time filter
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('skillFilter').addEventListener('change', applyFilters);
document.getElementById('experienceFilter').addEventListener('change', applyFilters);

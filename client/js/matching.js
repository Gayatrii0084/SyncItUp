// Matching recommendations JavaScript

// Get skill category for styling
function getSkillCategory(skill) {
    const skillLower = skill.toLowerCase();
    if (['react', 'vue', 'angular', 'html', 'css', 'javascript', 'frontend', 'ui/ux', 'design'].some(k => skillLower.includes(k))) return 'frontend';
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

// Load recommendations
async function loadRecommendations(limit = 10) {
    try {
        const response = await fetch(`${API_URL}/matching/recommendations`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        const container = document.getElementById('recommendationsContainer');
        const recommendations = limit ? data.recommendations.slice(0, limit) : data.recommendations;

        if (recommendations.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem; grid-column: 1 / -1;">No recommendations yet. Update your profile to get matched!</p>';
            return;
        }

        container.innerHTML = recommendations.map(match => `
      <div class="card">
        <div class="flex-between mb-2">
          <h3 class="card-title">${match.user.name}</h3>
          <div class="compatibility-badge">${match.score}%</div>
        </div>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
          ${match.user.college} - ${match.user.year}
        </p>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1rem;">
          ${match.user.bio || 'No bio provided'}
        </p>
        
        <div class="mb-2">
          <strong style="font-size: 0.875rem;">Skills:</strong>
          <div class="skill-tags">
            ${match.user.skills.slice(0, 4).map(skill =>
            `<span class="skill-tag ${getSkillCategory(skill)}">${skill}</span>`
        ).join('')}
            ${match.user.skills.length > 4 ? `<span class="skill-tag default">+${match.user.skills.length - 4}</span>` : ''}
          </div>
        </div>
        
        <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 1rem;">
          <div>${match.user.experienceLevel} • ${match.user.availableHours} hrs/week</div>
          <div>${match.user.preferredRole}</div>
        </div>
        
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${match.score}%"></div>
        </div>
        
        <button class="btn btn-primary btn-small" style="width: 100%; margin-top: 1rem;" onclick="sendCollaborationRequest('${match.user._id}')">
          Send Request
        </button>
      </div>
    `).join('');
    } catch (error) {
        console.error('Load recommendations error:', error);
        const container = document.getElementById('recommendationsContainer');
        container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem; grid-column: 1 / -1;">Error loading recommendations</p>';
    }
}

// Send collaboration request
async function sendCollaborationRequest(receiverId) {
    try {
        const response = await fetch(`${API_URL}/team/request`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ receiverId, message: 'Let\'s collaborate!' })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Collaboration request sent!');
        } else {
            alert(data.message || 'Failed to send request');
        }
    } catch (error) {
        console.error('Send request error:', error);
        alert('Failed to send request');
    }
}

// Make functions available globally
window.loadRecommendations = loadRecommendations;
window.sendCollaborationRequest = sendCollaborationRequest;
window.getSkillCategory = getSkillCategory;

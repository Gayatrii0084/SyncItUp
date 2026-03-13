// Profile management JavaScript

let currentSkills = [];
let currentInterests = [];

// Load current user profile
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/profile/me`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            console.error('Failed to load profile:', response.status);
            return;
        }

        const data = await response.json();
        const user = data.user;

        // Update sidebar
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileCollege').textContent = user.college;
        document.getElementById('profileBranch').textContent = user.branch;
        document.getElementById('profileYear').textContent = user.year;
        document.getElementById('profileEmail').textContent = user.email;

        // Update form
        document.getElementById('name').value = user.name;
        document.getElementById('bio').value = user.bio || '';
        document.getElementById('experienceLevel').value = user.experienceLevel || 'Beginner';
        document.getElementById('preferredRole').value = user.preferredRole || 'Looking for team';
        document.getElementById('availableHours').value = user.availableHours || 10;

        // Set skills and interests
        currentSkills = user.skills || [];
        currentInterests = user.hackathonInterests || [];
        renderSkills();
        renderInterests();

        // Update localStorage
        localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// Render skills
function renderSkills() {
    const container = document.getElementById('skillsContainer');
    container.innerHTML = currentSkills.map((skill, index) => `
    <span class="skill-tag ${getSkillCategory(skill)} removable" onclick="removeSkill(${index})">
      ${skill}
      <span class="remove-btn">×</span>
    </span>
  `).join('');
}

// Add skill
function addSkill() {
    const input = document.getElementById('skillInput');
    const skill = input.value.trim();

    if (skill && !currentSkills.includes(skill)) {
        currentSkills.push(skill);
        renderSkills();
        input.value = '';
    }
}

// Remove skill
function removeSkill(index) {
    currentSkills.splice(index, 1);
    renderSkills();
}

// Render interests
function renderInterests() {
    const container = document.getElementById('interestsContainer');
    container.innerHTML = currentInterests.map((interest, index) => `
    <span class="skill-tag default removable" onclick="removeInterest(${index})">
      ${interest}
      <span class="remove-btn">×</span>
    </span>
  `).join('');
}

// Add interest
function addInterest() {
    const input = document.getElementById('interestInput');
    const interest = input.value.trim();

    if (interest && !currentInterests.includes(interest)) {
        currentInterests.push(interest);
        renderInterests();
        input.value = '';
    }
}

// Remove interest
function removeInterest(index) {
    currentInterests.splice(index, 1);
    renderInterests();
}

// Save profile
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        bio: document.getElementById('bio').value,
        experienceLevel: document.getElementById('experienceLevel').value,
        preferredRole: document.getElementById('preferredRole').value,
        availableHours: parseInt(document.getElementById('availableHours').value),
        skills: currentSkills,
        hackathonInterests: currentInterests
    };

    const saveBtn = document.getElementById('saveBtn');
    const successMsg = document.getElementById('successMessage');

    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    successMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            successMsg.textContent = 'Profile updated successfully!';
            successMsg.classList.remove('hidden');
            loadProfile();
        } else {
            const data = await response.json().catch(() => ({}));
            successMsg.textContent = data.message || 'Failed to save profile.';
            successMsg.style.color = '#ef4444';
            successMsg.style.background = 'rgba(239,68,68,0.1)';
            successMsg.classList.remove('hidden');
        }

        saveBtn.textContent = 'Save Changes';
        saveBtn.disabled = false;
    } catch (error) {
        console.error('Save profile error:', error);
        saveBtn.textContent = 'Save Changes';
        saveBtn.disabled = false;
    }
});

// ─── Report a User ───────────────────────────────────────────────
document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const reportedEmail = document.getElementById('reportedEmail').value.trim();
    const reason = document.getElementById('reportReason').value;
    const successMsg = document.getElementById('reportSuccessMsg');
    const errorMsg = document.getElementById('reportErrorMsg');
    const reportBtn = document.getElementById('reportBtn');

    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    if (!reportedEmail || !reason) {
        errorMsg.textContent = 'Please fill in all fields.';
        errorMsg.classList.remove('hidden');
        return;
    }

    reportBtn.textContent = 'Submitting...';
    reportBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/report`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ reportedUserEmail: reportedEmail, reason })
        });

        const data = await response.json();

        if (response.ok) {
            successMsg.textContent = data.message || 'Report submitted successfully!';
            successMsg.classList.remove('hidden');
            document.getElementById('reportedEmail').value = '';
            document.getElementById('reportReason').value = '';
        } else {
            errorMsg.textContent = data.message || 'Failed to submit report.';
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Report error:', error);
        errorMsg.textContent = 'Server error. Please try again.';
        errorMsg.classList.remove('hidden');
    }

    reportBtn.textContent = 'Submit Report';
    reportBtn.disabled = false;
});

// Helper function from matching.js
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

// Make functions global
window.addSkill = addSkill;
window.removeSkill = removeSkill;
window.addInterest = addInterest;
window.removeInterest = removeInterest;

// Load profile on page load
loadProfile();

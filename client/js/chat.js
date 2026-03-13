// Chat and Teams JavaScript

let socket;
let currentTeam = null;
let currentUser = null;
let typingTimeout;

// Initialize socket connection
function initSocket() {
    socket = io('http://localhost:5000');

    socket.on('connect', () => {
        console.log('Socket connected');
    });

    socket.on('new-message', (message) => {
        displayMessage(message);
    });

    socket.on('user-typing', ({ userName }) => {
        showTypingIndicator(userName);
    });

    socket.on('user-stop-typing', () => {
        hideTypingIndicator();
    });

    socket.on('previous-messages', (messages) => {
        messages.forEach(msg => displayMessage(msg));
    });
}

// Load teams
async function loadTeams() {
    const container = document.getElementById('teamsListContainer');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/team/my-teams`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            container.innerHTML = `<p style="text-align: center; color: var(--text-tertiary); padding: 2rem; font-size: 0.875rem;">${errData.message || 'Failed to load teams.'}</p>`;
            return;
        }

        const data = await response.json();

        if (!data.teams || data.teams.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem; font-size: 0.875rem;">No teams yet. Connect with teammates!</p>';
            return;
        }

        container.innerHTML = data.teams.map(team => {
            const otherMembers = (team.members || []).filter(m => m._id !== currentUser.id);
            const teamName = otherMembers.map(m => (m.name || '').split(' ')[0]).join(', ') || 'Team Room';

            return `
        <div class="card mb-2" style="cursor: pointer; padding: 1rem;" onclick="selectTeam('${team._id}', '${teamName}', ${JSON.stringify(team.members || []).replace(/"/g, '&quot;')})">
          <h4 style="margin-bottom: 0.25rem; font-size: 1rem;">${teamName}</h4>
          <p style="font-size: 0.75rem; color: var(--text-tertiary); margin: 0;">${(team.members || []).length} members</p>
        </div>
      `;
        }).join('');
    } catch (error) {
        console.error('Load teams error:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem; font-size: 0.875rem;">Error loading teams. Please refresh.</p>';
    }
}

// Select team
function selectTeam(teamId, teamName, members) {
    currentTeam = { id: teamId, name: teamName, members };

    // Join socket room
    socket.emit('join-team', { teamId, userId: currentUser.id });

    // Set up chat UI
    const chatArea = document.getElementById('chatArea');
    chatArea.innerHTML = `
    <div style="padding: 1rem; border-bottom: 1px solid var(--border-color); background: var(--bg-primary);">
      <h3 style="margin: 0;">${teamName}</h3>
      <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0;">${members.length} members</p>
    </div>
    
    <div class="chat-messages" id="chatMessages"></div>
    
    <div id="typingIndicator" class="typing-indicator hidden"></div>
    
    <div class="chat-input-container">
      <div class="chat-input-wrapper">
        <input type="text" class="chat-input" id="messageInput" placeholder="Type a message..." onkeypress="handleKeyPress(event)" oninput="handleTyping()">
        <button class="btn btn-primary" onclick="sendMessage()">Send</button>
      </div>
    </div>
  `;
}

// Display message
function displayMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const isOwn = message.sender._id === currentUser.id || message.sender === currentUser.id;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;

    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
    ${!isOwn ? `<div class="message-sender">${message.sender.name || 'User'}</div>` : ''}
    <div class="message-content">${message.content}</div>
    <div class="message-time">${time}</div>
  `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send message
function sendMessage() {
    const input = document.getElementById('messageInput');
    const content = input.value.trim();

    if (content && currentTeam) {
        socket.emit('send-message', {
            teamId: currentTeam.id,
            userId: currentUser.id,
            content
        });

        input.value = '';
        socket.emit('stop-typing', { teamId: currentTeam.id });
    }
}

// Handle key press
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Handle typing
function handleTyping() {
    if (!currentTeam) return;

    socket.emit('typing', { teamId: currentTeam.id, userName: currentUser.name });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stop-typing', { teamId: currentTeam.id });
    }, 1000);
}

// Show typing indicator
function showTypingIndicator(userName) {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.textContent = `${userName} is typing...`;
        indicator.classList.remove('hidden');
    }
}

// Hide typing indicator
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.classList.add('hidden');
    }
}

// Make functions global
window.selectTeam = selectTeam;
window.sendMessage = sendMessage;
window.handleKeyPress = handleKeyPress;
window.handleTyping = handleTyping;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser || !currentUser.id) {
        // Force re-login if user object is missing
        window.location.href = 'login.html';
        return;
    }

    // Admin accounts should not access team chat; redirect them to admin dashboard
    if (currentUser.role === 'admin') {
        window.location.href = '/admin/dashboard';
        return;
    }

    initSocket();
    loadTeams();
});

const Message = require('../models/Message');
const Team = require('../models/Team');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join team room
        socket.on('join-team', async ({ teamId, userId }) => {
            try {
                // Verify user is member of team
                const team = await Team.findById(teamId);
                if (team && team.members.includes(userId)) {
                    socket.join(teamId);
                    console.log(`User ${userId} joined team ${teamId}`);

                    // Load previous messages
                    const messages = await Message.find({ team: teamId })
                        .populate('sender', 'name')
                        .sort({ timestamp: 1 })
                        .limit(50);

                    socket.emit('previous-messages', messages);
                }
            } catch (error) {
                console.error('Join team error:', error);
            }
        });

        // Send message
        socket.on('send-message', async ({ teamId, userId, content }) => {
            try {
                const message = new Message({
                    team: teamId,
                    sender: userId,
                    content
                });

                await message.save();
                await message.populate('sender', 'name');

                // Broadcast to all users in the team room
                io.to(teamId).emit('new-message', message);
            } catch (error) {
                console.error('Send message error:', error);
            }
        });

        // Typing indicator
        socket.on('typing', ({ teamId, userName }) => {
            socket.to(teamId).emit('user-typing', { userName });
        });

        socket.on('stop-typing', ({ teamId }) => {
            socket.to(teamId).emit('user-stop-typing');
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

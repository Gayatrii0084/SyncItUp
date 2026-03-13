require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// --- NEW SECURITY IMPORTS ---
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
// ----------------------------

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Connect to MongoDB
connectDB();

// --- SECURITY MIDDLEWARE ---
// 1. Set Security HTTP Headers (Do this first)
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);

// 2. Limit Requests (Rate Limiting)
// Applying this specifically to the '/api' routes so it doesn't block loading images/CSS
const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per `window`
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);
// ----------------------------

// Standard Middleware
app.use(cors());

// 3. Body Parser with Size Limit (Updated from your original)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Data Sanitization against NoSQL Query Injection (Do this after body parser)
app.use(mongoSanitize());


// Serve static files from client folder
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/matching', require('./routes/matching'));
app.use('/api/team', require('./routes/team'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/report', require('./routes/report'));

// Socket.io chat handler
require('./socket/chatHandler')(io);

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Admin dashboard route
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/admin/dashboard.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Serve client pages for other routes
app.get('*', (req, res) => {
    const page = req.path.substring(1) || 'index';
    res.sendFile(path.join(__dirname, `../client/${page}.html`), (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, '../client/index.html'));
        }
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
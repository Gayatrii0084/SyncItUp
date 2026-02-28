# 🚀 SyncItUp - Collaboration Finder

A full-stack web application that helps college students find project and hackathon teammates based on skills and interests using smart AI-powered matching.

## ✨ Features

### 🔐 User Authentication
- Email & password signup/login
- JWT token-based authentication
- Secure password hashing with bcrypt

### 👤 Profile Management
- Comprehensive user profiles with college, branch, year, and bio
- Skills management with colored tags
- Experience level (Beginner/Intermediate/Advanced)
- Preferred role (Looking for team/Looking for members)
- Available hours per week
- Hackathon interests

### 🎯 Smart Matching Algorithm
Intelligent teammate matching based on:
- **40% Skill Complementarity** - Frontend matches with Backend/ML, not another Frontend
- **25% Common Interests** - Overlapping hackathon interests
- **20% Availability Overlap** - Compatible available hours
- **15% Experience Compatibility** - Similar experience levels

### 🔍 Explore & Filter
- Browse all users
- Search by name, college, or branch
- Filter by skills (Frontend, Backend, ML, Mobile, etc.)
- Filter by experience level
- View compatibility percentage badges

### 👥 Team System
- Send collaboration requests
- Accept/reject incoming requests
- Automatic team creation on acceptance
- Team room management

### 💬 Realtime Chat
- Socket.io powered instant messaging
- Team-based chat rooms
- Typing indicators
- Message timestamps
- Message history

### 🎨 Modern UI
- Dark/Light theme toggle with localStorage persistence
- Card-based modern design
- Colored skill tags (Frontend: Blue, Backend: Green, ML: Purple, etc.)
- Compatibility score progress bars
- Smooth animations and transitions
- Fully responsive

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- CSS3 (Custom design system with CSS variables)
- Vanilla JavaScript
- Socket.io Client

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Socket.io for realtime communication

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- MongoDB Compass (optional, for database visualization)

## 🚀 Installation & Setup

### 1. Clone or Navigate to Project
```bash
cd d:/linkcode/sync/syncitup
```

### 2. Install Dependencies
```bash
npm install
```

### 3. MongoDB Setup

**Option A: Local MongoDB (Recommended)**
- Make sure MongoDB is running on your machine
- Default connection: `mongodb://localhost:27017/syncitup`

**Option B: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string
- Update `.env` file with your connection string

### 4. Environment Variables

The `.env` file is already created with default values:
```env
MONGODB_URI=mongodb://localhost:27017/syncitup
JWT_SECRET=syncitup_secret_key_2026_collaboration_finder
PORT=5000
```

**For production, change the JWT_SECRET to a secure random string!**

### 5. Seed Demo Data (Important!)

Populate the database with 15 demo users for instant testing:
```bash
npm run seed
```

This creates users with diverse skills, experience levels, and interests so the matching algorithm works immediately.

**Demo Login Credentials:**
- Email: `priya@example.com`
- Password: `password123`

(All demo users have password: `password123`)

### 6. Start the Server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

## 📖 Usage Guide

### Getting Started

1. **Sign Up**: Create your account with college details
2. **Complete Profile**: Add your skills, experience, and interests
3. **View Matches**: Check your top 10 recommended teammates on dashboard
4. **Explore**: Browse all users with filters
5. **Connect**: Send collaboration requests
6. **Team Up**: Accept requests to create team rooms
7. **Chat**: Collaborate in realtime with your team

### Demo Users

The seed data includes 15 diverse users:
- Priya (Frontend/Node.js)
- Rahul (ML/Python)
- Ananya (Backend/Blockchain)
- Vikram (UI/UX/Frontend)
- And 11 more with various skill sets!

## 📁 Project Structure

```
syncitup/
├── client/                 # Frontend files
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── signup.html        # Signup page
│   ├── dashboard.html     # Main dashboard
│   ├── profile.html       # Profile management
│   ├── explore.html       # User exploration
│   ├── teams.html         # Team chat interface
│   ├── css/
│   │   └── style.css      # Complete design system
│   └── js/
│       ├── auth.js        # Authentication logic
│       ├── profile.js     # Profile management
│       ├── matching.js    # Matching algorithm UI
│       ├── explore.js     # Explore & filter logic
│       ├── chat.js        # Socket.io chat client
│       └── theme.js       # Theme toggle
├── server/                 # Backend files
│   ├── server.js          # Main Express server
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── models/            # Mongoose schemas
│   │   ├── User.js
│   │   ├── Request.js
│   │   ├── Team.js
│   │   └── Message.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── matching.js
│   │   └── team.js
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   ├── profileController.js
│   │   ├── matchingController.js
│   │   └── teamController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── socket/
│   │   └── chatHandler.js
│   └── utils/
│       └── seedData.js    # Demo data generator
├── .env                    # Environment variables
├── .env.example           # Template
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user

### Profile
- `GET /api/profile/me` - Get current user
- `GET /api/profile/:id` - Get user by ID
- `PUT /api/profile` - Update profile (protected)

### Matching
- `GET /api/matching/recommendations` - Get top 10 matches (protected)

### Team
- `POST /api/team/request` - Send collaboration request (protected)
- `GET /api/team/requests/received` - Get received requests (protected)
- `GET /api/team/requests/sent` - Get sent requests (protected)
- `PUT /api/team/request/:id` - Accept/reject request (protected)
- `GET /api/team/my-teams` - Get user's teams (protected)
- `GET /api/team/:teamId` - Get team details (protected)

### Socket Events
- `join-team` - Join a team chat room
- `send-message` - Send a message
- `typing` - Emit typing indicator
- `stop-typing` - Stop typing indicator
- `new-message` - Receive new message
- `user-typing` - Receive typing notification
- `previous-messages` - Load chat history

## 🎨 Skill Tag Colors

- **Frontend** (Blue): React, Vue, Angular, HTML, CSS, JavaScript
- **Backend** (Green): Node.js, Express, Django, Flask, Spring
- **ML** (Purple): Machine Learning, AI, TensorFlow, PyTorch
- **Mobile** (Orange): Android, iOS, React Native, Flutter
- **DevOps** (Red): Docker, Kubernetes, AWS, Azure
- **Blockchain** (Pink): Web3, Ethereum, Solidity
- **IoT** (Teal): Arduino, Raspberry Pi, Embedded
- **Design** (Orange): UI/UX, Figma, Adobe
- **Data** (Indigo): Data Science, Pandas, Visualization

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check MongoDB Compass
- Verify connection string in `.env`

### Port Already in Use
- Change PORT in `.env` to another value (e.g., 3000)

### Socket.io Connection Failed
- Check that server is running
- Ensure port matches in both server and client code

### Seed Data Error
- Make sure MongoDB is running
- Clear existing data: Drop the `syncitup` database and run seed again

## 🔒 Security Notes

- JWT tokens expire in 7 days
- Passwords are hashed with bcrypt (10 salt rounds)
- **Change JWT_SECRET** in production
- Use HTTPS in production
- Implement rate limiting for production

## 🚀 Future Enhancements

- Email verification
- Password reset functionality
- File sharing in chat
- Video calls
- Project showcase
- Hackathon calendar integration
- Team ratings and reviews
- Advanced filters (location, timezone)

## 📝 License

This project is created for educational purposes.

## 👨‍💻 Developer

Built with ❤️ for student collaboration

---

**Happy Hacking! 🎉**

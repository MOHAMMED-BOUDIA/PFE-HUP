const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root status page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>NAJAH API</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .card {
            background: rgba(255,255,255,0.1);
            padding: 40px 60px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          h1 { font-size: 3rem; margin: 0; }
          p { font-size: 1.2rem; margin-top: 10px; opacity: 0.9; }
          .status { color: #10b981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🚀 NAJAH Server</h1>
          <p class="status">● Server is running</p>
          <p>API available at <code>/api</code></p>
        </div>
      </body>
    </html>
  `);
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
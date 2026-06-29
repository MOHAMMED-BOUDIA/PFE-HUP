const express = require('express');
const path = require('path');
const compression = require('compression');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

app.set('trust proxy', true);

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

app.use(compression({ level: 6, threshold: 1024 }));

// Middleware: reject DB-dependent routes fast when DB is down
const dbRequired = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[dbRequired] DB connection failed:', err.message);
    res.status(503).json({ message: 'Database unavailable', error: err.message });
  }
};

connectDB().catch(err => console.error('[server] Failed to connect to DB:', err.message));

app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ status: 'NAJAH API running', cors: 'enabled' });
});

app.get('/api/debug', (req, res) => {
  res.json({
    hasMongoUri: !!process.env.MONGO_URI,
    mongoUriPrefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 25) + '...' : null,
    dbState: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
    clientUrl: process.env.CLIENT_URL || 'not set',
    nodeEnv: process.env.NODE_ENV || 'not set',
    vercel: !!process.env.VERCEL,
  });
});

app.get('/api/setup-admin/:secretKey', async (req, res) => {
  if (req.params.secretKey !== 'najah_setup_2024_xK9mP2qL') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      return res.json({
        message: 'Admin already exists',
        email: existing.email
      });
    }

    const password = 'Najah@Admin2024!';
    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name: 'NAJAH Admin',
      email: 'admin@najah.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      department: 'Administration'
    });

    res.json({
      success: true,
      message: 'Admin created successfully on production database',
      credentials: {
        email: admin.email,
        password: password,
        note: 'Save these credentials securely. Change password after first login.'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const teamRoutes = require('./routes/teamRoutes');
const taskRoutes = require('./routes/taskRoutes');
const documentRoutes = require('./routes/documentRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const groupRoutes = require('./routes/groupRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', dbRequired, authRoutes);
app.use('/api/users', dbRequired, userRoutes);
app.use('/api/projects', dbRequired, projectRoutes);
app.use('/api/teams', dbRequired, teamRoutes);
app.use('/api/tasks', dbRequired, taskRoutes);
app.use('/api/documents', dbRequired, documentRoutes);
app.use('/api/meetings', dbRequired, meetingRoutes);
app.use('/api/groups', dbRequired, groupRoutes);
app.use('/api/resources', dbRequired, resourceRoutes);
app.use('/api/challenges', dbRequired, challengeRoutes);
app.use('/api/departments', dbRequired, departmentRoutes);
app.use('/api/notifications', dbRequired, notificationRoutes);
app.use('/api/messages', dbRequired, messageRoutes);
app.use('/api/analytics', dbRequired, analyticsRoutes);
app.use('/api/ai', aiRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

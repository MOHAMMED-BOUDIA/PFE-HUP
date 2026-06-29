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

const lazy = (mod) => {
  let loaded;
  return (req, res, next) => {
    if (!loaded) loaded = require(mod);
    return loaded(req, res, next);
  };
};

app.use('/api/auth', dbRequired, lazy('./routes/authRoutes'));
app.use('/api/users', dbRequired, lazy('./routes/userRoutes'));
app.use('/api/projects', dbRequired, lazy('./routes/projectRoutes'));
app.use('/api/teams', dbRequired, lazy('./routes/teamRoutes'));
app.use('/api/tasks', dbRequired, lazy('./routes/taskRoutes'));
app.use('/api/documents', dbRequired, lazy('./routes/documentRoutes'));
app.use('/api/meetings', dbRequired, lazy('./routes/meetingRoutes'));
app.use('/api/groups', dbRequired, lazy('./routes/groupRoutes'));
app.use('/api/resources', dbRequired, lazy('./routes/resourceRoutes'));
app.use('/api/challenges', dbRequired, lazy('./routes/challengeRoutes'));
app.use('/api/departments', dbRequired, lazy('./routes/departmentRoutes'));
app.use('/api/notifications', dbRequired, lazy('./routes/notificationRoutes'));
app.use('/api/messages', dbRequired, lazy('./routes/messageRoutes'));
app.use('/api/analytics', dbRequired, lazy('./routes/analyticsRoutes'));
app.use('/api/ai', lazy('./routes/aiRoutes'));

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

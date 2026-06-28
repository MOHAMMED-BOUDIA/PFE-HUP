const express = require('express');
const path = require('path');
const compression = require('compression');
<<<<<<< HEAD
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['192.168.1.1', '192.168.31.1']);
=======
const connectDB = require('./config/db');
>>>>>>> 3b8fd4d2801fb52ce7895f3e7f37f5433fa02e32
require('dotenv').config();

const app = express();
app.use(compression());

<<<<<<< HEAD
// MongoDB — attempt connection, don't block startup
mongoose.set('bufferCommands', false);
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB not connected:', err.message));

// Middleware: reject DB-dependent routes fast when DB is down
const dbRequired = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database unavailable. Try again later.' });
  }
  next();
};

// CORS — MUST be first, before everything
const allowedOrigins = (process.env.CLIENT_URL).split(',').map(s => s.trim());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }
=======
// CORS
const allowedOrigin = process.env.CLIENT_URL;
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigin);
>>>>>>> 3b8fd4d2801fb52ce7895f3e7f37f5433fa02e32
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

connectDB().catch(err => console.error('Failed to connect to DB:', err.message));

app.use(express.json());
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

app.use('/api/auth', dbRequired, require('./routes/authRoutes'));
app.use('/api/users', dbRequired, require('./routes/userRoutes'));
app.use('/api/projects', dbRequired, require('./routes/projectRoutes'));
app.use('/api/teams', dbRequired, require('./routes/teamRoutes'));
app.use('/api/tasks', dbRequired, require('./routes/taskRoutes'));
app.use('/api/documents', dbRequired, require('./routes/documentRoutes'));
app.use('/api/meetings', dbRequired, require('./routes/meetingRoutes'));
app.use('/api/groups', dbRequired, require('./routes/groupRoutes'));
app.use('/api/resources', dbRequired, require('./routes/resourceRoutes'));
app.use('/api/challenges', dbRequired, require('./routes/challengeRoutes'));
app.use('/api/departments', dbRequired, require('./routes/departmentRoutes'));
app.use('/api/notifications', dbRequired, require('./routes/notificationRoutes'));
app.use('/api/messages', dbRequired, require('./routes/messageRoutes'));
app.use('/api/analytics', dbRequired, require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

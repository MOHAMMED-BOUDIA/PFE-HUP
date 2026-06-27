const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// CORS — MUST be first, before everything
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// MongoDB connection (cached for serverless)
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI);
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'DB connection failed', error: err.message });
  }
});

let seeded = false;

app.use(async (req, res, next) => {
  try {
    if (!seeded && process.env.NODE_ENV === 'production') {
      seeded = true;
      const Department = require('./models/Department');
      const count = await Department.countDocuments();
      if (count === 0) {
        const defaults = ['IT', 'Web Development', 'Mobile Development', 'Data Science', 'Cybersecurity', 'Network & Systems', 'Software Engineering'];
        await Department.insertMany(defaults.map(name => ({ name })));
      }
    }
    next();
  } catch (err) {
    console.error('Seed error:', err);
    next();
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'NAJAH API running', cors: 'enabled' });
});

app.get('/api/create-admin-once', async (req, res) => {
  try {
    const User = require('./models/user');
    const bcrypt = require('bcryptjs');
    await User.deleteOne({ email: 'admin@najah.com' });
    const hashed = await bcrypt.hash('Admin@1234', 10);
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@najah.com',
      password: hashed,
      role: 'admin',
      isVerified: true,
    });
    res.json({ created: true, email: admin.email, role: admin.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

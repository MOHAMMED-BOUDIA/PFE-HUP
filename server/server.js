const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let seeded = false;

app.use(async (req, res, next) => {
  try {
    await connectDB();
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
    return res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'NAJAH API is running', version: '1.0' });
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

const jwt = require('jsonwebtoken');
const User = require('./models/User');

let io;

function initSocket(server) {
  const { Server } = require('socket.io');

  const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(s => s.trim()).filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      socket.join(`user:${socket.user._id}`);
      console.log(`[socket] User ${socket.user._id} connected`);
    }

    socket.on('disconnect', () => {
      if (socket.user) {
        console.log(`[socket] User ${socket.user._id} disconnected`);
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initSocket, getIO };

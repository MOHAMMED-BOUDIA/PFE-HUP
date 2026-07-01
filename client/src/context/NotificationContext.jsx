import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import axiosInstance from '../api/axios';

const NotificationContext = createContext(null);

const SOCKET_URL = (import.meta.env.VITE_API_URL || '').replace('/api', '');

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  // Fetch initial notifications from REST
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/notifications?limit=50');
      setNotifications(res.data.data || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch {
      // ignore
    }
  }, []);

  // Connect socket when user is authenticated
  useEffect(() => {
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketConnected(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socketRef.current = socket;

    // Fetch initial data
    fetchNotifications();
    fetchUnreadCount();

    return () => {
      socket.disconnect();
    };
  }, [user, token, fetchNotifications, fetchUnreadCount]);

  const markAsRead = useCallback(async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications(prev => {
        const filtered = prev.filter(n => n._id !== id);
        const removed = prev.find(n => n._id === id);
        if (removed && !removed.isRead) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return filtered;
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      socketConnected,
      markAsRead,
      markAllRead,
      deleteNotification,
      fetchNotifications,
      fetchUnreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export default NotificationContext;

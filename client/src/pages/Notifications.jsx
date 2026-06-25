import { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      setNotifications(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    };
    init();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await axiosInstance.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update notifications.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete notification.');
    }
  };

  const getNotificationStyle = (type, read) => {
    const base = 'flex gap-4 p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-gray-900 ';
    const borderStyle = read 
      ? 'border-gray-100 dark:border-gray-800 opacity-60' 
      : 'border-l-4 shadow-sm border-gray-150 ';

    switch (type) {
      case 'success':
        return {
          card: base + borderStyle + (read ? '' : 'border-l-emerald-500 border-emerald-100/50 dark:border-emerald-950/20'),
          icon: <FaCheckCircle className="h-5 w-5 text-emerald-500" />,
        };
      case 'warning':
        return {
          card: base + borderStyle + (read ? '' : 'border-l-amber-500 border-amber-100/50 dark:border-amber-950/20'),
          icon: <FaExclamationTriangle className="h-5 w-5 text-amber-500" />,
        };
      case 'error':
        return {
          card: base + borderStyle + (read ? '' : 'border-l-red-500 border-red-100/50 dark:border-red-950/20'),
          icon: <FaTimesCircle className="h-5 w-5 text-red-500" />,
        };
      case 'info':
      default:
        return {
          card: base + borderStyle + (read ? '' : 'border-l-indigo-500 border-indigo-100/50 dark:border-indigo-950/20'),
          icon: <FaInfoCircle className="h-5 w-5 text-indigo-500" />,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Notifications Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Keep track of approvals, tasks assignments, and meeting reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <div>
            <button
              onClick={handleMarkAllRead}
              disabled={actionLoading}
              type="button"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-950/60 sm:w-auto"
            >
              <FaCheck className="h-3.5 w-3.5" />
              Mark all as read
            </button>
          </div>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={FaBell}
          title="All caught up!"
          description="You don't have any notifications at the moment."
        />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {notifications.map((notif) => {
            const styles = getNotificationStyle(notif.type, notif.read);
            return (
              <div key={notif._id} className={styles.card}>
                {/* Icon */}
                <div className="mt-0.5 flex-shrink-0">{styles.icon}</div>
                
                {/* Body */}
                <div className="flex-1 space-y-1">
                  <p className={`text-sm text-gray-800 dark:text-gray-200 ${notif.read ? '' : 'font-semibold'}`}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(notif.createdAt || new Date()).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-start gap-1 flex-shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800"
                      title="Mark as read"
                    >
                      <FaCheck className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notif._id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                    title="Delete notification"
                  >
                    <FaTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;

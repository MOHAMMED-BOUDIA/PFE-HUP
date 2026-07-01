import { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const Notifications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification, fetchNotifications } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    };
    init();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await markAllRead();
      toast.success('All notifications marked as read!');
    } catch {
      toast.error('Failed to update notifications.');
    } finally {
      setActionLoading(false);
    }
  };

  const getNotificationStyle = (type, isRead) => {
    const base = 'flex gap-4 p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-gray-900 ';
    const borderStyle = isRead
      ? 'border-gray-100 dark:border-gray-800 opacity-60'
      : 'border-l-4 shadow-sm border-gray-150 ';

    switch (type) {
      case 'meeting':
        return {
          card: base + borderStyle + (isRead ? '' : 'border-l-[#0084D1] border-[#0084D1]/20'),
          icon: <FaCalendarAlt className="h-5 w-5 text-[#0084D1]" />,
        };
      case 'task':
        return {
          card: base + borderStyle + (isRead ? '' : 'border-l-emerald-500 border-emerald-100/50 dark:border-emerald-950/20'),
          icon: <FaCheckCircle className="h-5 w-5 text-emerald-500" />,
        };
      case 'message':
        return {
          card: base + borderStyle + (isRead ? '' : 'border-l-amber-500 border-amber-100/50 dark:border-amber-950/20'),
          icon: <FaExclamationTriangle className="h-5 w-5 text-amber-500" />,
        };
      case 'group':
        return {
          card: base + borderStyle + (isRead ? '' : 'border-l-purple-500 border-purple-100/50 dark:border-purple-950/20'),
          icon: <FaBell className="h-5 w-5 text-purple-500" />,
        };
      default:
        return {
          card: base + borderStyle + (isRead ? '' : 'border-l-gray-400'),
          icon: <FaTimesCircle className="h-5 w-5 text-gray-400" />,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {t('notifications.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('notifications.subtitle')}
          </p>
        </div>

        {unreadCount > 0 && (
          <div>
            <button
              onClick={handleMarkAllRead}
              disabled={actionLoading}
              type="button"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0084D1]/10 px-4 py-2.5 text-sm font-semibold text-[#0084D1] hover:bg-[#0084D1]/10 transition sm:w-auto"
            >
              <FaCheck className="h-3.5 w-3.5" />
              {t('notifications.markAllRead')}
            </button>
          </div>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={FaBell}
          title={t('notifications.allCaughtUp')}
          description={t('notifications.noNotifications')}
        />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {notifications.map((notif) => {
            const styles = getNotificationStyle(notif.type, notif.isRead);
            return (
              <div
                key={notif._id}
                className={`${styles.card} cursor-pointer`}
                onClick={() => { markAsRead(notif._id); if (notif.link) navigate(notif.link); }}
              >
                {/* Icon */}
                <div className="mt-0.5 flex-shrink-0">{styles.icon}</div>

                {/* Body */}
                <div className="flex-1 space-y-1">
                  {notif.title && (
                    <p className={`text-xs font-bold ${notif.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-[#0084D1]'}`}>
                      {notif.title}
                    </p>
                  )}
                  <p className={`text-sm text-gray-800 dark:text-gray-200 ${notif.isRead ? '' : 'font-semibold'}`}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(notif.createdAt || new Date()).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-start gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#0084D1] dark:hover:bg-gray-800"
                      title={t('notifications.markAsRead')}
                    >
                      <FaCheck className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif._id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                    title={t('notifications.deleteNotification')}
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

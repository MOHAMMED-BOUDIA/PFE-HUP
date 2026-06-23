import { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const iconMap = {
  success: { icon: FaCheckCircle, color: 'text-emerald-500' },
  error: { icon: FaTimesCircle, color: 'text-red-500' },
  warning: { icon: FaExclamationTriangle, color: 'text-amber-500' },
  info: { icon: FaInfoCircle, color: 'text-indigo-500' },
};

const AlertModal = ({ isOpen, onClose, type = 'info', title, message }) => {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { icon: Icon, color } = iconMap[type] || iconMap.info;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm animate-fadeInScale rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-150 dark:border-gray-800">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          <FaTimes className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 ${color}`}>
            <Icon className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

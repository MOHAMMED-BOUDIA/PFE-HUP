import { useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false }) => {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onCancel(); };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div onClick={onCancel} className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm animate-fadeInScale rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-150 dark:border-gray-800">
        <button
          onClick={onCancel}
          type="button"
          className="absolute top-3 right-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          <FaTimes className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500">
            <FaExclamationTriangle className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onCancel}
            type="button"
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition ${
              destructive
                ? 'bg-red-600 shadow-red-600/20 hover:bg-red-500'
                : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

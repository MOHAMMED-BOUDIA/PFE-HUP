import { createContext, useContext, useState, useCallback } from 'react';
import AlertModal from '../components/common/AlertModal';
import ConfirmModal from '../components/common/ConfirmModal';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [alert, setAlert] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [confirm, setConfirm] = useState({ isOpen: false, title: '', message: '', confirmLabel: 'Confirm', cancelLabel: 'Cancel', destructive: false, resolve: null });

  const showAlert = useCallback(({ type = 'info', title, message }) => {
    return new Promise((resolve) => {
      setAlert({ isOpen: true, type, title, message, resolve });
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleAlertClose = useCallback(() => {
    closeAlert();
    if (alert.resolve) alert.resolve();
  }, [closeAlert, alert.resolve]);

  const showConfirm = useCallback(({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false }) => {
    return new Promise((resolve) => {
      setConfirm({ isOpen: true, title, message, confirmLabel, cancelLabel, destructive, resolve });
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirm((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirm.resolve) confirm.resolve(true);
    closeConfirm();
  }, [closeConfirm, confirm.resolve]);

  const handleCancel = useCallback(() => {
    if (confirm.resolve) confirm.resolve(false);
    closeConfirm();
  }, [closeConfirm, confirm.resolve]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertModal
        isOpen={alert.isOpen}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={handleAlertClose}
      />
      <ConfirmModal
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        cancelLabel={confirm.cancelLabel}
        destructive={confirm.destructive}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ModalContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useAlert must be used within ModalProvider');
  return ctx.showAlert;
};

export const useConfirm = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useConfirm must be used within ModalProvider');
  return ctx.showConfirm;
};

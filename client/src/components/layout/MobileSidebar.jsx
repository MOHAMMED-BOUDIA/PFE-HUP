import { createPortal } from 'react-dom';
import { useEffect } from 'react';

const MobileSidebar = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 99998
        }}
      />
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '85%',
          maxWidth: '320px',
          background: '#ffffff',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 20px rgba(0,0,0,0.3)'
        }}
        className="dark:!bg-gray-900"
      >
        {children}
      </aside>
    </>,
    document.body
  );
};

export default MobileSidebar;

import { createContext, useContext, useState, useCallback } from 'react';
import CustomModal from '../components/common/CustomModal';
import Toast from '../components/common/Toast';

const ModalContext = createContext(null);
const MAX_TOASTS = 3;

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isConfirm: false,
    onConfirm: null,
    onCancel: null
  });

  const [toasts, setToasts] = useState([]);

  const showModal = useCallback(({
    title = 'Notice',
    message = '',
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel',
    isConfirm = false,
    onConfirm = null,
    onCancel = null
  }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      isConfirm,
      onConfirm,
      onCancel
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      return next.slice(-MAX_TOASTS);
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, closeModal, showToast }}>
      {children}
      <CustomModal {...modalState} onClose={closeModal} />
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

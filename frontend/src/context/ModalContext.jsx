import { createContext, useContext, useState, useCallback } from 'react';
import CustomModal from '../components/common/CustomModal';
import Toast from '../components/common/Toast';

const ModalContext = createContext(null);

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

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
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
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
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

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { generateId } from '../utils/generateId';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 4500;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = generateId('TOAST');
    setToasts((current) => [
      ...current,
      {
        id,
        type: 'info',
        duration: DEFAULT_DURATION,
        ...toast,
      },
    ]);
    return id;
  }, []);

  const success = useCallback((message, title = 'Success') => addToast({ type: 'success', title, message }), [addToast]);
  const error = useCallback((message, title = 'Something went wrong') => addToast({ type: 'error', title, message, duration: 6000 }), [addToast]);
  const warning = useCallback((message, title = 'Attention required') => addToast({ type: 'warning', title, message }), [addToast]);
  const info = useCallback((message, title = 'Information') => addToast({ type: 'info', title, message }), [addToast]);

  const value = useMemo(
    () => ({ toasts, addToast, removeToast, success, error, warning, info }),
    [toasts, addToast, removeToast, success, error, warning, info],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export default ToastContext;

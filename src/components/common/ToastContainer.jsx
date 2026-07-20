import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const variants = {
  success: { icon: CheckCircle2, className: 'border-emerald-500/30 text-emerald-300' },
  error: { icon: AlertCircle, className: 'border-rose-500/30 text-rose-300' },
  warning: { icon: TriangleAlert, className: 'border-amber-500/30 text-amber-300' },
  info: { icon: Info, className: 'border-cyan-500/30 text-cyan-300' },
};

const ToastItem = ({ toast, onClose }) => {
  const variant = variants[toast.type] || variants.info;
  const Icon = variant.icon;

  useEffect(() => {
    if (toast.duration === 0) return undefined;
    const timeout = window.setTimeout(() => onClose(toast.id), toast.duration);
    return () => window.clearTimeout(timeout);
  }, [toast.id, toast.duration, onClose]);

  return (
    <div className={`pointer-events-auto flex w-full gap-3 rounded-2xl border bg-slate-900/95 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl ${variant.className}`} role="status">
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-100">{toast.title}</p>
        {toast.message && <p className="mt-1 text-sm leading-5 text-slate-400">{toast.message}</p>}
      </div>
      <button type="button" onClick={() => onClose(toast.id)} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-white" aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[100] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-5 sm:top-5 sm:w-full sm:max-w-sm" aria-live="polite" aria-atomic="false" aria-label="Notifications">
      {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onClose={removeToast} />)}
    </div>
  );
};

export default ToastContainer;

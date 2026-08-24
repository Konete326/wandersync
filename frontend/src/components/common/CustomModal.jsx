import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, AlertOctagon, X } from 'lucide-react';

const CustomModal = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirm = false,
  onConfirm,
  onCancel,
  onClose
}) => {
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onConfirm, onCancel, onClose]);

  if (!isOpen) return null;

  const icons = {
    info: <Info className="size-6 text-cyan-400" />,
    success: <CheckCircle2 className="size-6 text-emerald-400" />,
    warning: <AlertTriangle className="size-6 text-amber-400" />,
    danger: <AlertOctagon className="size-6 text-rose-400" />
  };

  const iconBgs = {
    info: 'bg-cyan-500/10 border-cyan-500/20',
    success: 'bg-emerald-500/10 border-emerald-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    danger: 'bg-rose-500/10 border-rose-500/20'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-2xl animate-in zoom-in-95 duration-150 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border flex items-center justify-center shrink-0 ${iconBgs[type] || iconBgs.info}`}>
            {icons[type] || icons.info}
          </div>
          <div className="flex-1 pt-0.5 space-y-1">
            <h3 className="text-base font-bold text-foreground font-heading tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/80">
          {isConfirm && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-all cursor-pointer min-h-[38px]"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer min-h-[38px] shadow-sm ${
              type === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/50'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;

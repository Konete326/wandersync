import { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Info, AlertCircle, X, Trash2 } from 'lucide-react';

const CustomModal = ({
  isOpen,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  isConfirm = false,
  onConfirm,
  onCancel,
  onClose
}) => {
  const confirmBtnRef = useRef(null);

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

    setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const isDeleteAction = isConfirm && (type === 'delete' || (type === 'danger' && /delete|remove|clear/i.test(confirmText)));

  const icons = {
    info: <Info className="size-5 text-cyan-400" />,
    success: <CheckCircle2 className="size-5 text-emerald-400" />,
    warning: <AlertTriangle className="size-5 text-amber-400" />,
    danger: isDeleteAction ? <Trash2 className="size-5 text-rose-400" /> : <AlertCircle className="size-5 text-rose-400" />,
    error: <AlertCircle className="size-5 text-rose-400" />,
    delete: <Trash2 className="size-5 text-rose-400" />
  };

  const iconBgs = {
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    danger: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    error: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    delete: 'bg-rose-500/15 border-rose-500/30 text-rose-400'
  };

  const getConfirmBtnClass = () => {
    if (isDeleteAction) {
      return 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 ring-1 ring-rose-500/50';
    }
    if (type === 'danger' || type === 'error') {
      return 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50';
    }
    if (type === 'warning') {
      return 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-950/50';
    }
    if (type === 'success') {
      return 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-950/50';
    }
    return 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-cyan-950/50 font-bold';
  };

  return (
    <div
      onClick={handleCancel}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-100 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md p-5 rounded-2xl bg-[#121215] border border-border/90 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-100 space-y-4 font-sans"
      >
        <button
          onClick={handleCancel}
          className="absolute top-3.5 right-3.5 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${iconBgs[type] || iconBgs.info}`}>
            {icons[type] || icons.info}
          </div>
          <div className="flex-1 pt-0.5 space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-foreground font-heading tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-border/70">
          {isConfirm && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary border border-border rounded-xl transition-all cursor-pointer min-h-[40px]"
            >
              {cancelText}
            </button>
          )}
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer min-h-[40px] shadow-sm flex items-center gap-1.5 ${getConfirmBtnClass()}`}
          >
            {isDeleteAction && <Trash2 className="size-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;

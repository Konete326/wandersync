import { AlertTriangle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

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
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const icons = {
    info: <Info className="w-7 h-7 text-cyan-400" />,
    success: <CheckCircle2 className="w-7 h-7 text-emerald-400" />,
    warning: <AlertTriangle className="w-7 h-7 text-amber-400" />,
    danger: <XCircle className="w-7 h-7 text-rose-400" />
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-2xl liquid-glass-card border border-slate-700/60 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 shadow-inner">
            {icons[type] || icons.info}
          </div>
          <div className="flex-1 pt-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {isConfirm && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-5 py-2 text-sm font-semibold rounded-xl text-white shadow-lg transition-all ${
              type === 'danger'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-900/40'
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

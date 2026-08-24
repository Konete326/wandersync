import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    info: <Info className="w-5 h-5 text-cyan-400" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />
  };

  const borderColors = {
    info: 'border-cyan-500/30',
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30'
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl liquid-glass border ${borderColors[type] || borderColors.info} shadow-xl text-sm text-slate-100 animate-in slide-in-from-bottom-5 duration-300 max-w-sm`}
    >
      {icons[type] || icons.info}
      <span className="flex-1 font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;

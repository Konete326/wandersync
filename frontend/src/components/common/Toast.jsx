import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    info: <Info className="size-4 text-cyan-400 shrink-0" />,
    success: <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="size-4 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="size-4 text-amber-400 shrink-0" />
  };

  const borders = {
    info: 'border-cyan-500/30 ring-1 ring-cyan-500/20',
    success: 'border-emerald-500/30 ring-1 ring-emerald-500/20',
    error: 'border-rose-500/30 ring-1 ring-rose-500/20',
    warning: 'border-amber-500/30 ring-1 ring-amber-500/20'
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-card/95 backdrop-blur-md border ${borders[type] || borders.info} shadow-2xl text-xs sm:text-sm text-foreground animate-in slide-in-from-top-3 fade-in duration-150 max-w-sm w-full`}
    >
      {icons[type] || icons.info}
      <span className="flex-1 font-medium leading-snug truncate">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
};

export default Toast;

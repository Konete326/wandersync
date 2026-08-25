import { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getAdminNotifications } from '@/services/adminService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const { showModal, showToast } = useModal();

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getAdminNotifications();
      if (res.data) {
        setNotifications(res.data);
      }
    } catch {
      showToast('Could not load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'ai') return n.type === 'ai';
    if (filter === 'security') return n.type === 'security';
    if (filter === 'trip') return n.type === 'trip';
    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  };

  const deleteNotification = (id, title) => {
    showModal({
      title: 'Dismiss Notification',
      message: `Are you sure you want to dismiss "${title}"?`,
      type: 'warning',
      isConfirm: true,
      confirmText: 'Dismiss',
      onConfirm: () => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        showToast('Notification removed', 'info');
      }
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ai':
        return <Sparkles className="size-3.5 text-orange-400" />;
      case 'security':
        return <ShieldCheck className="size-3.5 text-amber-400" />;
      case 'trip':
        return <Compass className="size-3.5 text-orange-400" />;
      default:
        return <Bell className="size-3.5 text-orange-400" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'ai':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'security':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'trip':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-8">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Bell className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground leading-tight">System Notifications</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
                {notifications.filter((n) => !n.read).length} New
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Real-time operational alerts, AI generation logs, and telemetry
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#18181b]/80 hover:bg-[#272730] text-foreground hover:text-orange-400 text-xs font-semibold rounded-lg border border-border/80 hover:border-orange-500/40 transition-all cursor-pointer shadow-xs"
          >
            <Check className="size-3 text-orange-400" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      <div className="py-1.5 px-3 rounded-xl bg-[#121215] border border-border/80 flex flex-wrap items-center gap-1.5 shadow-xs">
        <button
          onClick={() => { setFilter('all'); setPage(1); }}
          className={`h-[30px] px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-orange-500 text-zinc-950 shadow-xs shadow-orange-500/20 font-bold'
              : 'bg-[#18181b]/80 text-muted-foreground hover:text-foreground border border-border/80 hover:border-orange-500/30'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => { setFilter('unread'); setPage(1); }}
          className={`h-[30px] px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-orange-500 text-zinc-950 shadow-xs shadow-orange-500/20 font-bold'
              : 'bg-[#18181b]/80 text-muted-foreground hover:text-foreground border border-border/80 hover:border-orange-500/30'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
        <button
          onClick={() => { setFilter('ai'); setPage(1); }}
          className={`h-[30px] px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'ai'
              ? 'bg-orange-500 text-zinc-950 shadow-xs shadow-orange-500/20 font-bold'
              : 'bg-[#18181b]/80 text-muted-foreground hover:text-foreground border border-border/80 hover:border-orange-500/30'
          }`}
        >
          AI Engine
        </button>
        <button
          onClick={() => { setFilter('security'); setPage(1); }}
          className={`h-[30px] px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'security'
              ? 'bg-orange-500 text-zinc-950 shadow-xs shadow-orange-500/20 font-bold'
              : 'bg-[#18181b]/80 text-muted-foreground hover:text-foreground border border-border/80 hover:border-orange-500/30'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => { setFilter('trip'); setPage(1); }}
          className={`h-[30px] px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'trip'
              ? 'bg-orange-500 text-zinc-950 shadow-xs shadow-orange-500/20 font-bold'
              : 'bg-[#18181b]/80 text-muted-foreground hover:text-foreground border border-border/80 hover:border-orange-500/30'
          }`}
        >
          Trips
        </button>
      </div>

      <div className="space-y-2 w-full">
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader text="Loading live notifications..." />
          </div>
        ) : paginated.length === 0 ? (
          <div className="bg-[#121215] border border-border rounded-xl p-8 text-center space-y-2">
            <CheckCircle2 className="size-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">All Clear</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No notifications matching this category at this moment.
            </p>
          </div>
        ) : (
          paginated.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${
                n.read
                  ? 'bg-card/70 border-border/70 text-muted-foreground'
                  : 'bg-[#121215] border-border hover:border-orange-500/30 shadow-sm ring-1 ring-orange-500/10 text-foreground'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="size-7 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-xs font-bold text-foreground tracking-tight">
                      {n.title}
                    </h3>
                    <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold border ${getBadgeColor(n.type)}`}>
                      {n.type.toUpperCase()}
                    </span>
                    {!n.read && (
                      <span className="size-1.5 rounded-full bg-orange-400 inline-block animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="block text-[10px] text-muted-foreground/70 font-mono">
                    {n.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => deleteNotification(n.id, n.title)}
                  className="p-1 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Remove notification"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mandatory Pagination Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2.5 border-t border-border/80 text-xs text-muted-foreground">
        <div>
          Showing <strong className="text-foreground">{filtered.length === 0 ? 0 : (page - 1) * itemsPerPage + 1}</strong> to{' '}
          <strong className="text-foreground">{Math.min(page * itemsPerPage, filtered.length)}</strong> of{' '}
          <strong className="text-foreground">{filtered.length}</strong> notifications
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="size-3.5" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`size-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  page === p
                    ? 'bg-orange-500 text-zinc-950 font-bold shadow-sm shadow-orange-500/20'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground border border-border hover:border-orange-500/30'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

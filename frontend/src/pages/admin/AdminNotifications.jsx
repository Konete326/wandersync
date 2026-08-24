import { useState } from 'react';
import {
  Bell,
  Sparkles,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Trash2,
  Check,
  AlertCircle,
  Filter
} from 'lucide-react';
import { useModal } from '@/context/ModalContext';

const initialNotifications = [
  {
    id: 1,
    title: 'Gemini 2.5 Flash Itinerary Surge',
    message: 'High traffic detected: 48 itineraries generated in the last 15 minutes with 100% JSON parsing accuracy.',
    type: 'ai',
    time: '4 mins ago',
    read: false
  },
  {
    id: 2,
    title: 'New Admin Session Established',
    message: 'Secure root login detected from IP 192.168.1.45 (San Francisco, US).',
    type: 'security',
    time: '25 mins ago',
    read: false
  },
  {
    id: 3,
    title: 'Featured Trip Exported to PDF',
    message: 'Traveler "Sarah M." successfully downloaded 7-Day Tokyo Cultural Odyssey in PDF format.',
    type: 'trip',
    time: '1 hour ago',
    read: false
  },
  {
    id: 4,
    title: 'Cloudinary CDN Asset Sync',
    message: 'Storage optimization completed: 142 trip cover photos compressed and cached across global edges.',
    type: 'system',
    time: '3 hours ago',
    read: true
  },
  {
    id: 5,
    title: 'Open-Meteo Weather API Health Check',
    message: 'Live weather telemetry running at 99.98% uptime with zero request timeouts.',
    type: 'system',
    time: '5 hours ago',
    read: true
  }
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all');
  const { showModal, showToast } = useModal();

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'ai') return n.type === 'ai';
    if (filter === 'security') return n.type === 'security';
    if (filter === 'trip') return n.type === 'trip';
    return true;
  });

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
        return <Sparkles className="size-4 text-cyan-400" />;
      case 'security':
        return <ShieldCheck className="size-4 text-amber-400" />;
      case 'trip':
        return <Compass className="size-4 text-emerald-400" />;
      default:
        return <Bell className="size-4 text-blue-400" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'ai':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'security':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'trip':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            System Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time operational alerts, AI generation logs, and security telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-xl border border-border transition-all cursor-pointer shadow-sm"
          >
            <Check className="size-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
              : 'bg-secondary/60 text-muted-foreground hover:text-foreground border border-border'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
              : 'bg-secondary/60 text-muted-foreground hover:text-foreground border border-border'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
        <button
          onClick={() => setFilter('ai')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'ai'
              ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
              : 'bg-secondary/60 text-muted-foreground hover:text-foreground border border-border'
          }`}
        >
          AI Engine
        </button>
        <button
          onClick={() => setFilter('security')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'security'
              ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
              : 'bg-secondary/60 text-muted-foreground hover:text-foreground border border-border'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setFilter('trip')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'trip'
              ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
              : 'bg-secondary/60 text-muted-foreground hover:text-foreground border border-border'
          }`}
        >
          Trips
        </button>
      </div>

      <div className="space-y-3 w-full">
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
            <CheckCircle2 className="size-10 text-muted-foreground mx-auto" />
            <h3 className="text-base font-semibold text-foreground">All Clear</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No notifications matching this category at this moment.
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`flex items-start justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
                n.read
                  ? 'bg-card/70 border-border/70 text-muted-foreground'
                  : 'bg-card border-border shadow-md ring-1 ring-cyan-500/20 text-foreground'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                      {n.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getBadgeColor(n.type)}`}>
                      {n.type.toUpperCase()}
                    </span>
                    {!n.read && (
                      <span className="size-2 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                  <span className="block text-[11px] text-muted-foreground/70 font-mono pt-1">
                    {n.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => deleteNotification(n.id, n.title)}
                  className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Remove notification"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

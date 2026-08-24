import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Trash2,
  Pin,
  Heart,
  Globe,
  Plane,
  Building,
  Users,
  Image as ImageIcon,
  CheckCircle2,
  ShieldCheck,
  Crown,
  RefreshCw
} from 'lucide-react';
import {
  fetchCommunityMessages,
  deleteCommunityMessage,
  togglePinMessage
} from '@/services/communityService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';

const channels = [
  { id: 'all', label: 'All Channels', icon: MessageSquare },
  { id: 'global-lounge', label: '#global-lounge', icon: Globe },
  { id: 'flights-and-deals', label: '#flights-and-deals', icon: Plane },
  { id: 'stays-and-hotels', label: '#stays-and-hotels', icon: Building },
  { id: 'travel-buddies', label: '#travel-buddies', icon: Users }
];

export default function AdminCommunity() {
  const { showModal, showToast } = useModal();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState('all');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetchCommunityMessages(activeRoom, 80, search);
      if (res.data?.messages) {
        setMessages(res.data.messages);
      } else {
        setMessages([]);
      }
    } catch {
      if (!silent) showToast('Could not load community discussions', 'error');
    } finally {
      if (!silent) setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [activeRoom]);

  // Real-time polling every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeRoom, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMessages();
  };

  const handleTogglePin = async (msg) => {
    try {
      await togglePinMessage(msg._id);
      showToast(`Message ${!msg.pinned ? 'pinned as announcement' : 'unpinned'}`, 'success');
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, pinned: !m.pinned } : m))
      );
    } catch {
      showToast('Failed to toggle pin state', 'error');
    }
  };

  const handleDeleteMessage = (msg) => {
    showModal({
      title: 'Delete Community Message?',
      message: `Are you sure you want to delete message from "${msg.user?.name || 'User'}" ("${msg.text.slice(0, 40)}...")? This will permanently remove it from the live channel stream.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCommunityMessage(msg._id);
          showToast('Message deleted from community stream', 'success');
          setMessages((prev) => prev.filter((m) => m._id !== msg._id));
        } catch {
          showToast('Failed to delete message', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6 select-none font-sans max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121215] border border-border/80 shadow-md">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <MessageSquare className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Community Chat & Discussion Moderation</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live monitoring, announcement pins, toxic content removal, and traveler interaction feeds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Stream (4s Sync)</span>
          </div>
        </div>
      </div>

      {/* Filter & Channel Selector Bar */}
      <div className="p-4 rounded-2xl bg-[#121215] border border-border/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-md">
        {/* Channels Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
          {channels.map((ch) => {
            const Icon = ch.icon;
            const isActive = activeRoom === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveRoom(ch.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-zinc-950 font-bold shadow-sm shadow-orange-500/20'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords or traveler name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
          />
        </form>
      </div>

      {/* Messages Feed Table / Stream */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader text="Loading live community discussions..." />
        </div>
      ) : messages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121215] border border-border/80 space-y-3">
          <MessageSquare className="size-10 text-muted-foreground/30 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Messages in this Channel</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Traveler discussions posted from the community page will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md ${
                msg.pinned
                  ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-[#121215] border-border/80 hover:border-orange-500/30'
              }`}
            >
              {/* Left Author & Message Block */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* User Avatar */}
                <div className="size-9 rounded-xl border border-orange-500/30 overflow-hidden bg-secondary shrink-0 mt-0.5">
                  <img
                    src={msg.user?.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={msg.user?.name || 'User'}
                    className="size-full object-cover"
                  />
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-foreground text-xs">{msg.user?.name || 'Traveler'}</span>
                    
                    {msg.user?.role === 'admin' ? (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                        <Crown className="size-2.5" /> Admin
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-secondary text-muted-foreground border border-border">
                        Traveler
                      </span>
                    )}

                    <span className="px-2 py-0.2 rounded-md bg-secondary/60 text-[10px] font-mono text-orange-400 border border-border">
                      #{msg.room || 'global-lounge'}
                    </span>

                    {msg.pinned && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-zinc-950 flex items-center gap-0.5">
                        <Pin className="size-2.5 fill-current" /> Pinned
                      </span>
                    )}

                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed break-words">{msg.text}</p>

                  {/* Photo Attachment */}
                  {msg.image && (
                    <div className="pt-2">
                      <img
                        src={msg.image}
                        alt="Attached by traveler"
                        className="max-h-40 rounded-xl border border-border/80 object-cover shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Moderation Actions Strip */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground px-2 py-1 rounded-lg bg-secondary/40 border border-border">
                  <Heart className="size-3 text-rose-400" />
                  <span>{msg.likes?.length || 0}</span>
                </div>

                {/* Toggle Pin */}
                <button
                  onClick={() => handleTogglePin(msg)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    msg.pinned
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border-border'
                  }`}
                  title={msg.pinned ? 'Unpin message' : 'Pin message to channel top'}
                >
                  <Pin className="size-3.5" />
                </button>

                {/* Delete Message */}
                <button
                  onClick={() => handleDeleteMessage(msg)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                  title="Delete message from channel"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

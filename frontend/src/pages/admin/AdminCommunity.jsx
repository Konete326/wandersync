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
  Send,
  X,
  Compass,
  ArrowLeft,
  Crown,
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react';
import {
  fetchCommunityMessages,
  postCommunityMessage,
  deleteCommunityMessage,
  togglePinMessage,
  toggleLikeMessage
} from '@/services/communityService';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { compressImage } from '@/utils/imageCompressor';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

const COMMUNITY_GROUPS = [
  {
    id: 'global-lounge',
    name: 'Global Traveler Lounge',
    desc: 'Worldwide travel banter, stories & wanderlust talk',
    icon: Globe
  },
  {
    id: 'travel-buddies',
    name: 'Travel Buddies & Meetups',
    desc: 'Find travel companions, road trips & solo meetups',
    icon: Users
  },
  {
    id: 'flights-and-deals',
    name: 'Flights & Airfare Deals',
    desc: 'Aviation routes, airline sales & seat alerts',
    icon: Plane
  },
  {
    id: 'stays-and-hotels',
    name: 'Luxury Resorts & Hotels',
    desc: 'Boutique stays, hotel reviews & accommodation tips',
    icon: Building
  },
  {
    id: 'solo-expeditions',
    name: 'Solo Expeditions & Treks',
    desc: 'Hiking trails, backpacker guides & mountain camps',
    icon: Compass
  },
  {
    id: 'photography-visuals',
    name: 'Sceneries & Photography',
    desc: 'Travel snapshots, drone shots & camera presets',
    icon: ImageIcon
  }
];

export default function AdminCommunity() {
  const { user } = useAuth();
  const { showModal, showToast } = useModal();

  const [activeGroup, setActiveGroup] = useState(COMMUNITY_GROUPS[0]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');

  const [mobileShowChat, setMobileShowChat] = useState(false);

  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [sending, setSending] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState(null);

  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetchCommunityMessages(activeGroup.id, 100, search);
      if (res.data?.messages) {
        setMessages(res.data.messages);
      } else {
        setMessages([]);
      }
    } catch {
      if (!silent) showToast('Could not load channel discussions', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [activeGroup]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeGroup, search]);

  const handleGroupSelect = (grp) => {
    setActiveGroup(grp);
    setMobileShowChat(true);
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedImages.length + files.length > 3) {
      showToast('Maximum 3 images allowed per message', 'warning');
      return;
    }

    const newImages = [];
    const newPreviews = [];

    for (const file of files) {
      if (selectedImages.length + newImages.length >= 3) break;
      try {
        const compressed = await compressImage(file);
        newImages.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch {
        newImages.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setSelectedImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && selectedImages.length === 0) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('text', inputText.trim() || 'Shared an update');
      formData.append('room', activeGroup.id);

      selectedImages.forEach((img) => {
        formData.append('images', img);
      });

      await postCommunityMessage(formData);
      setInputText('');
      setSelectedImages([]);
      setImagePreviews([]);
      await loadMessages(true);
      scrollToBottom();
    } catch {
      showToast('Failed to post message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleTogglePin = async (msg) => {
    try {
      await togglePinMessage(msg._id);
      showToast(`Message ${!msg.pinned ? 'pinned as group announcement' : 'unpinned'}`, 'success');
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, pinned: !m.pinned } : m))
      );
    } catch {
      showToast('Failed to toggle pin state', 'error');
    }
  };

  const handleDeleteMessage = (msg) => {
    showModal({
      title: 'Permanently Delete Message?',
      message: `Delete message from "${msg.user?.name || 'Traveler'}"? It will be removed immediately for all platform users.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCommunityMessage(msg._id);
          showToast('Message removed from community stream', 'success');
          setMessages((prev) => prev.filter((m) => m._id !== msg._id));
        } catch {
          showToast('Failed to delete message', 'error');
        }
      }
    });
  };

  const filteredGroups = COMMUNITY_GROUPS.filter(
    (g) =>
      g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
      g.desc.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const pinnedMessage = messages.find((m) => m.pinned);
  const ActiveIcon = activeGroup.icon;

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-8">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <MessageSquare className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">
              Community Channels & Live Moderation
            </h1>
            <p className="text-[11px] text-muted-foreground">
              WhatsApp-style group streams, real-time traveler chat, announcement pinning & instant message removal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live WebSocket Sync</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {COMMUNITY_GROUPS.map((grp) => {
          const isSelected = activeGroup.id === grp.id;
          const Icon = grp.icon;
          return (
            <button
              key={grp.id}
              onClick={() => handleGroupSelect(grp)}
              className={`h-[32px] px-3 rounded-xl border text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? 'border-orange-500/60 bg-orange-500/10 text-orange-400'
                  : 'border-border/80 bg-[#121215] text-muted-foreground hover:text-foreground hover:border-orange-500/30 font-medium'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{grp.name}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#121215] border border-border/80 overflow-hidden shadow-lg h-[calc(100vh-250px)] min-h-[520px] flex flex-col md:flex-row">
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-border/80 flex flex-col bg-[#0f0f12] shrink-0 ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-3 border-b border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Community Groups ({COMMUNITY_GROUPS.length})
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">Public Channels</span>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                type="text"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                placeholder="Search groups..."
                className="w-full pl-8 pr-2.5 h-[30px] rounded-lg bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/40">
            {filteredGroups.map((grp) => {
              const Icon = grp.icon;
              const isSelected = activeGroup.id === grp.id;
              return (
                <button
                  key={grp.id}
                  onClick={() => handleGroupSelect(grp)}
                  className={`w-full p-3 text-left flex items-start gap-3 transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-orange-500/10 border-l-2 border-orange-500'
                      : 'hover:bg-secondary/40'
                  }`}
                >
                  <div
                    className={`size-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs transition-all ${
                      isSelected
                        ? 'border-orange-500/60 bg-orange-500/15 text-orange-400 shadow-sm shadow-orange-950/40'
                        : 'border-border/80 bg-[#18181b] text-muted-foreground group-hover:border-orange-500/30 group-hover:text-foreground'
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-orange-400' : 'text-foreground'
                        }`}
                      >
                        {grp.name}
                      </h4>
                      {isSelected && (
                        <span className="size-2 rounded-full bg-orange-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {grp.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col bg-[#121215] min-w-0 ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="px-3.5 py-2.5 border-b border-border/80 bg-[#151518] flex items-center justify-between gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setMobileShowChat(false)}
                className="md:hidden p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="size-4" />
              </button>

              <div className="size-9 rounded-xl border border-orange-500/40 bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                <ActiveIcon className="size-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-foreground truncate">{activeGroup.name}</h3>
                  <span className="px-1.5 py-0.2 rounded bg-orange-500/15 text-orange-400 text-[9px] font-bold border border-orange-500/20">
                    Admin Active
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{activeGroup.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => loadMessages()}
                className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors"
                title="Refresh Stream"
              >
                <RefreshCw className="size-3.5" />
              </button>
            </div>
          </div>

          {pinnedMessage && (
            <div className="p-2.5 px-4 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Pin className="size-3.5 text-orange-400 shrink-0" />
                <span className="text-orange-300 font-semibold truncate">
                  <strong>Pinned by Admin:</strong> {pinnedMessage.text}
                </span>
              </div>
              <button
                onClick={() => handleTogglePin(pinnedMessage)}
                className="text-[10px] text-orange-400 hover:underline font-bold shrink-0 cursor-pointer"
              >
                Unpin
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950/40 to-black/60">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader text="Loading group chat stream..." />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 p-6">
                <MessageSquare className="size-10 text-muted-foreground/30" />
                <h4 className="text-sm font-bold text-foreground">No Messages in this Group</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Start the conversation or post a pinned announcement for travelers in {activeGroup.name}.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.user?.role === 'admin';
                const isMine = user?._id === msg.user?._id;
                const imagesList = msg.images?.length ? msg.images : msg.image ? [msg.image] : [];

                return (
                  <div
                    key={msg._id}
                    className={`flex items-start gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className="size-8 rounded-xl border border-border overflow-hidden bg-secondary shrink-0">
                      <img
                        src={msg.user?.avatar?.url || msg.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={msg.user?.name || 'User'}
                        className="size-full object-cover"
                      />
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 space-y-2 shadow-sm border ${
                        isMine
                          ? 'bg-[#1c1c22] border-orange-500/30 text-foreground rounded-tr-xs'
                          : 'bg-[#18181c] border-border/80 text-foreground rounded-tl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1 text-[11px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-foreground truncate">
                            {msg.user?.name || 'Traveler'}
                          </span>
                          {isAdmin && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                              <Crown className="size-2.5 text-amber-400" />
                              <span>Admin</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleTogglePin(msg)}
                            className={`p-1 rounded hover:bg-secondary/60 cursor-pointer ${
                              msg.pinned ? 'text-orange-400' : 'text-muted-foreground'
                            }`}
                            title={msg.pinned ? 'Unpin' : 'Pin to Group'}
                          >
                            <Pin className="size-3" />
                          </button>

                          <button
                            onClick={() => handleDeleteMessage(msg)}
                            className="p-1 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 cursor-pointer transition-colors"
                            title="Delete Message (Admin)"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>

                      {imagesList.length > 0 && (
                        <div
                          className={`grid gap-1.5 rounded-xl overflow-hidden ${
                            imagesList.length === 1
                              ? 'grid-cols-1'
                              : imagesList.length === 2
                              ? 'grid-cols-2'
                              : 'grid-cols-3'
                          }`}
                        >
                          {imagesList.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              onClick={() => setPreviewModalImg(imgUrl)}
                              className="relative aspect-4/3 rounded-lg overflow-hidden border border-border/60 bg-black/40 group cursor-pointer"
                            >
                              <img
                                src={imgUrl}
                                alt="attachment"
                                className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="size-4 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap select-text">
                        {msg.text}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>

                        <div className="flex items-center gap-1">
                          <Heart className="size-3 text-rose-500 fill-rose-500" />
                          <span>{msg.likes?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {imagePreviews.length > 0 && (
            <div className="p-2.5 bg-[#151518] border-t border-border/80 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                Attached ({imagePreviews.length}/3):
              </span>
              {imagePreviews.map((url, i) => (
                <div key={i} className="relative size-12 rounded-lg border border-border overflow-hidden shrink-0">
                  <img src={url} alt="preview" className="size-full object-cover" />
                  <button
                    onClick={() => removeSelectedImage(i)}
                    className="absolute top-0.5 right-0.5 size-4 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-rose-600 cursor-pointer"
                  >
                    <X className="size-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="p-2.5 bg-[#151518] border-t border-border/80 flex items-center gap-2 shrink-0"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={selectedImages.length >= 3}
              className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/80 disabled:opacity-30 cursor-pointer transition-colors"
              title="Attach Images (Max 3)"
            >
              <ImageIcon className="size-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeGroup.name} as Administrator...`}
              className="flex-1 px-3.5 h-[38px] rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60"
            />

            <GlowingButton
              type="submit"
              disabled={sending || (!inputText.trim() && selectedImages.length === 0)}
              size="sm"
              innerClassName="h-[38px] px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Send className="size-3.5" />
              <span>Send</span>
            </GlowingButton>
          </form>
        </div>
      </div>

      {previewModalImg && (
        <div
          onClick={() => setPreviewModalImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-border bg-[#121215]">
            <img src={previewModalImg} alt="enlarged preview" className="max-h-[80vh] w-auto object-contain" />
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

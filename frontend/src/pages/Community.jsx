import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Send,
  Image as ImageIcon,
  Heart,
  Globe,
  Plane,
  Building,
  Pin,
  Compass,
  ArrowRight,
  ShieldCheck,
  Crown,
  X,
  Eye,
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles
} from 'lucide-react';
import {
  fetchCommunityMessages,
  postCommunityMessage,
  toggleLikeMessage,
  deleteCommunityMessage
} from '@/services/communityService';
import { getPublicCommunityTrips } from '@/services/tripService';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { compressImage } from '@/utils/imageCompressor';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

import { getCachedData, setCachedData } from '@/utils/realtimeSync';

const COMMUNITY_GROUPS = [
  {
    id: 'global-lounge',
    name: 'Global Traveler Lounge',
    desc: 'Worldwide travel banter, stories & wanderlust talk',
    icon: Globe,
    badgeColor: 'text-orange-400 border-orange-500/30 bg-orange-500/10'
  },
  {
    id: 'travel-buddies',
    name: 'Travel Buddies & Meetups',
    desc: 'Find travel companions, road trips & solo meetups',
    icon: Users,
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
  },
  {
    id: 'flights-and-deals',
    name: 'Flights & Airfare Deals',
    desc: 'Aviation routes, airline sales & seat alerts',
    icon: Plane,
    badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
  },
  {
    id: 'stays-and-hotels',
    name: 'Luxury Resorts & Hotels',
    desc: 'Boutique stays, hotel reviews & accommodation tips',
    icon: Building,
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  {
    id: 'solo-expeditions',
    name: 'Solo Expeditions & Treks',
    desc: 'Hiking trails, backpacker guides & mountain camps',
    icon: Compass,
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    id: 'photography-visuals',
    name: 'Sceneries & Photography',
    desc: 'Travel snapshots, drone shots & camera presets',
    icon: ImageIcon,
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  }
];

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showModal, showToast } = useModal();

  const [activeTab, setActiveTab] = useState('chat');
  const [activeGroup, setActiveGroup] = useState(COMMUNITY_GROUPS[0]);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [previewModalImg, setPreviewModalImg] = useState(null);

  const [publicTrips, setPublicTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (silent = false) => {
    const key = `community_msg_${activeGroup.id}`;
    const cached = getCachedData(key);
    if (!silent && !cached) setLoadingMessages(true);
    if (cached && !messages.length) setMessages(cached);

    try {
      const res = await fetchCommunityMessages(activeGroup.id, 80);
      if (res.data?.messages) {
        setMessages(res.data.messages);
        setCachedData(key, res.data.messages);
      } else {
        setMessages([]);
      }
    } catch {
      if (!silent) showToast('Could not load channel messages', 'error');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  const loadTrips = async (silent = false) => {
    const key = 'community_public_trips';
    const cached = getCachedData(key);
    if (!silent && !cached) setLoadingTrips(true);
    if (cached && !publicTrips.length) setPublicTrips(cached);

    try {
      const res = await getPublicCommunityTrips();
      if (res.data) {
        setPublicTrips(res.data);
        setCachedData(key, res.data);
      }
    } catch {
    } finally {
      if (!silent) setLoadingTrips(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      loadMessages();
    } else {
      loadTrips();
    }
  }, [activeGroup, activeTab]);

  useEffect(() => {
    if (activeTab !== 'chat') return;
    const interval = setInterval(() => {
      loadMessages(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeGroup, activeTab]);

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
    if (!user) {
      showToast('Please log in to participate in the community chat', 'warning');
      navigate('/login');
      return;
    }
    if (!inputText.trim() && selectedImages.length === 0) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('text', inputText.trim() || 'Shared a photo update');
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

  const handleLike = async (msgId) => {
    if (!user) {
      showToast('Please log in to like messages', 'warning');
      return;
    }
    try {
      const res = await toggleLikeMessage(msgId);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgId
            ? {
                ...m,
                likes: res.data.isLiked
                  ? [...(m.likes || []), user._id]
                  : (m.likes || []).filter((id) => id !== user._id)
              }
            : m
        )
      );
    } catch {
      showToast('Could not like message', 'error');
    }
  };

  const handleDeleteMyMessage = (msg) => {
    showModal({
      title: 'Delete Message?',
      message: 'Are you sure you want to delete your message? This cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCommunityMessage(msg._id);
          showToast('Message deleted', 'success');
          setMessages((prev) => prev.filter((m) => m._id !== msg._id));
        } catch {
          showToast('Failed to delete message', 'error');
        }
      }
    });
  };

  const pinnedMessage = messages.find((m) => m.pinned);
  const ActiveIcon = activeGroup.icon;

  return (
    <div className="w-full min-h-screen bg-background text-foreground py-6 px-3 sm:px-6 font-sans select-none">
      <div className="max-w-[1440px] mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#121215] border border-border/80 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-foreground tracking-tight font-heading">
                WanderSync Community Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                Live Channels
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connect with fellow global travelers, share real-time tips, and explore community itineraries.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#18181b] border border-border/80 self-stretch sm:self-auto">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-orange-500 text-zinc-950 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <MessageSquare className="size-3.5" />
              <span>Group Chats</span>
            </button>

            <button
              onClick={() => setActiveTab('itineraries')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'itineraries'
                  ? 'bg-orange-500 text-zinc-950 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              <Compass className="size-3.5" />
              <span>Public Itineraries</span>
            </button>
          </div>
        </div>

        {activeTab === 'chat' ? (
          <div className="rounded-2xl bg-[#121215] border border-border/80 overflow-hidden shadow-lg h-[calc(100vh-210px)] min-h-[560px] flex flex-col md:flex-row">
            <div
              className={`w-full md:w-80 lg:w-96 border-r border-border/80 flex flex-col bg-[#0f0f12] shrink-0 ${
                mobileShowChat ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="p-3.5 border-b border-border/80">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Community Lounges
                </span>
                <p className="text-[11px] text-muted-foreground">Select a channel to join the talk</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/40">
                {COMMUNITY_GROUPS.map((grp) => {
                  const Icon = grp.icon;
                  const isSelected = activeGroup.id === grp.id;
                  return (
                    <button
                      key={grp.id}
                      onClick={() => handleGroupSelect(grp)}
                      className={`w-full p-3 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500/10 border-l-2 border-orange-500'
                          : 'hover:bg-secondary/40'
                      }`}
                    >
                      <div
                        className={`size-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${grp.badgeColor}`}
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
              <div className="px-4 py-3 border-b border-border/80 bg-[#151518] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <ArrowLeft className="size-4" />
                  </button>

                  <div
                    className={`size-9 rounded-xl border flex items-center justify-center shrink-0 ${activeGroup.badgeColor}`}
                  >
                    <ActiveIcon className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-foreground truncate">{activeGroup.name}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{activeGroup.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>

              {pinnedMessage && (
                <div className="p-2.5 px-4 bg-orange-500/10 border-b border-orange-500/20 flex items-center gap-2 text-xs shrink-0">
                  <Pin className="size-3.5 text-orange-400 shrink-0" />
                  <span className="text-orange-300 font-semibold truncate">
                    <strong>Announcement:</strong> {pinnedMessage.text}
                  </span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-zinc-950/40 to-black/60">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader text="Joining room stream..." />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 p-6">
                    <MessageSquare className="size-10 text-muted-foreground/30" />
                    <h4 className="text-sm font-bold text-foreground">No Messages in this Lounge</h4>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Be the first traveler to post a question, story, or travel snap in {activeGroup.name}!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.user?.role === 'admin';
                    const isMine = user?._id === msg.user?._id;
                    const isLiked = msg.likes?.includes(user?._id);
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
                                {isMine ? 'You' : msg.user?.name || 'Traveler'}
                              </span>
                              {isAdmin && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                                  <Crown className="size-2.5 text-amber-400" />
                                  <span>Admin</span>
                                </span>
                              )}
                            </div>

                            {(isMine || user?.role === 'admin') && (
                              <button
                                onClick={() => handleDeleteMyMessage(msg)}
                                className="p-1 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 cursor-pointer"
                                title="Delete Message"
                              >
                                <X className="size-3" />
                              </button>
                            )}
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

                            <button
                              onClick={() => handleLike(msg._id)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                                isLiked
                                  ? 'bg-rose-500/15 text-rose-400'
                                  : 'hover:bg-secondary/60 text-muted-foreground hover:text-rose-400'
                              }`}
                            >
                              <Heart
                                className={`size-3 ${
                                  isLiked ? 'text-rose-500 fill-rose-500' : ''
                                }`}
                              />
                              <span>{msg.likes?.length || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
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
                  placeholder={
                    user
                      ? `Message ${activeGroup.name}...`
                      : 'Please login to send message...'
                  }
                  disabled={!user}
                  className="flex-1 px-3.5 h-[38px] rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 disabled:opacity-50"
                />

                <GlowingButton
                  type="submit"
                  disabled={
                    sending ||
                    !user ||
                    (!inputText.trim() && selectedImages.length === 0)
                  }
                  size="sm"
                  innerClassName="h-[38px] px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  <span>Send</span>
                </GlowingButton>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {loadingTrips ? (
              <div className="py-20 flex items-center justify-center">
                <Loader text="Loading public community itineraries..." />
              </div>
            ) : publicTrips.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#121215] border border-border/80 space-y-2">
                <Compass className="size-10 text-muted-foreground/30 mx-auto" />
                <h3 className="text-sm font-bold text-foreground">No Public Trips Yet</h3>
                <p className="text-xs text-muted-foreground">
                  Be the first traveler to create and publish an itinerary to the community.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicTrips.map((trip) => (
                  <div
                    key={trip._id}
                    className="p-4 rounded-2xl bg-[#121215] border border-border/80 flex flex-col justify-between gap-3 shadow-sm hover:border-orange-500/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                          {trip.destinationCountry || 'Global'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {trip.durationDays || 3} Days
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-foreground line-clamp-1">{trip.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{trip.description}</p>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3 text-orange-400" />
                        <span className="truncate">{trip.destinationCity || 'Destination'}</span>
                      </div>

                      <button
                        onClick={() => navigate(`/itinerary/${trip._id}`)}
                        className="px-2.5 py-1 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>View</span>
                        <ArrowRight className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

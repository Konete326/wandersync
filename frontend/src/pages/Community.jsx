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
  Sparkles,
  MapPin,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
  Crown,
  X,
  Smile,
  CheckCircle2
} from 'lucide-react';
import {
  fetchCommunityMessages,
  postCommunityMessage,
  toggleLikeMessage
} from '@/services/communityService';
import { getPublicCommunityTrips } from '@/services/tripService';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { compressImage } from '@/utils/imageCompressor';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

const channels = [
  { id: 'global-lounge', name: '#global-lounge', desc: 'General traveler banter & wanderlust talk', icon: Globe },
  { id: 'travel-buddies', name: '#travel-buddies', desc: 'Find travel companions & solo meetups', icon: Users },
  { id: 'flights-and-deals', name: '#flights-and-deals', desc: 'Aviation routes, airline tips & seat deals', icon: Plane },
  { id: 'stays-and-hotels', name: '#stays-and-hotels', desc: 'Resort recommendations & hotel reviews', icon: Building }
];

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useModal();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'itineraries'
  const [activeChannel, setActiveChannel] = useState('global-lounge');

  // Messages state
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Itineraries state
  const [publicTrips, setPublicTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch Channel Messages
  const loadMessages = async (silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const res = await fetchCommunityMessages(activeChannel, 60);
      if (res.data?.messages) {
        setMessages(res.data.messages);
      } else {
        setMessages([]);
      }
    } catch {
      if (!silent) showToast('Could not load channel messages', 'error');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Fetch Public Trips
  const loadTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await getPublicCommunityTrips();
      if (res.data) {
        setPublicTrips(res.data);
      }
    } catch {
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [activeChannel]);

  // Real-time polling every 3 seconds for live chat feel
  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeChannel]);

  useEffect(() => {
    if (activeTab === 'itineraries') {
      loadTrips();
    }
  }, [activeTab]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setSelectedImage(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in to participate in the community chat', 'warning');
      navigate('/login');
      return;
    }
    if (!inputText.trim() && !selectedImage) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('text', inputText.trim() || 'Shared a travel photo');
      formData.append('room', activeChannel);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await postCommunityMessage(formData);
      setInputText('');
      setSelectedImage(null);
      setImagePreview('');
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
        prev.map((m) => {
          if (m._id === msgId) {
            const currentLikes = m.likes || [];
            const isLiked = currentLikes.includes(user._id);
            return {
              ...m,
              likes: isLiked ? currentLikes.filter((id) => id !== user._id) : [...currentLikes, user._id]
            };
          }
          return m;
        })
      );
    } catch {
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-[#fafafa] font-sans pb-16 select-none">
      {/* Top Header */}
      <div className="border-b border-border/80 bg-[#121215]/80 backdrop-blur-xl sticky top-14 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Users className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">WanderSync Global Community Lounge</h1>
              <p className="text-[10px] text-muted-foreground">Real-time traveler chats, journey tips, and shared AI itineraries</p>
            </div>
          </div>

          {/* Dual-View Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-secondary/50 border border-border">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="size-3.5" />
              <span>Live Channels Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('itineraries')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'itineraries'
                  ? 'bg-orange-500 text-zinc-950 shadow-md shadow-orange-500/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="size-3.5" />
              <span>Public Itineraries</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* VIEW 1: LIVE CHANNELS CHAT */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-12rem)] min-h-[550px]">
            
            {/* Left Channel Sidebar */}
            <div className="md:col-span-4 lg:col-span-3 rounded-2xl bg-[#121215] border border-border/80 p-3 flex flex-col justify-between shadow-md">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 block">
                  Discussion Channels
                </span>

                <div className="space-y-1.5">
                  {channels.map((ch) => {
                    const Icon = ch.icon;
                    const isActive = activeChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setActiveChannel(ch.id)}
                        className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                          isActive
                            ? 'bg-orange-500/15 border border-orange-500/40 text-orange-400'
                            : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground border border-transparent'
                        }`}
                      >
                        <Icon className="size-4 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{ch.name}</span>
                          <span className="text-[10px] text-muted-foreground block truncate">{ch.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Online indicator */}
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-400">Live Network Sync</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">3s Stream</span>
              </div>
            </div>

            {/* Right Live Messages Stream & Composer */}
            <div className="md:col-span-8 lg:col-span-9 rounded-2xl bg-[#121215] border border-border/80 flex flex-col justify-between shadow-md overflow-hidden">
              
              {/* Channel Header */}
              <div className="p-3.5 border-b border-border/80 bg-secondary/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-foreground">
                    {channels.find((c) => c.id === activeChannel)?.name || '#channel'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {channels.find((c) => c.id === activeChannel)?.desc}
                  </span>
                </div>
              </div>

              {/* Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {loadingMessages ? (
                  <div className="py-24 flex items-center justify-center">
                    <Loader text="Connecting to live traveler stream..." />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center space-y-2">
                    <MessageSquare className="size-10 text-muted-foreground/30 mx-auto" />
                    <h3 className="text-sm font-bold text-foreground">Channel is quiet</h3>
                    <p className="text-xs text-muted-foreground">
                      Be the first to say hello or ask a travel recommendation!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf = user?._id === msg.user?._id;
                    const isLiked = msg.likes?.includes(user?._id);

                    return (
                      <div
                        key={msg._id}
                        className={`flex items-start gap-3 p-3 rounded-2xl transition-all ${
                          msg.pinned
                            ? 'bg-amber-950/20 border border-amber-500/40 ring-1 ring-amber-500/20'
                            : 'bg-secondary/25 hover:bg-secondary/40 border border-border/60'
                        }`}
                      >
                        {/* Avatar */}
                        <div className="size-8 rounded-xl border border-orange-500/30 overflow-hidden bg-secondary shrink-0 mt-0.5">
                          <img
                            src={msg.user?.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={msg.user?.name || 'User'}
                            className="size-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-xs text-foreground">
                              {msg.user?.name || 'Traveler'}
                            </span>

                            {msg.user?.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                                <Crown className="size-2.5" /> Staff
                              </span>
                            )}

                            {msg.pinned && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-zinc-950 flex items-center gap-0.5">
                                <Pin className="size-2.5 fill-current" /> Pinned
                              </span>
                            )}

                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-200 leading-relaxed break-words">{msg.text}</p>

                          {/* Image Attachment */}
                          {msg.image && (
                            <div className="pt-1.5">
                              <img
                                src={msg.image}
                                alt="Shared Attachment"
                                className="max-h-52 rounded-xl border border-border/80 object-cover shadow-sm"
                              />
                            </div>
                          )}
                        </div>

                        {/* Heart Like */}
                        <button
                          onClick={() => handleLike(msg._id)}
                          className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] transition-colors cursor-pointer shrink-0 ${
                            isLiked
                              ? 'text-rose-400 bg-rose-500/10'
                              : 'text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10'
                          }`}
                          title="Like message"
                        >
                          <Heart className={`size-3.5 ${isLiked ? 'fill-current' : ''}`} />
                          <span className="font-semibold">{msg.likes?.length || 0}</span>
                        </button>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Box */}
              <div className="p-3 border-t border-border/80 bg-secondary/30 space-y-2">
                {/* Image Preview Banner */}
                {imagePreview && (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Upload preview" className="h-16 rounded-lg border border-orange-500/40 object-cover" />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                      className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs cursor-pointer shadow-md"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <label className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors shrink-0">
                    <ImageIcon className="size-4 text-orange-400" />
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${channels.find((c) => c.id === activeChannel)?.name}...`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-secondary/50 border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputText.trim() && !selectedImage)}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-orange-500/20 shrink-0"
                  >
                    <Send className="size-3.5" />
                    <span>{sending ? 'Sending...' : 'Send'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: PUBLIC FEATURED ITINERARIES */}
        {activeTab === 'itineraries' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {loadingTrips ? (
              <div className="py-24 flex items-center justify-center">
                <Loader text="Loading public community journeys..." />
              </div>
            ) : publicTrips.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#121215] border border-border text-center space-y-4 max-w-md mx-auto">
                <Compass className="size-10 text-orange-400 mx-auto" />
                <h3 className="text-base font-bold text-foreground">Be the First to Publish</h3>
                <p className="text-xs text-muted-foreground">
                  Generate an itinerary with Gemini AI and publish it publicly to inspire travelers across the globe.
                </p>
                <GlowingButton
                  onClick={() => navigate('/create')}
                  size="sm"
                  innerClassName="font-bold flex items-center gap-2 mx-auto"
                >
                  <span>Create & Publish Itinerary</span>
                  <ArrowRight className="size-3.5" />
                </GlowingButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {publicTrips.map((trip) => (
                  <div
                    key={trip._id}
                    onClick={() => navigate(`/shared/${trip.shareSlug}`)}
                    className="p-6 rounded-2xl bg-[#121215] border border-border/80 flex flex-col justify-between space-y-6 hover:border-orange-500/40 transition-all group cursor-pointer shadow-md"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-orange-400 font-bold">
                          <Sparkles className="size-3" />
                          {trip.durationDays || 3} Days
                        </span>
                        <span className="text-zinc-400 font-medium">
                          Est. ${trip.estimatedTotalCost || 1200}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold font-heading text-foreground group-hover:text-orange-400 transition-colors">
                        {trip.title || `Trip to ${trip.destination?.city || 'Destination'}`}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-orange-400 shrink-0" />
                        <span>{trip.destination?.city}, {trip.destination?.country}</span>
                      </div>

                      {trip.days && trip.days.length > 0 && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {trip.days[0]?.activities?.[0]?.description || 'AI crafted cultural landmarks and excursions.'}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/60">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs text-foreground">
                          {trip.user?.name ? trip.user.name.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-foreground">{trip.user?.name || 'Traveler'}</h4>
                          <span className="text-[10px] text-muted-foreground">Explorer</span>
                        </div>
                      </div>

                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

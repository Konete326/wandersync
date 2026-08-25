import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  X,
  Send,
  Sparkles,
  Minimize2,
  Trash2,
  Bot,
  Crown,
  Compass,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Luggage,
  Users,
  Briefcase,
  Plane,
  Building,
  Car,
  Image,
  Receipt,
  Settings,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { chatWithAiAssistant } from '../../services/aiService';
import { saveTrip } from '../../services/tripService';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

const ADMIN_NAVIGATION_MAP = [
  { keywords: ['country', 'countries', 'regional hub'], path: '/admin/countries/new', label: 'Open Country Studio', icon: GlobeIcon },
  { keywords: ['pos', 'terminal', 'tour pos', 'pos booking'], path: '/admin/tour-pos', label: 'Launch POS Terminal', icon: CreditCard },
  { keywords: ['employee', 'staff', 'task', 'delegat', 'team'], path: '/admin/employees', label: 'Open Staff & Tasks', icon: Briefcase },
  { keywords: ['hotel', 'resort', 'stay', 'accommodation'], path: '/admin/hotels/new', label: 'Add New Hotel', icon: Building },
  { keywords: ['spot', 'attraction', 'landmark'], path: '/admin/spots/new', label: 'Create Attraction Spot', icon: Compass },
  { keywords: ['vehicle', 'car', 'fleet', 'transport'], path: '/admin/vehicles/new', label: 'Add Fleet Vehicle', icon: Car },
  { keywords: ['flight', 'airline', 'airfare', 'plane'], path: '/admin/flights/new', label: 'Schedule Flight', icon: Plane },
  { keywords: ['tour', 'package', 'group tour'], path: '/admin/group-tours/new', label: 'Design Group Tour', icon: Luggage },
  { keywords: ['destination', 'media', 'gallery'], path: '/admin/media/new', label: 'Create Destination', icon: Image },
  { keywords: ['trip', 'trips maestro', 'itinerar'], path: '/admin/trips', label: 'View All Trips', icon: Compass },
  { keywords: ['user', 'traveler', 'customer'], path: '/admin/users', label: 'Manage Travelers', icon: Users },
  { keywords: ['expense', 'finance', 'revenue'], path: '/admin/expenses', label: 'Check Expenses', icon: Receipt },
  { keywords: ['setting', 'config'], path: '/admin/settings', label: 'System Settings', icon: Settings },
  { keywords: ['community', 'lounge', 'chat moderat'], path: '/admin/community', label: 'Community Moderation', icon: Users }
];

const USER_NAVIGATION_MAP = [
  { keywords: ['create trip', 'plan trip', 'new itinerary', 'generate trip'], path: '/create-trip', label: 'Plan a Trip', icon: Sparkles },
  { keywords: ['destination', 'gallery', 'explore', 'spots', 'places'], path: '/gallery', label: 'Explore Destinations', icon: Compass },
  { keywords: ['community', 'chat', 'forum', 'lounge', 'meetup'], path: '/community', label: 'Join Community', icon: Users },
  { keywords: ['my trip', 'my booking', 'saved trips'], path: '/my-trips', label: 'View My Trips', icon: Compass },
  { keywords: ['pricing', 'subscription', 'upgrade', 'cost'], path: '/pricing', label: 'View Pricing', icon: CreditCard },
  { keywords: ['how it works', 'guide'], path: '/how-it-works', label: 'How It Works', icon: Compass }
];

function GlobeIcon(props) {
  return <Compass {...props} />;
}

const adminQuickPrompts = [
  'Add new Country with AI',
  'Open Tour POS Terminal',
  'Delegate Task to Staff',
  'Create 5-Star Hotel in Dubai',
  'Schedule new Flight Route',
  'Check Agency Expenses'
];

const userQuickPrompts = [
  'Plan 5-Day Tokyo Trip',
  'Create 3-Day Paris Romantic Plan',
  'Generate 7-Day Hunza Expedition',
  'Explore Top Destinations',
  'Packing tips for Europe'
];

export default function AiChatWidget({ tripContext = null }) {
  const { user } = useAuth();
  const { showToast } = useModal();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith('/admin') || user?.role === 'admin';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingTripId, setSavingTripId] = useState(null);
  const messagesEndRef = useRef(null);

  const handleSaveGeneratedTrip = async (itinerary) => {
    if (!itinerary) return;
    setSavingTripId(itinerary.title || 'saving');
    try {
      const res = await saveTrip(itinerary);
      const newTripId = res.data?._id || res.data?.id;
      showToast('Itinerary saved to My Trips!', 'success');
      if (newTripId) {
        navigate(`/trips/${newTripId}`);
        setIsOpen(false);
      } else {
        navigate('/my-trips');
        setIsOpen(false);
      }
    } catch {
      showToast('Could not save itinerary. Please login to save.', 'error');
    } finally {
      setSavingTripId(null);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      setMessages([
        {
          id: 'admin-welcome',
          sender: 'assistant',
          text: "Greetings Administrator! I am your WanderSync Operations Copilot. I have command access to guide you, navigate across admin modules, pre-fill catalog forms, and help manage staff tasks. How can I assist your operations?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: 'Open Countries Studio', path: '/admin/countries/new' },
            { label: 'Launch POS Terminal', path: '/admin/tour-pos' },
            { label: 'Staff Task Board', path: '/admin/employees' }
          ]
        }
      ]);
    } else {
      setMessages([
        {
          id: 'user-welcome',
          sender: 'assistant',
          text: "Hello! I'm your WanderSync AI Travel Concierge powered by OpenAI GPT-4o & Gemini. Ask me for complete travel plans (e.g. 'Mujhe 5 days ka Tokyo plan bana kar do'), destination advice, or packing tips!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: 'Plan a New Trip', path: '/create-trip' },
            { label: 'Explore Destinations', path: '/gallery' }
          ]
        }
      ]);
    }
  }, [isAdmin]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  const detectActions = (queryText) => {
    const textLower = queryText.toLowerCase();
    const navMap = isAdmin ? ADMIN_NAVIGATION_MAP : USER_NAVIGATION_MAP;
    const actions = [];

    for (const item of navMap) {
      const match = item.keywords.some((kw) => textLower.includes(kw));
      if (match) {
        actions.push({ label: item.label, path: item.path });
      }
    }
    return actions.slice(0, 3);
  };

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const detected = detectActions(query.trim());
      const res = await chatWithAiAssistant(query.trim(), historyPayload, tripContext, isAdmin);

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.data?.reply || 'I am ready to assist you further.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: detected.length > 0 ? detected : undefined,
        generatedItinerary: res.data?.generatedItinerary || null,
        provider: res.data?.provider || 'AI Engine'
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Sorry, I ran into an issue connecting to the AI engine. Please try again in a moment.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: isAdmin
          ? 'Operations chat cleared. What module or task would you like to execute?'
          : 'Chat cleared. What destination or trip would you like to plan?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast('Conversation cleared', 'info');
  };

  const handleActionClick = (action) => {
    navigate(action.path);
    showToast(`Redirecting to ${action.label}`, 'info');
  };

  const currentQuickPrompts = isAdmin ? adminQuickPrompts : userQuickPrompts;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] font-sans select-none pointer-events-auto">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`size-13 sm:size-14 rounded-full bg-[#121215] border-2 flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 cursor-pointer relative group ${
            isAdmin
              ? 'border-orange-500/70 text-orange-400 shadow-orange-950/60 hover:border-orange-400'
              : 'border-orange-500/50 text-orange-400 shadow-orange-950/40 hover:border-orange-400'
          }`}
          title={isAdmin ? 'WanderSync AI Admin Copilot (Click to open)' : 'WanderSync AI Travel Concierge (Click to open)'}
        >
          {isAdmin ? (
            <Bot className="size-6 text-orange-400 group-hover:rotate-12 transition-transform" />
          ) : (
            <Sparkles className="size-6 text-orange-400 group-hover:rotate-12 transition-transform" />
          )}
          <span className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full bg-orange-500 border-2 border-[#121215] animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="w-[calc(100vw-2rem)] max-w-[400px] sm:w-[400px] bg-[#121215] border border-orange-500/30 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[540px] max-h-[82vh] animate-in slide-in-from-bottom-5 duration-200">
          <div className="px-4 py-3 border-b border-border/80 bg-[#151518] flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                {isAdmin ? <Crown className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div>
                <h2 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <span>{isAdmin ? 'AI Ops Copilot' : 'AI Travel Concierge'}</span>
                  <span className="bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[9px] px-1.5 py-0.2 rounded-full font-semibold flex items-center gap-1">
                    <span className="size-1.5 bg-orange-400 rounded-full animate-ping" />
                    <span>{isAdmin ? 'Admin Mode' : 'Gemini 3.7'}</span>
                  </span>
                </h2>
                <p className="text-[10px] text-muted-foreground truncate max-w-[190px]">
                  {isAdmin ? 'Full System Command Access' : 'Intelligent Travel Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                title="Clear Chat"
              >
                <Trash2 className="size-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                title="Minimize"
              >
                <Minimize2 className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-3.5 overflow-y-auto custom-scrollbar flex flex-col space-y-3 bg-[#0a0a0c]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 font-medium rounded-br-none shadow-md shadow-orange-950/20'
                        : 'bg-[#18181b] text-zinc-200 border border-border/80 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}

                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-border/40 flex flex-wrap gap-1.5">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/40 text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="size-2.5" />
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.generatedItinerary && (
                      <div className="mt-3 p-3 rounded-xl bg-[#121215] border border-orange-500/30 space-y-2.5 text-left shadow-md">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[9px] font-bold uppercase tracking-wider">
                              {msg.generatedItinerary.durationDays || msg.generatedItinerary.days?.length || 3} Days • {msg.generatedItinerary.budgetLevel || 'Moderate'}
                            </span>
                            <h4 className="text-xs font-bold text-foreground truncate pt-1">
                              {msg.generatedItinerary.title}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <MapPin className="size-3 text-orange-400 shrink-0" />
                              <span className="truncate">
                                {msg.generatedItinerary.destination?.city || ''}{msg.generatedItinerary.destination?.country ? `, ${msg.generatedItinerary.destination?.country}` : ''}
                              </span>
                            </div>
                          </div>
                          {msg.generatedItinerary.estimatedTotalCost > 0 && (
                            <div className="px-2 py-1 rounded-lg bg-secondary/80 border border-border text-right shrink-0">
                              <span className="text-[9px] text-muted-foreground block">Est. Cost</span>
                              <span className="text-xs font-bold text-foreground">
                                ${msg.generatedItinerary.estimatedTotalCost}
                              </span>
                            </div>
                          )}
                        </div>

                        {msg.generatedItinerary.overview && (
                          <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                            {msg.generatedItinerary.overview}
                          </p>
                        )}

                        {msg.generatedItinerary.highlights && msg.generatedItinerary.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {msg.generatedItinerary.highlights.slice(0, 3).map((h, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-secondary/60 text-zinc-300 text-[9px] font-medium border border-border/60 flex items-center gap-1">
                                <Sparkles className="size-2 text-orange-400" />
                                <span className="truncate max-w-[120px]">{h}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {msg.generatedItinerary.days && msg.generatedItinerary.days.length > 0 && (
                          <div className="pt-2 border-t border-border/50 space-y-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                              Day-by-Day Plan ({msg.generatedItinerary.days.length} Days)
                            </span>
                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                              {msg.generatedItinerary.days.map((day) => (
                                <div key={day.dayNumber} className="p-1.5 rounded-lg bg-secondary/30 border border-border/40 text-[10px] space-y-0.5">
                                  <div className="flex items-center justify-between font-bold text-orange-300">
                                    <span>Day {day.dayNumber}: {day.title || day.theme}</span>
                                    <span className="text-[9px] text-muted-foreground">{day.activities?.length || 0} stops</span>
                                  </div>
                                  {day.activities?.[0] && (
                                    <p className="text-muted-foreground line-clamp-1 text-[9px]">
                                      • {day.activities[0].timeSlot}: {day.activities[0].title}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-1.5">
                          <button
                            type="button"
                            disabled={savingTripId === (msg.generatedItinerary.title || 'saving')}
                            onClick={() => handleSaveGeneratedTrip(msg.generatedItinerary)}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-950/40 cursor-pointer disabled:opacity-50 min-h-[36px]"
                          >
                            <Sparkles className="size-3.5" />
                            <span>{savingTripId === (msg.generatedItinerary.title || 'saving') ? 'Saving Plan...' : 'Save & Open Itinerary'}</span>
                            <ArrowRight className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-muted-foreground/60 mt-1 px-1">
                    {msg.time} {msg.provider && `• ${msg.provider}`}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div className="self-start flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#18181b] border border-border/80 rounded-bl-none shadow-sm animate-in fade-in duration-150">
                <span className="size-2 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-2 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-2 rounded-full bg-orange-400 animate-bounce" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2.5 bg-[#121215] border-t border-border/60 space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              {currentQuickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-[#18181b] hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 border border-border/80 hover:border-orange-500/40 whitespace-nowrap transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2 items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isAdmin
                    ? 'Command copilot (e.g. Open POS, add country, delegate task)...'
                    : 'Ask advice, trip plans, explore spots...'
                }
                className="flex-1 px-3.5 h-[36px] rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="size-9 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-30 text-zinc-950 flex items-center justify-center transition-all cursor-pointer shadow-sm shadow-orange-500/20"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

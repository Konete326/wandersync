import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, DollarSign, Users, Tag, Clock, Wand2, ArrowRight } from 'lucide-react';
import { generateItineraryWithAi, saveTrip } from '../services/tripService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';

const quickInspirations = [
  '5 Days in Kyoto for cherry blossoms & matcha tasting',
  '7 Days Swiss Alps scenic trains & alpine hikes with $3000 budget',
  '4 Days Rome & Florence food & art tour for couple',
  '10 Days Bali surfing, waterfalls & spiritual retreat'
];

const CreateTrip = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showModal, showToast } = useModal();

  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [budgetLevel, setBudgetLevel] = useState('Moderate');
  const [travelStyle, setTravelStyle] = useState('moderate');
  const [companions, setCompanions] = useState('Solo');
  const [interests, setInterests] = useState('Sightseeing, Culture, Food');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const parseNaturalLanguage = (text) => {
    if (!text.trim()) return;
    const lower = text.toLowerCase();

    const daysMatch = lower.match(/(\d+)\s*(?:days?|day)/i);
    if (daysMatch && daysMatch[1]) {
      const parsedDays = Math.min(Math.max(parseInt(daysMatch[1], 10), 1), 14);
      setDurationDays(parsedDays);
    }

    if (lower.includes('budget') || lower.includes('cheap') || lower.includes('backpack')) {
      setBudgetLevel('Budget');
      setTravelStyle('budget');
    } else if (lower.includes('luxury') || lower.includes('premium') || lower.includes('5 star')) {
      setBudgetLevel('Luxury');
      setTravelStyle('luxury');
    } else {
      setBudgetLevel('Moderate');
      setTravelStyle('moderate');
    }

    if (lower.includes('couple') || lower.includes('romantic') || lower.includes('honeymoon')) {
      setCompanions('Couple');
    } else if (lower.includes('family') || lower.includes('kids')) {
      setCompanions('Family');
    } else if (lower.includes('friends') || lower.includes('group')) {
      setCompanions('Friends');
    } else {
      setCompanions('Solo');
    }

    const destinationsList = [
      'Kyoto', 'Tokyo', 'Japan', 'Paris', 'France', 'Rome', 'Florence',
      'Italy', 'Bali', 'Indonesia', 'Switzerland', 'Zurich', 'London',
      'New York', 'Dubai', 'Barcelona', 'Spain', 'Amsterdam', 'Cairo'
    ];

    for (const dest of destinationsList) {
      if (lower.includes(dest.toLowerCase())) {
        setDestination(dest);
        break;
      }
    }

    const detectedInterests = [];
    if (lower.includes('food') || lower.includes('culinary') || lower.includes('ramen') || lower.includes('wine')) detectedInterests.push('Food & Dining');
    if (lower.includes('culture') || lower.includes('temple') || lower.includes('art') || lower.includes('museum')) detectedInterests.push('Culture & History');
    if (lower.includes('nature') || lower.includes('hike') || lower.includes('mountain') || lower.includes('alps')) detectedInterests.push('Nature & Adventure');
    if (lower.includes('beach') || lower.includes('surf') || lower.includes('ocean')) detectedInterests.push('Beach & Relaxation');
    if (lower.includes('photo') || lower.includes('sightsee')) detectedInterests.push('Photography');

    if (detectedInterests.length > 0) {
      setInterests(detectedInterests.join(', '));
    }
  };

  useEffect(() => {
    if (location.state?.initialPrompt) {
      setNaturalPrompt(location.state.initialPrompt);
      parseNaturalLanguage(location.state.initialPrompt);
    }
  }, [location.state]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleApplyPrompt = (promptText) => {
    setNaturalPrompt(promptText);
    parseNaturalLanguage(promptText);
    showToast('Preferences auto-filled from natural text!', 'info');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    if (!destination.trim() && !naturalPrompt.trim()) {
      showModal({
        title: 'Missing Destination',
        message: 'Please provide either a destination or type your travel vision in natural language.',
        type: 'warning'
      });
      return;
    }

    if (!user) {
      showModal({
        title: 'Sign In Required',
        message: 'Please sign in or create an account to generate and save your AI travel itinerary.',
        type: 'info',
        confirmText: 'Sign In Now',
        onConfirm: () => navigate('/login')
      });
      return;
    }

    setLoading(true);
    try {
      const res = await generateItineraryWithAi({
        destination: destination || naturalPrompt,
        durationDays,
        startDate,
        budgetLevel,
        travelStyle,
        companions,
        interests,
        customPrompt: naturalPrompt
      });

      const savedTrip = await saveTrip(res.data);
      showToast('Itinerary generated and saved!', 'success');
      navigate(`/trips/${savedTrip.data._id}`);
    } catch (error) {
      setCooldown(5);
      showModal({
        title: 'Generation Failed',
        message: error.response?.data?.message || error.message || 'Failed to generate itinerary. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <Loader text="Gemini 3.7 AI is synthesizing your bespoke itinerary..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground py-8 sm:py-14 px-3 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            Natural Language Journey Architect
          </div>
          <h1 className="text-3xl sm:text-5xl font-normal font-['Instrument_Serif'] tracking-tight">
            Design Your Custom Itinerary
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto font-sans leading-relaxed">
            Describe your trip naturally or refine preferences below to generate a tailored day-by-day plan.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="liquid-glass-card rounded-3xl p-5 sm:p-8 border border-border/80 space-y-6 shadow-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Wand2 className="size-4 text-cyan-400" />
                <span>Natural Language Input (Prompt or Vibes)</span>
              </label>
              {naturalPrompt && (
                <button
                  type="button"
                  onClick={() => parseNaturalLanguage(naturalPrompt)}
                  className="text-[11px] font-semibold text-cyan-400 hover:underline cursor-pointer"
                >
                  Auto-Fill Preferences
                </button>
              )}
            </div>
            <textarea
              rows="3"
              value={naturalPrompt}
              onChange={(e) => {
                setNaturalPrompt(e.target.value);
                parseNaturalLanguage(e.target.value);
              }}
              placeholder="e.g. I want a 5-day cultural and food trip to Kyoto in autumn with moderate budget for a couple..."
              className="w-full p-4 rounded-2xl bg-secondary/50 border border-border text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none font-sans"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground mr-1">Inspirations:</span>
              {quickInspirations.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPrompt(item)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer truncate max-w-xs"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="size-3.5 text-cyan-400" />
                <span>Destination / City</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kyoto, Japan"
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="size-3.5 text-cyan-400" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="size-3.5 text-cyan-400" />
                <span>Duration ({durationDays} Days)</span>
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="size-3.5 text-cyan-400" />
                <span>Budget Tier</span>
              </label>
              <select
                value={budgetLevel}
                onChange={(e) => setBudgetLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                <option value="Budget" className="bg-card text-foreground">Budget Friendly</option>
                <option value="Moderate" className="bg-card text-foreground">Moderate / Balanced</option>
                <option value="Luxury" className="bg-card text-foreground">Luxury & Comfort</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Users className="size-3.5 text-cyan-400" />
                <span>Companions</span>
              </label>
              <select
                value={companions}
                onChange={(e) => setCompanions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                <option value="Solo" className="bg-card text-foreground">Solo Traveler</option>
                <option value="Couple" className="bg-card text-foreground">Couple / Romantic</option>
                <option value="Family" className="bg-card text-foreground">Family with Kids</option>
                <option value="Friends" className="bg-card text-foreground">Friends Group</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <Tag className="size-3.5 text-cyan-400" />
              <span>Interests & Vibes</span>
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Architecture, Hidden Cafes, Photography, Hiking"
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={cooldown > 0}
            className={`w-full py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              cooldown > 0
                ? 'bg-secondary text-muted-foreground border border-border cursor-not-allowed opacity-75'
                : 'bg-cyan-500 hover:bg-cyan-400 text-zinc-950 shadow-lg shadow-cyan-500/20 cursor-pointer'
            }`}
          >
            {cooldown > 0 ? (
              <>
                <Clock className="size-4 animate-spin" />
                <span>AI Cooldown Active ({cooldown}s)</span>
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                <span>Generate Itinerary with Gemini 3.7</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;

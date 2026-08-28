import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles, MapPin, Calendar, DollarSign, Users, Tag, Clock,
  Wand2, ArrowRight, Check, Compass, ShieldCheck, HeartHandshake,
  Coffee, Mountain, Landmark, Utensils
} from 'lucide-react';
import { generateItineraryWithAi, saveTrip } from '../services/tripService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import GlowingButton from '../components/common/GlowingButton';
import AiGenerationLoader from '../components/trip/AiGenerationLoader';

const quickInspirations = [
  { label: '🇯🇵 7 Days in Kyoto & Tokyo for cherry blossoms & matcha cafes', dest: 'Tokyo & Kyoto, Japan', days: 7, style: 'Cultural', budget: 'Moderate' },
  { label: '🇨🇭 5 Days Swiss Alps scenic mountain trains & alpine hikes', dest: 'Interlaken & Zermatt, Switzerland', days: 5, style: 'Adventure', budget: 'Luxury' },
  { label: '🇮🇹 6 Days Rome & Florence food & art renaissance tour', dest: 'Rome & Florence, Italy', days: 6, style: 'Foodie', budget: 'Moderate' },
  { label: '🏝️ 8 Days Bali waterfalls, wellness retreats & beach cafes', dest: 'Bali, Indonesia', days: 8, style: 'Relaxation', budget: 'Budget' }
];

const styleOptions = [
  { id: 'Cultural', label: 'Cultural & Historic', icon: Landmark },
  { id: 'Adventure', label: 'Nature & Adventure', icon: Mountain },
  { id: 'Foodie', label: 'Culinary & Food', icon: Utensils },
  { id: 'Relaxation', label: 'Relaxation & Wellness', icon: Coffee }
];

export default function CreateTrip() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useModal();

  const [prompt, setPrompt] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetLevel, setBudgetLevel] = useState('Moderate');
  const [companions, setCompanions] = useState('Solo');
  const [travelStyle, setTravelStyle] = useState('Cultural');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Auto-fill from navigation state (e.g. from Gallery, Hero, or AI Chat)
  useEffect(() => {
    const st = location.state;
    if (st) {
      if (st.initialPrompt) {
        setPrompt(st.initialPrompt);
        handlePromptExtraction(st.initialPrompt);
      }
      if (st.destination || st.galleryTitle) {
        setDestination(st.destination || st.galleryTitle);
      }
      if (st.galleryCategory) {
        setInterests(st.galleryCategory);
      }
      if (st.durationDays) {
        setDurationDays(st.durationDays);
      }
    }
  }, [location.state]);

  // Set default start date to 14 days in future
  useEffect(() => {
    if (!startDate) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setStartDate(d.toISOString().split('T')[0]);
    }
  }, []);

  // Natural Language Prompt Parser
  const handlePromptExtraction = (text) => {
    if (!text) return;
    const t = text.toLowerCase();

    // Extract days
    const matchDays = t.match(/(\d+)\s*(?:days?|day)/i);
    if (matchDays && matchDays[1]) {
      const num = parseInt(matchDays[1], 10);
      if (num >= 1 && num <= 14) setDurationDays(num);
    }

    // Extract destinations
    if (t.includes('kyoto') || t.includes('tokyo') || t.includes('japan')) setDestination('Tokyo & Kyoto, Japan');
    else if (t.includes('swiss') || t.includes('switzerland') || t.includes('alps')) setDestination('Interlaken & Zermatt, Switzerland');
    else if (t.includes('rome') || t.includes('florence') || t.includes('italy')) setDestination('Rome & Florence, Italy');
    else if (t.includes('paris') || t.includes('france')) setDestination('Paris, France');
    else if (t.includes('bali') || t.includes('indonesia')) setDestination('Bali, Indonesia');
    else if (t.includes('dubai') || t.includes('uae')) setDestination('Dubai, UAE');
    else if (t.includes('london') || t.includes('uk')) setDestination('London, United Kingdom');

    // Extract style
    if (t.includes('food') || t.includes('culinary') || t.includes('eat')) setTravelStyle('Foodie');
    else if (t.includes('hike') || t.includes('mountain') || t.includes('adventure')) setTravelStyle('Adventure');
    else if (t.includes('relax') || t.includes('wellness') || t.includes('beach')) setTravelStyle('Relaxation');
    else if (t.includes('temple') || t.includes('history') || t.includes('culture')) setTravelStyle('Cultural');

    // Extract budget
    if (t.includes('luxury') || t.includes('5 star')) setBudgetLevel('Luxury');
    else if (t.includes('budget') || t.includes('cheap') || t.includes('backpack')) setBudgetLevel('Budget');

    // Extract companions
    if (t.includes('couple') || t.includes('romantic') || t.includes('honeymoon')) setCompanions('Couple');
    else if (t.includes('family') || t.includes('kids')) setCompanions('Family');
    else if (t.includes('friends') || t.includes('group')) setCompanions('Friends');
  };

  const handleApplyQuickInspiration = (item) => {
    setPrompt(item.label);
    setDestination(item.dest);
    setDurationDays(item.days);
    setTravelStyle(item.style);
    setBudgetLevel(item.budget);
    showToast(`Loaded "${item.dest}" inspiration template!`, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      showToast('Please specify a destination or city', 'warning');
      return;
    }

    setLoading(true);
    try {
      const start = new Date(startDate || new Date());
      const end = new Date(start);
      end.setDate(end.getDate() + Number(durationDays));

      const payload = {
        destination: destination.trim(),
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        durationDays: Number(durationDays),
        budgetLevel,
        travelStyle,
        companions,
        interests: prompt ? `${prompt} • ${interests}` : (interests || 'Sightseeing, local gastronomy, and cultural highlights'),
        currency: user?.preferences?.currency || 'USD'
      };

      const res = await generateItineraryWithAi(payload);

      if (res.data) {
        if (user) {
          try {
            const saved = await saveTrip(res.data);
            showToast('Itinerary crafted with Gemini AI and saved to your library!', 'success');
            navigate(`/trips/${saved.data._id}`);
            return;
          } catch {
            navigate('/itinerary/preview', { state: { itinerary: res.data } });
            return;
          }
        }
        showToast('Itinerary crafted with Gemini AI!', 'success');
        navigate('/itinerary/preview', { state: { itinerary: res.data } });
      }
    } catch {
      showToast('Failed to generate itinerary. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isDestinationValid = destination.trim().length >= 2;
  const isDurationValid = durationDays >= 1 && durationDays <= 14;

  return (
    <div className="w-full min-h-screen bg-background text-foreground py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {loading && <AiGenerationLoader destination={destination || 'Your Destination'} days={durationDays} />}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Title & Intro Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121215] border border-border/80 relative overflow-hidden shadow-xl space-y-3">
          <div className="absolute -top-24 -right-24 size-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1.5 shadow-xs">
              <Sparkles className="size-3" />
              <span>Google Gemini AI Maestro</span>
            </span>
            <span className="text-xs text-muted-foreground">• Custom Itinerary Architect</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Craft Your Dream Itinerary
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Tell our AI where you're heading and your travel style. We'll generate a personalized, day-by-day roadmap with activities, locations, weather, and budget metrics.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#121215] border border-border/80 space-y-6 shadow-xl">
          {/* Natural Language Prompt Area */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wand2 className="size-4 text-orange-400" />
                <span>Describe Your Journey in Natural Language (Optional)</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">AI Auto-Extracts Settings</span>
            </label>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  handlePromptExtraction(e.target.value);
                }}
                placeholder="e.g. 7 days in Kyoto & Tokyo for autumn leaves, matcha tasting, scenic shrines, and avoid crowded spots with moderate budget..."
                className="w-full p-4 rounded-2xl bg-[#18181b] border border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/60 transition-colors h-24 resize-none leading-relaxed"
              />
            </div>

            {/* Quick Inspiration Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-muted-foreground">Quick Inspirations:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {quickInspirations.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyQuickInspiration(item)}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#18181b] hover:bg-[#202026] text-zinc-300 hover:text-white border border-border/70 whitespace-nowrap cursor-pointer transition-colors shrink-0"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 pt-4" />

          {/* Section 2: Structured Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Destination */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-orange-400" />
                  <span>Destination City & Country</span>
                </label>
                {isDestinationValid && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="size-3" /> Ready
                  </span>
                )}
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Tokyo & Kyoto, Japan"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181b] border border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/60 transition-colors"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-orange-400" />
                <span>Trip Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181b] border border-border/80 text-xs sm:text-sm text-foreground focus:outline-none focus:border-orange-500/60 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Duration, Budget, Companions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Duration Days */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-orange-400" />
                  <span>Duration ({durationDays} Days)</span>
                </label>
                <span className="text-[10px] text-muted-foreground font-mono">1 - 14 Days</span>
              </div>
              <input
                type="number"
                min="1"
                max="14"
                value={durationDays}
                onChange={(e) => setDurationDays(Math.min(14, Math.max(1, Number(e.target.value))))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181b] border border-border/80 text-xs sm:text-sm text-foreground focus:outline-none focus:border-orange-500/60 transition-colors"
              />
            </div>

            {/* Budget Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <DollarSign className="size-3.5 text-emerald-400" />
                <span>Budget Tier</span>
              </label>
              <select
                value={budgetLevel}
                onChange={(e) => setBudgetLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181b] border border-border/80 text-xs sm:text-sm text-foreground focus:outline-none focus:border-orange-500/60 cursor-pointer"
              >
                <option value="Budget">Budget Friendly ($)</option>
                <option value="Moderate">Moderate / Balanced ($$)</option>
                <option value="Luxury">Luxury & VIP ($$$)</option>
              </select>
            </div>

            {/* Companions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-purple-400" />
                <span>Travel Companions</span>
              </label>
              <select
                value={companions}
                onChange={(e) => setCompanions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#18181b] border border-border/80 text-xs sm:text-sm text-foreground focus:outline-none focus:border-orange-500/60 cursor-pointer"
              >
                <option value="Solo">Solo Traveler</option>
                <option value="Couple">Couple / Romantic</option>
                <option value="Family">Family with Kids</option>
                <option value="Friends">Friends Group</option>
              </select>
            </div>
          </div>

          {/* Travel Style Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Compass className="size-3.5 text-orange-400" />
              <span>Preferred Travel Style</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {styleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = travelStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTravelStyle(opt.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                        : 'bg-[#18181b] text-muted-foreground hover:text-foreground border-border/80'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Interests / Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Tag className="size-3.5 text-orange-400" />
              <span>Specific Interests & Must-See Sights</span>
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Bamboo Forest, Street Ramen, Modern Art Museums, Scenic Trains"
              className="w-full px-4 py-2.5 rounded-xl bg-[#18181b] border border-border/80 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/60 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <GlowingButton
            type="submit"
            disabled={loading || !destination.trim()}
            className="w-full cursor-pointer"
            innerClassName="py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
          >
            <Sparkles className="size-4" />
            <span>Generate Itinerary with Gemini AI</span>
            <ArrowRight className="size-4" />
          </GlowingButton>
        </form>
      </div>
    </div>
  );
}

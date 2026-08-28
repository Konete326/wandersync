import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, DollarSign, Users, Tag, Clock, Wand2, ArrowRight, Check } from 'lucide-react';
import { generateItineraryWithAi, saveTrip } from '../services/tripService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import GlowingButton from '../components/common/GlowingButton';
import AiGenerationLoader from '../components/trip/AiGenerationLoader';

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

  const isDestinationValid = !destination || destination.trim().length >= 2;
  const isDurationValid = durationDays >= 1 && durationDays <= 14;

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
    } else if (lower.includes('friend') || lower.includes('group')) {
      setCompanions('Friends');
    } else {
      setCompanions('Solo');
    }

    for (const insp of quickInspirations) {
      if (text.includes('Kyoto')) setDestination('Kyoto, Japan');
      if (text.includes('Swiss Alps')) setDestination('Interlaken & Zermatt, Switzerland');
      if (text.includes('Rome') || text.includes('Florence')) setDestination('Rome & Florence, Italy');
      if (text.includes('Bali')) setDestination('Bali, Indonesia');
    }
  };

  useEffect(() => {
    const st = location.state;
    if (!st) return;

    if (st.destination) {
      setDestination(st.destination);
    }

    // If navigated from Gallery catalog, auto-fill all form fields tailored to this user
    if (st.fromGallery) {
      const cat = (st.galleryCategory || '').toLowerCase();
      const title = st.galleryTitle || '';
      const desc = st.galleryDescription || '';
      const dest = st.destination || title;

      // 1. Sync User Travel Style & Budget Level from user preferences
      const userStyle = (user?.preferences?.travelStyle || 'moderate').toLowerCase();
      setTravelStyle(userStyle);

      if (userStyle === 'budget' || userStyle === 'backpacker') {
        setBudgetLevel('Budget');
      } else if (userStyle === 'luxury') {
        setBudgetLevel('Luxury');
      } else {
        setBudgetLevel('Moderate');
      }

      // 2. Set Start Date to tomorrow by default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStartDate(tomorrow.toISOString().split('T')[0]);

      // 3. Set Duration
      setDurationDays(5);

      // 4. Set Interests tailored to catalog category
      if (cat.includes('adventure') || cat.includes('hiking') || cat.includes('mountain') || cat.includes('outdoor')) {
        setInterests('Adventure, Hiking, Mountain Trekking, Photography');
      } else if (cat.includes('culture') || cat.includes('heritage') || cat.includes('historic') || cat.includes('museum')) {
        setInterests('Culture, Heritage, Historical Landmarks, Traditional Cuisine');
      } else if (cat.includes('beach') || cat.includes('coastal') || cat.includes('island') || cat.includes('resort')) {
        setInterests('Beach, Island Hopping, Water Sports, Seafood & Relaxation');
      } else if (cat.includes('city') || cat.includes('urban') || cat.includes('shopping')) {
        setInterests('City Exploration, Shopping, Architecture, Nightlife & Cafes');
      } else if (cat.includes('wildlife') || cat.includes('safari') || cat.includes('nature') || cat.includes('national park')) {
        setInterests('Wildlife Safari, Nature Walks, Eco-Tourism, Photography');
      } else {
        setInterests('Sightseeing, Cultural Heritage, Local Food, Hidden Gems');
      }

      // 5. Build personalized natural language prompt
      const userHome = user?.preferences?.homeCity || user?.preferences?.homeLocation || user?.preferences?.homeCountry || '';
      const originSnippet = userHome ? ` starting from ${userHome}` : '';
      const autoPrompt = `Plan a 5-day ${userStyle} travel experience to ${dest}${originSnippet}. Must visit: ${title}.${desc ? ` Highlights: ${desc.slice(0, 150)}.` : ''} Focus on authentic local experiences, sightseeing, and great food.`;
      setNaturalPrompt(autoPrompt);
    }
  }, [location.state, user]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleApplyPrompt = (promptText) => {
    setNaturalPrompt(promptText);
    parseNaturalLanguage(promptText);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (cooldown > 0) {
      showToast(`Please wait ${cooldown}s before regenerating`, 'warning');
      return;
    }

    if (!destination && !naturalPrompt) {
      showModal({
        title: 'Destination Required',
        message: 'Please provide either a destination or type your travel vision in natural language.',
        type: 'warning'
      });
      return;
    }

    if (!isDurationValid) {
      showModal({
        title: 'Invalid Duration',
        message: 'Trip duration must be between 1 and 14 days.',
        type: 'warning'
      });
      return;
    }

    const authToken = localStorage.getItem('wandersync_token');
    if (!user || !authToken) {
      showModal({
        title: 'Sign In Required',
        message: 'Please sign in or create a free account to generate and save your AI travel itinerary.',
        type: 'info',
        confirmText: 'Sign In / Register',
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
      const isAuthErr = error.response?.status === 401 || error.message?.includes('token');
      if (isAuthErr) {
        showModal({
          title: 'Session Expired',
          message: 'Your login session has expired. Please sign in to save your itinerary.',
          type: 'warning',
          confirmText: 'Sign In Now',
          onConfirm: () => navigate('/login')
        });
      } else {
        showModal({
          title: 'Generation Failed',
          message: error.response?.data?.message || error.message || 'Failed to generate itinerary. Please try again.',
          type: 'danger'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <AiGenerationLoader
          destination={destination || naturalPrompt || 'Selected Destination'}
          durationDays={durationDays}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground py-8 sm:py-14 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            Natural Language Journey Architect
          </div>
          <h1 className="text-3xl sm:text-5xl font-normal font-['Instrument_Serif'] tracking-tight">
            Design Your Custom Itinerary
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Describe your trip naturally or refine preferences below to generate a tailored day-by-day plan.
          </p>
        </div>

        {/* Gallery Catalog Banner - shown when launched from Gallery */}
        {location.state?.fromGallery && (
          <div className="relative rounded-2xl overflow-hidden border border-orange-500/40 shadow-lg shadow-orange-500/10">
            {location.state?.galleryImageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `url(${location.state.galleryImageUrl})` }}
              />
            )}
            <div className="relative flex items-center gap-4 p-4 bg-gradient-to-r from-orange-500/10 to-transparent">
              {location.state?.galleryImageUrl && (
                <img
                  src={location.state.galleryImageUrl}
                  alt={location.state.galleryTitle}
                  className="size-14 rounded-xl object-cover border border-orange-500/40 shrink-0 shadow-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Wand2 className="size-3.5 text-orange-400 shrink-0" />
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Planning from Gallery Catalog</span>
                </div>
                <p className="text-sm font-bold text-foreground truncate">{location.state.galleryTitle}</p>
                {location.state.galleryDescription && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{location.state.galleryDescription}</p>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                {location.state.galleryCategory && (
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[10px] font-bold">
                    {location.state.galleryCategory}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">AI fields auto-filled ✓</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleGenerate} className="liquid-glass-card rounded-3xl p-5 sm:p-8 border border-border/80 space-y-6 shadow-2xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Wand2 className="size-4 text-orange-400" />
                <span>Natural Language Input (Prompt or Vibes)</span>
              </label>
              {naturalPrompt && (
                <button
                  type="button"
                  onClick={() => parseNaturalLanguage(naturalPrompt)}
                  className="text-[11px] font-semibold text-orange-400 hover:underline cursor-pointer"
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
              className="w-full p-4 rounded-2xl bg-secondary/50 border border-border text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none font-sans"
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="size-3.5 text-orange-400" />
                  <span>Destination / City</span>
                </label>
                {!isDestinationValid && destination ? (
                  <span className="text-[10px] text-rose-400">Min 2 characters</span>
                ) : isDestinationValid && destination ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check className="size-3" /> Valid
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kyoto, Japan"
                  className={`w-full px-4 pr-9 py-2.5 rounded-xl bg-secondary/60 border text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none transition-colors ${
                    !isDestinationValid && destination
                      ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 bg-rose-950/10'
                      : isDestinationValid && destination
                      ? 'border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 bg-emerald-950/10'
                      : 'border-border focus:ring-1 focus:ring-orange-500/50'
                  }`}
                />
                {isDestinationValid && destination && (
                  <Check className="size-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="size-3.5 text-orange-400" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="size-3.5 text-orange-400" />
                  <span>Duration ({durationDays} Days)</span>
                </label>
                {!isDurationValid ? (
                  <span className="text-[10px] text-rose-400">1-14 days</span>
                ) : (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check className="size-3" /> Valid
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className={`w-full px-4 pr-9 py-2.5 rounded-xl bg-secondary/60 border text-sm text-foreground focus:outline-none transition-colors ${
                    !isDurationValid
                      ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 bg-rose-950/10'
                      : 'border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 bg-emerald-950/10'
                  }`}
                />
                {isDurationValid && (
                  <Check className="size-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="size-3.5 text-orange-400" />
                <span>Budget Tier</span>
              </label>
              <select
                value={budgetLevel}
                onChange={(e) => setBudgetLevel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              >
                <option value="Budget" className="bg-card text-foreground">Budget Friendly</option>
                <option value="Moderate" className="bg-card text-foreground">Moderate / Balanced</option>
                <option value="Luxury" className="bg-card text-foreground">Luxury & Comfort</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Users className="size-3.5 text-orange-400" />
                <span>Companions</span>
              </label>
              <select
                value={companions}
                onChange={(e) => setCompanions(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
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
              <Tag className="size-3.5 text-orange-400" />
              <span>Interests & Vibes</span>
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Architecture, Hidden Cafes, Photography, Hiking"
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
          </div>

          <GlowingButton
            type="submit"
            disabled={cooldown > 0}
            className="w-full"
            innerClassName="py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
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
          </GlowingButton>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, DollarSign, Users, Compass, Tag } from 'lucide-react';
import { generateItineraryWithAi, saveTrip } from '../services/tripService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';

const CreateTrip = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showModal, showToast } = useModal();

  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetLevel, setBudgetLevel] = useState('Moderate');
  const [travelStyle, setTravelStyle] = useState('moderate');
  const [companions, setCompanions] = useState('Solo');
  const [interests, setInterests] = useState('Sightseeing, Culture, Food');
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.initialPrompt) {
      setCustomPrompt(location.state.initialPrompt);
      const firstWord = location.state.initialPrompt.split(' ')[0];
      if (!isNaN(firstWord)) {
        setDurationDays(Number(firstWord));
      }
    }
  }, [location.state]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!destination.trim() && !customPrompt.trim()) {
      showModal({
        title: 'Missing Details',
        message: 'Please provide either a destination or a custom travel description to let Gemini generate your plan.',
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
      const promptToUse = destination ? `${durationDays}-day itinerary for ${destination}` : customPrompt;
      const res = await generateItineraryWithAi({
        destination: destination || customPrompt,
        durationDays,
        budgetLevel,
        travelStyle,
        companions,
        interests,
        customPrompt
      });

      const savedTrip = await saveTrip(res.data);
      showToast('Itinerary generated and saved!', 'success');
      navigate(`/trips/${savedTrip.data._id}`);
    } catch (error) {
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader text="Gemini AI is crafting your bespoke travel itinerary..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          AI Journey Architect
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Design Your Custom Itinerary</h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400">Tailor your preferences and let our AI create a bespoke day-by-day plan</p>
      </div>

      <form onSubmit={handleGenerate} className="liquid-glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Where are you traveling?
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Kyoto, Japan or Florence, Italy"
            className="w-full px-4 py-3 rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl glass-input text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              Budget Tier
            </label>
            <select
              value={budgetLevel}
              onChange={(e) => setBudgetLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="Budget">Budget Friendly</option>
              <option value="Moderate">Moderate / Balanced</option>
              <option value="Luxury">Luxury & Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Companions
            </label>
            <select
              value={companions}
              onChange={(e) => setCompanions(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="Solo">Solo Traveler</option>
              <option value="Couple">Couple / Romantic</option>
              <option value="Family">Family with Kids</option>
              <option value="Friends">Friends Group</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-cyan-400" />
            Interests & Preferences
          </label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. Architecture, Seafood, Street Photography, Hiking"
            className="w-full px-4 py-3 rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Special Requests & Custom Prompt (Optional)
          </label>
          <textarea
            rows="3"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Include a relaxing onsen experience on Day 3 and make sure all dinners are vegetarian friendly..."
            className="w-full px-4 py-3 rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>Generate Bespoke Itinerary</span>
        </button>
      </form>
    </div>
  );
};

export default CreateTrip;

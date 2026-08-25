import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, DollarSign, Download, Share2, MessageSquare, Trash2,
  CheckCircle2, Clock, Sparkles, Send, CloudSun, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { getTripDetails, updateTripData, deleteTripById, refineItineraryWithAi } from '../services/tripService';
import { fetchWeatherForecast } from '../services/weatherService';
import { exportItineraryToPdf } from '../services/pdfService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';
import { getCachedData, setCachedData } from '@/utils/realtimeSync';

const ItineraryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showModal, showToast } = useModal();

  const cacheKey = `itinerary_details_${id}`;
  const initialTrip = getCachedData(cacheKey);

  const [trip, setTrip] = useState(initialTrip || null);
  const [loading, setLoading] = useState(!initialTrip);
  const [selectedDay, setSelectedDay] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const loadTrip = async () => {
      if (!initialTrip) setLoading(true);
      try {
        const res = await getTripDetails(id);
        if (res.data) {
          setTrip(res.data);
          setCachedData(cacheKey, res.data);
          if (res.data.destination?.coordinates?.lat) {
            try {
              const wRes = await fetchWeatherForecast(
                res.data.destination.coordinates.lat,
                res.data.destination.coordinates.lng
              );
              setWeather(wRes.data);
            } catch {}
          }
        }
      } catch (error) {
        if (!initialTrip) {
          showModal({
            title: 'Not Found',
            message: 'Itinerary could not be found or you do not have permission to view it.',
            type: 'danger',
            onConfirm: () => navigate('/my-trips')
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadTrip();
  }, [id]);

  const handleDelete = () => {
    showModal({
      title: 'Delete Itinerary',
      message: `Are you sure you want to delete "${trip.title}"? This cannot be undone.`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete Now',
      onConfirm: async () => {
        try {
          await deleteTripById(id);
          showToast('Itinerary deleted', 'info');
          navigate('/my-trips');
        } catch (err) {
          showToast('Failed to delete itinerary', 'error');
        }
      }
    });
  };

  const handleShare = async () => {
    try {
      const updated = await updateTripData(id, { isPublic: true });
      setTrip(updated.data);
      const shareUrl = `${window.location.origin}/share/${updated.data.shareSlug}`;
      await navigator.clipboard.writeText(shareUrl);
      showModal({
        title: 'Share Link Copied',
        message: `Your shareable link has been copied to clipboard:\n${shareUrl}`,
        type: 'success'
      });
    } catch (err) {
      showToast('Failed to generate share link', 'error');
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userMsg = chatMessage.trim();
    setChatMessage('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await refineItineraryWithAi(trip, userMsg);
      const aiReply = res.data?.reply || 'Changes applied.';
      setChatHistory((prev) => [...prev, { sender: 'ai', text: aiReply }]);

      if (res.data?.updatedItinerary) {
        const updated = await updateTripData(id, res.data.updatedItinerary);
        setTrip(updated.data);
        showToast('Itinerary updated by AI!', 'success');
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error modifying the plan.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader text="Loading your itinerary details..." />
      </div>
    );
  }

  if (!trip) return null;

  const currentDayData = trip.days?.find((d) => d.dayNumber === selectedDay) || trip.days?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            {trip.durationDays} Days • {trip.budgetLevel} Tier
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{trip.title}</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl">{trip.overview}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              {trip.destination?.city}, {trip.destination?.country}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Est. Total: ${trip.estimatedTotalCost || 0} {trip.currency}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportItineraryToPdf(trip)}
            className="px-4 py-2.5 rounded-xl liquid-glass border border-slate-700 hover:border-cyan-500/40 text-slate-200 hover:text-white text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            PDF Export
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2.5 rounded-xl liquid-glass border border-slate-700 hover:border-cyan-500/40 text-slate-200 hover:text-white text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            Share Link
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <MessageSquare className="w-4 h-4" />
            Refine with AI
          </button>
          {user && trip.user === user._id && (
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl liquid-glass border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {trip.days?.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`px-5 py-3 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all cursor-pointer ${
                  selectedDay === day.dayNumber
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border-cyan-400/50'
                    : 'liquid-glass text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-800'
                } border`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {currentDayData && (
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Day {currentDayData.dayNumber}: {currentDayData.title}</h2>
                {currentDayData.theme && (
                  <p className="text-xs sm:text-sm text-cyan-400 font-medium mt-1">Theme: {currentDayData.theme}</p>
                )}
              </div>

              <div className="space-y-4">
                {currentDayData.activities?.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl liquid-glass border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {act.timeSlot}
                        </span>
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {act.durationHours} hrs
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400">
                        ${act.estimatedCost || 0}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white">{act.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{act.description}</p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{act.locationName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {weather?.daily && (
            <div className="liquid-glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-base">
                <CloudSun className="w-5 h-5 text-amber-400" />
                <span>Destination Forecast</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-xs text-slate-400">Max Temp</p>
                  <p className="text-lg font-bold text-white">{weather.daily.temperature_2m_max[0]}°C</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-xs text-slate-400">Min Temp</p>
                  <p className="text-lg font-bold text-white">{weather.daily.temperature_2m_min[0]}°C</p>
                </div>
              </div>
            </div>
          )}

          {trip.travelTips && (
            <div className="liquid-glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold text-base">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>Maestro Travel Tips</span>
              </div>

              {trip.travelTips.packing?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Packing Checklist</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    {trip.travelTips.packing.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {trip.travelTips.transitAdvice?.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Transit Advice</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    {trip.travelTips.transitAdvice.map((t, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {chatOpen && (
            <div className="liquid-glass-card rounded-3xl p-6 border border-cyan-500/40 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI Plan Refinement</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="h-48 overflow-y-auto space-y-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs custom-scrollbar">
                {chatHistory.length === 0 ? (
                  <p className="text-slate-500 italic p-2">Ask Gemini to swap activities, make Day 2 more relaxed, or adjust budgets...</p>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl ${
                        msg.sender === 'user' ? 'bg-cyan-600/30 text-white ml-6 border border-cyan-500/30' : 'bg-slate-850 text-slate-200 mr-6 border border-slate-700'
                      }`}
                    >
                      <p className="font-semibold text-[10px] uppercase text-cyan-300 mb-0.5">{msg.sender === 'user' ? 'You' : 'Maestro AI'}</p>
                      <p>{msg.text}</p>
                    </div>
                  ))
                )}
                {chatLoading && <p className="text-cyan-400 text-xs italic animate-pulse">Maestro is updating your plan...</p>}
              </div>

              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="e.g. Add a sushi spot to Day 2..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl glass-input text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryDetails;

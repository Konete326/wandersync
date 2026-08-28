import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Calendar, MapPin, DollarSign, Download, Share2, MessageSquare, Trash2,
  CheckCircle2, Clock, Sparkles, Send, CloudSun, ShieldCheck,
  Users, UserPlus, BrainCircuit, X, UserCheck, Plane, Building, Car,
  ArrowRight, Utensils, Compass, Sun, Sunset, Moon, Coffee, ChevronRight,
  TrendingUp, Check, AlertCircle
} from 'lucide-react';
import {
  getTripDetails, updateTripData, deleteTripById, refineItineraryWithAi,
  addCollaboratorToTrip, removeCollaboratorFromTrip, saveTrip
} from '../services/tripService';
import { fetchWeatherForecast } from '../services/weatherService';
import { exportItineraryToPdf } from '../services/pdfService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';
import { getCachedData, setCachedData, subscribeRealtimeUpdate, broadcastRealtimeUpdate } from '@/utils/realtimeSync';
import { getCountryFlag } from '@/utils/worldCountriesData';
import { getDestinationCoverImage } from '@/utils/destinationImages';

import TripLogisticsSummary from '../components/trip/TripLogisticsSummary';
import TripFlightSelector from '../components/trip/TripFlightSelector';
import TripHotelSelector from '../components/trip/TripHotelSelector';
import TripVehicleCabSelector from '../components/trip/TripVehicleCabSelector';

const getTimeSlotDetails = (slot) => {
  const s = (slot || '').toLowerCase();
  if (s.includes('morning')) return { icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
  if (s.includes('afternoon')) return { icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
  if (s.includes('evening')) return { icon: Sunset, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
  return { icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
};

export default function ItineraryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showModal, showToast } = useModal();

  const cacheKey = `itinerary_details_${id}`;
  const initialTrip = location.state?.itinerary || getCachedData(cacheKey);

  const [trip, setTrip] = useState(initialTrip || null);
  const [loading, setLoading] = useState(!initialTrip && id !== 'preview');
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [collabEmail, setCollabEmail] = useState('');
  const [collabRole, setCollabRole] = useState('editor');
  const [collabLoading, setCollabLoading] = useState(false);

  useEffect(() => {
    const loadTrip = async () => {
      if (location.state?.itinerary) {
        setTrip(location.state.itinerary);
        setLoading(false);
        const coords = location.state.itinerary.destination?.coordinates;
        if (coords?.lat) {
          try {
            const wRes = await fetchWeatherForecast(coords.lat, coords.lng);
            setWeather(wRes.data);
          } catch {}
        }
        return;
      }

      if (id === 'preview') {
        setLoading(false);
        return;
      }

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
      } catch {
        if (!initialTrip) {
          showModal({
            title: 'Itinerary Not Found',
            message: 'This itinerary does not exist or you do not have permission to view it.',
            type: 'danger',
            onConfirm: () => navigate('/my-trips')
          });
        }
      } finally {
        setLoading(false);
      }
    };
    loadTrip();
  }, [id, location.state]);

  useEffect(() => {
    if (!id || id === 'preview') return;
    const unsubscribe = subscribeRealtimeUpdate('trips', async () => {
      try {
        const res = await getTripDetails(id);
        if (res.data) {
          setTrip(res.data);
          setCachedData(cacheKey, res.data);
        }
      } catch {}
    });
    return () => unsubscribe();
  }, [id]);

  const handleDelete = () => {
    showModal({
      title: 'Delete Itinerary',
      message: `Are you sure you want to permanently delete "${trip.title}"?`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete Now',
      onConfirm: async () => {
        try {
          await deleteTripById(id);
          showToast('Itinerary removed', 'info');
          navigate('/my-trips');
        } catch {
          showToast('Failed to delete itinerary', 'error');
        }
      }
    });
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportItineraryToPdf(trip);
      showToast('Itinerary PDF generated successfully!', 'success');
    } catch {
      showToast('Failed to generate PDF', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleShare = async () => {
    try {
      if (id && id !== 'preview') {
        const updated = await updateTripData(id, { isPublic: true });
        setTrip(updated.data);
        setCachedData(cacheKey, updated.data);
      }
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      showToast('Itinerary link copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy share link', 'error');
    }
  };

  const handleSelectFlight = async (flightId) => {
    if (!id || id === 'preview') return;
    setServiceLoading(true);
    try {
      const res = await updateTripData(id, { selectedFlight: flightId });
      setTrip(res.data);
      setCachedData(cacheKey, res.data);
      showToast(flightId ? 'Flight linked to itinerary!' : 'Flight removed', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update flight', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleSelectHotel = async (hotelId) => {
    if (!id || id === 'preview') return;
    setServiceLoading(true);
    try {
      const res = await updateTripData(id, { selectedHotel: hotelId });
      setTrip(res.data);
      setCachedData(cacheKey, res.data);
      showToast(hotelId ? 'Hotel reserved for itinerary!' : 'Hotel removed', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update hotel', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleSelectVehicle = async (vehicleId) => {
    if (!id || id === 'preview') return;
    setServiceLoading(true);
    try {
      const res = await updateTripData(id, {
        selectedVehicle: vehicleId,
        selectedCabService: { pickupLocation: '', dropoffLocation: '', cabType: 'Standard Sedan', estimatedFare: 0 }
      });
      setTrip(res.data);
      setCachedData(cacheKey, res.data);
      showToast(vehicleId ? 'Vehicle linked to itinerary!' : 'Vehicle removed', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update vehicle', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleBookCab = async (cabData) => {
    if (!id || id === 'preview') return;
    setServiceLoading(true);
    try {
      const res = await updateTripData(id, {
        selectedCabService: cabData,
        selectedVehicle: null
      });
      setTrip(res.data);
      setCachedData(cacheKey, res.data);
      showToast('Cab transfer booked for your trip!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to book cab', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleRequestBooking = async (bookingData) => {
    if (!id || id === 'preview') return;
    setServiceLoading(true);
    try {
      const res = await updateTripData(id, { bookingRequest: bookingData });
      setTrip(res.data);
      setCachedData(cacheKey, res.data);
      broadcastRealtimeUpdate('trips');
      showToast('Booking request sent to Admin successfully! Status is now Pending.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit booking request', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleRequestCancellation = async ({ itemType, reason }) => {
    if (!id || id === 'preview') return;
    setServiceLoading(true);
    try {
      const res = await updateTripData(id, {
        bookingRequest: {
          ...trip.bookingRequest,
          cancellationRequest: {
            isPending: true,
            itemType,
            reason,
            requestedAt: new Date()
          }
        }
      });
      setTrip(res.data);
      setCachedData(cacheKey, res.data);
      broadcastRealtimeUpdate('trips');
      showToast('Cancellation request submitted to Admin!', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit cancellation', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleRemoveService = async (type) => {
    if (!id || id === 'preview') return;
    setServiceLoading(true);
    try {
      let payload = {};
      if (type === 'flight') payload = { selectedFlight: null };
      if (type === 'hotel') payload = { selectedHotel: null };
      if (type === 'vehicle') payload = { selectedVehicle: null };
      if (type === 'cab') payload = { selectedCabService: { pickupLocation: '', dropoffLocation: '', cabType: 'Standard Sedan', estimatedFare: 0 } };

      const res = await updateTripData(id, payload);
      setTrip(res.data);
      setCachedData(cacheKey, res.data);
      showToast(`Selected ${type} removed from itinerary`, 'info');
    } catch {
      showToast('Failed to update trip services', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!collabEmail.trim() || collabLoading || !id || id === 'preview') return;
    setCollabLoading(true);
    try {
      const res = await addCollaboratorToTrip(id, collabEmail.trim(), collabRole);
      setTrip((prev) => ({ ...prev, collaborators: res.data }));
      setCollabEmail('');
      showToast('Collaborator added successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add collaborator', 'error');
    } finally {
      setCollabLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collabId) => {
    if (!id || id === 'preview') return;
    try {
      const res = await removeCollaboratorFromTrip(id, collabId);
      setTrip((prev) => ({ ...prev, collaborators: res.data }));
      showToast('Collaborator removed', 'info');
    } catch {
      showToast('Failed to remove collaborator', 'error');
    }
  };

  const handleChatSubmit = async (e) => {
    e?.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userMsg = chatMessage.trim();
    setChatMessage('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await refineItineraryWithAi(trip, userMsg);
      const aiReply = res.data?.reply || 'Itinerary refined based on your instructions.';
      setChatHistory((prev) => [...prev, { sender: 'ai', text: aiReply }]);

      if (res.data?.updatedItinerary) {
        if (id && id !== 'preview') {
          const updated = await updateTripData(id, res.data.updatedItinerary);
          setTrip(updated.data);
        } else {
          setTrip(res.data.updatedItinerary);
        }
        showToast('Itinerary updated by AI Maestro!', 'success');
      }
    } catch {
      setChatHistory((prev) => [...prev, { sender: 'ai', text: 'Encountered an issue applying changes. Please try a simpler refinement command.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Expense breakdown calculation
  const expenseBreakdown = useMemo(() => {
    if (!trip?.days) return { activities: 0, total: 0, categories: {} };
    let actCost = 0;
    const cats = {};

    trip.days.forEach((d) => {
      d.activities?.forEach((a) => {
        const c = Number(a.estimatedCost) || 0;
        actCost += c;
        const catName = a.category || 'Sightseeing';
        cats[catName] = (cats[catName] || 0) + c;
      });
    });

    return {
      activities: actCost,
      total: trip.estimatedTotalCost || actCost,
      categories: cats
    };
  }, [trip]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <Loader text="Loading your AI travel itinerary..." />
      </div>
    );
  }

  if (!trip) return null;

  const currentDayData = trip.days?.find((d) => d.dayNumber === selectedDay) || trip.days?.[0];
  const isOwner = user && (trip.user === user._id || trip.user?._id === user._id || !trip.user);
  const bannerImg = getDestinationCoverImage(trip);
  const flag = getCountryFlag(trip.destination?.country);
  const totalDays = trip.durationDays || trip.days?.length || 3;
  const cost = trip.estimatedTotalCost || expenseBreakdown.total || 0;
  const currency = trip.currency || 'USD';

  return (
    <div className="w-full min-h-screen bg-background text-foreground py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Destination Hero Banner */}
        <div className="rounded-3xl border border-border/80 overflow-hidden shadow-2xl bg-[#121215] relative">
          <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-secondary">
            <img
              src={bannerImg}
              alt={trip.title}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/60 to-black/30" />

            {/* Top Floating Badges */}
            <div className="absolute inset-x-4 sm:inset-x-8 top-4 flex items-center justify-between pointer-events-none flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md text-white border border-white/20 text-xs font-bold flex items-center gap-2 shadow-lg">
                  {flag && <span className="text-base leading-none">{flag}</span>}
                  <span>{trip.destination?.city ? `${trip.destination.city}, ${trip.destination.country}` : (trip.destination?.country || 'Global Destination')}</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-orange-500/90 text-white text-xs font-black shadow-md">
                  {totalDays} Days Itinerary
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-emerald-500/90 text-zinc-950 text-xs font-black shadow-md">
                  ${cost.toLocaleString()} {currency} Total Budget
                </span>
              </div>
            </div>

            {/* Bottom Hero Title & Metadata */}
            <div className="absolute inset-x-4 sm:inset-x-8 bottom-6 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-1">
                  <Sparkles className="size-3" />
                  <span>Google Gemini AI Maestro</span>
                </span>
                {trip.budgetLevel && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary/80 text-foreground border border-border/80">
                    {trip.budgetLevel} Travel Style
                  </span>
                )}
                {trip.startDate && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/80 text-muted-foreground border border-border/80 flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>{trip.startDate} {trip.endDate ? `to ${trip.endDate}` : ''}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                {trip.title}
              </h1>
            </div>
          </div>

          {/* Action Toolbar Header */}
          <div className="p-4 sm:p-6 bg-[#121215] border-t border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {trip.overview || 'AI-crafted personalized itinerary with day-by-day activities, flight & stay management, and real-time weather.'}
            </p>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* PDF Export */}
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-2 rounded-xl bg-[#18181b] hover:bg-[#202025] border border-border/80 text-foreground text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Download className="size-3.5 text-cyan-400" />
                <span>{isExportingPdf ? 'Exporting...' : 'PDF Export'}</span>
              </button>

              {/* Refine with AI */}
              <button
                type="button"
                onClick={() => setChatOpen((prev) => !prev)}
                className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <Sparkles className="size-3.5" />
                <span>Refine with AI</span>
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl bg-[#18181b] hover:bg-[#202025] border border-border/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Share Itinerary Link"
              >
                <Share2 className="size-4 text-emerald-400" />
              </button>

              {/* Delete */}
              {isOwner && id && id !== 'preview' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                  title="Delete Itinerary"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Logistics Summary (Flights/Hotels/Cabs Attached) */}
        <TripLogisticsSummary
          trip={trip}
          onSelectTab={setActiveTab}
          onRemoveService={handleRemoveService}
          onRequestBooking={handleRequestBooking}
          onRequestCancellation={handleRequestCancellation}
          isRequesting={serviceLoading}
        />

        {/* Modern Tab Bar */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-2.5 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('itinerary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'itinerary'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#121215] text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            <Calendar className="size-3.5" />
            <span>Day-by-Day Plan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'weather'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#121215] text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            <CloudSun className="size-3.5 text-amber-400" />
            <span>Weather Forecast</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'expenses'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#121215] text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            <DollarSign className="size-3.5 text-emerald-400" />
            <span>Budget & Expenses</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flights')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'flights'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#121215] text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            <Plane className="size-3.5 text-cyan-400" />
            <span>Flights</span>
            {trip.selectedFlight && <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hotels')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'hotels'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#121215] text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            <Building className="size-3.5 text-amber-400" />
            <span>Hotels & Stays</span>
            {trip.selectedHotel && <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transport')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'transport'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#121215] text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            <Car className="size-3.5 text-emerald-400" />
            <span>Cabs & Rentals</span>
            {(trip.selectedVehicle || trip.selectedCabService?.pickupLocation) && (
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('collaborators')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'collaborators'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-[#121215] text-muted-foreground hover:text-foreground border border-border/70'
            }`}
          >
            <Users className="size-3.5 text-purple-400" />
            <span>Co-Creators ({trip.collaborators?.length || 0})</span>
          </button>
        </div>

        {/* TAB: DAY-BY-DAY ITINERARY */}
        {activeTab === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Days & Activity Feed */}
            <div className="lg:col-span-2 space-y-4">
              {/* Day Selector Horizontal Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
                {trip.days?.map((day) => {
                  const isSelected = selectedDay === day.dayNumber;
                  return (
                    <button
                      key={day.dayNumber}
                      type="button"
                      onClick={() => setSelectedDay(day.dayNumber)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 border border-orange-400'
                          : 'bg-[#121215] text-muted-foreground hover:text-foreground border border-border/70'
                      }`}
                    >
                      <span>Day {day.dayNumber}</span>
                      {day.theme && (
                        <span className={`text-[10px] font-normal truncate max-w-[120px] ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                          • {day.theme}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Card */}
              {currentDayData && (
                <div className="rounded-3xl bg-[#121215] border border-border/80 p-5 sm:p-7 space-y-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/70">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 text-xs font-black border border-orange-500/30">
                          Day {currentDayData.dayNumber}
                        </span>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">
                          {currentDayData.title}
                        </h2>
                      </div>
                      {currentDayData.theme && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Theme: <span className="text-foreground font-semibold">{currentDayData.theme}</span>
                        </p>
                      )}
                    </div>

                    <span className="text-xs text-muted-foreground font-mono">
                      {currentDayData.activities?.length || 0} Curated Stops
                    </span>
                  </div>

                  {/* Activity Timeline List */}
                  <div className="space-y-3.5">
                    {currentDayData.activities?.map((act, idx) => {
                      const slotMeta = getTimeSlotDetails(act.timeSlot);
                      const SlotIcon = slotMeta.icon;

                      return (
                        <div
                          key={idx}
                          className="p-4 sm:p-5 rounded-2xl bg-[#18181b] border border-border/80 hover:border-orange-500/40 transition-all space-y-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${slotMeta.bg} ${slotMeta.color}`}>
                                <SlotIcon className="size-3.5" />
                                <span>{act.timeSlot}</span>
                              </span>
                              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                <Clock className="size-3 text-muted-foreground" />
                                <span>{act.durationHours} hrs</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {act.category && (
                                <span className="px-2 py-0.5 rounded-md bg-secondary/80 text-[10px] font-semibold text-zinc-300 border border-border/60">
                                  {act.category}
                                </span>
                              )}
                              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                ${act.estimatedCost || 0} {currency}
                              </span>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-foreground">
                              {act.title}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                              {act.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="size-3.5 text-orange-400 shrink-0" />
                              <span className="truncate">{act.locationName}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Col: Highlights & Travel Tips */}
            <div className="space-y-4">
              {/* Highlights & Overview */}
              {trip.highlights?.length > 0 && (
                <div className="p-5 rounded-3xl bg-[#121215] border border-border/80 space-y-3 shadow-md">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <Sparkles className="size-4 text-orange-400" />
                    <span>Journey Highlights</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-2">
                    {trip.highlights.map((hl, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 text-orange-400 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weather Quick Widget */}
              {weather?.daily && (
                <div className="p-5 rounded-3xl bg-[#121215] border border-border/80 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                      <CloudSun className="size-4 text-amber-400" />
                      <span>Destination Climate</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('weather')}
                      className="text-[11px] font-bold text-orange-400 hover:underline cursor-pointer"
                    >
                      View Full
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-2xl bg-[#18181b] border border-border/70">
                      <p className="text-[10px] text-muted-foreground">Max Temp</p>
                      <p className="text-base font-black text-foreground">{weather.daily.temperature_2m_max[0]}°C</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#18181b] border border-border/70">
                      <p className="text-[10px] text-muted-foreground">Min Temp</p>
                      <p className="text-base font-black text-foreground">{weather.daily.temperature_2m_min[0]}°C</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Travel Packing & Advice */}
              {trip.travelTips && (
                <div className="p-5 rounded-3xl bg-[#121215] border border-border/80 space-y-3 shadow-md">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                    <ShieldCheck className="size-4 text-cyan-400" />
                    <span>Traveler Tips & Advice</span>
                  </div>

                  {trip.travelTips.packing?.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Packing Checklist
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1.5">
                        {trip.travelTips.packing.map((p, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="size-3 text-cyan-400 shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {trip.travelTips.localEtiquette?.length > 0 && (
                    <div className="pt-2 border-t border-border/60">
                      <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Local Etiquette
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1.5">
                        {trip.travelTips.localEtiquette.map((e, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="size-1.5 rounded-full bg-orange-400 shrink-0 mt-1.5" />
                            <span>{e}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: WEATHER FORECAST */}
        {activeTab === 'weather' && (
          <div className="p-6 rounded-3xl bg-[#121215] border border-border/80 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CloudSun className="size-5 text-amber-400" />
                  <span>Weather Forecast for {trip.destination?.city || trip.destination?.country}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Live 7-day meteorological forecast to help optimize your daily activities.</p>
              </div>
            </div>

            {weather?.daily ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {weather.daily.time?.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#18181b] border border-border/80 text-center space-y-2 shadow-xs">
                    <span className="text-xs font-bold text-muted-foreground">{t}</span>
                    <CloudSun className="size-6 text-amber-400 mx-auto" />
                    <div>
                      <span className="text-base font-black text-foreground">{weather.daily.temperature_2m_max[idx]}°</span>
                      <span className="text-xs text-muted-foreground ml-1">/ {weather.daily.temperature_2m_min[idx]}°</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-muted-foreground text-xs">
                Weather forecast data currently updating for these coordinates.
              </div>
            )}
          </div>
        )}

        {/* TAB: BUDGET & EXPENSES BREAKDOWN */}
        {activeTab === 'expenses' && (
          <div className="p-6 rounded-3xl bg-[#121215] border border-border/80 space-y-6 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <DollarSign className="size-5 text-emerald-400" />
                  <span>Estimated Trip Budget & Expense Breakdown</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Calculated based on your chosen {trip.budgetLevel || 'Moderate'} travel style.</p>
              </div>

              <div className="p-3 px-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-right">
                <span className="text-xl font-black text-emerald-400">${cost.toLocaleString()} {currency}</span>
                <p className="text-[10px] text-muted-foreground">Estimated Total</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#18181b] border border-border/80 space-y-2">
                <span className="text-xs font-bold text-muted-foreground">Daily Average</span>
                <p className="text-xl font-black text-foreground">${Math.round(cost / totalDays)} <span className="text-xs font-normal text-muted-foreground">/ day</span></p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18181b] border border-border/80 space-y-2">
                <span className="text-xs font-bold text-muted-foreground">Total Planned Activities</span>
                <p className="text-xl font-black text-foreground">${expenseBreakdown.activities.toLocaleString()}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18181b] border border-border/80 space-y-2">
                <span className="text-xs font-bold text-muted-foreground">Per Person Tier</span>
                <p className="text-xl font-black text-foreground">{trip.budgetLevel || 'Moderate'} Style</p>
              </div>
            </div>

            {Object.keys(expenseBreakdown.categories).length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Activity Category Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(expenseBreakdown.categories).map(([cat, val], i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-border/70 text-xs">
                      <span className="font-bold text-foreground">{cat}</span>
                      <span className="font-mono font-bold text-emerald-400">${val} {currency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: FLIGHTS */}
        {activeTab === 'flights' && (
          <TripFlightSelector
            trip={trip}
            onSelectFlight={handleSelectFlight}
            selectedFlightId={trip.selectedFlight?._id}
            isSelecting={serviceLoading}
          />
        )}

        {/* TAB: HOTELS */}
        {activeTab === 'hotels' && (
          <TripHotelSelector
            trip={trip}
            onSelectHotel={handleSelectHotel}
            selectedHotelId={trip.selectedHotel?._id}
            isSelecting={serviceLoading}
          />
        )}

        {/* TAB: CABS & VEHICLES */}
        {activeTab === 'transport' && (
          <TripVehicleCabSelector
            trip={trip}
            onSelectVehicle={handleSelectVehicle}
            selectedVehicleId={trip.selectedVehicle?._id}
            isSelecting={serviceLoading}
            onBookCab={handleBookCab}
            selectedCab={trip.selectedCabService}
          />
        )}

        {/* TAB: COLLABORATORS */}
        {activeTab === 'collaborators' && (
          <div className="p-6 rounded-3xl bg-[#121215] border border-border/80 space-y-6 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Users className="size-5 text-purple-400" />
                  <span>Trip Co-Creators & Travel Buddies</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Invite companions to co-edit or view this itinerary in real-time.</p>
              </div>

              <form onSubmit={handleAddCollaborator} className="flex items-center gap-2">
                <input
                  type="email"
                  value={collabEmail}
                  onChange={(e) => setCollabEmail(e.target.value)}
                  placeholder="companion@email.com"
                  className="px-3 py-2 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/60"
                />
                <button
                  type="submit"
                  disabled={collabLoading || !collabEmail.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {collabLoading ? 'Inviting...' : 'Add Co-Creator'}
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {trip.collaborators?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs rounded-2xl bg-[#18181b] border border-border/70">
                  No co-creators added yet. Enter an email above to share edit permissions.
                </div>
              ) : (
                trip.collaborators?.map((c) => (
                  <div key={c._id || c.user} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#18181b] border border-border/70 text-xs">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-purple-400" />
                      <span className="font-bold text-foreground">{c.email || c.user?.name || 'Companion'}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {c.role || 'editor'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCollaborator(c._id)}
                      className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* FLOATING AI REFINE CHAT DRAWER */}
        {chatOpen && (
          <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] rounded-3xl bg-[#121215] border border-orange-500/40 shadow-2xl overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-3.5 px-4 bg-[#18181b] border-b border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Sparkles className="size-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">AI Itinerary Refiner</h4>
                  <p className="text-[10px] text-muted-foreground">Powered by Gemini 3.6 Maestro</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-2.5 bg-[#141418] border-b border-border/60 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setChatMessage('Make Day 2 more relaxed with hidden cafes');
                }}
                className="px-2 py-1 rounded-md bg-[#1e1e24] hover:bg-[#282830] text-[10px] font-medium text-zinc-300 border border-border/60 whitespace-nowrap cursor-pointer"
              >
                ☕ More relaxed Day 2
              </button>
              <button
                type="button"
                onClick={() => {
                  setChatMessage('Add more local street food and culinary tours');
                }}
                className="px-2 py-1 rounded-md bg-[#1e1e24] hover:bg-[#282830] text-[10px] font-medium text-zinc-300 border border-border/60 whitespace-nowrap cursor-pointer"
              >
                🍜 More local food
              </button>
              <button
                type="button"
                onClick={() => {
                  setChatMessage('Reduce overall estimated budget by 20%');
                }}
                className="px-2 py-1 rounded-md bg-[#1e1e24] hover:bg-[#282830] text-[10px] font-medium text-zinc-300 border border-border/60 whitespace-nowrap cursor-pointer"
              >
                💰 Cut budget 20%
              </button>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar bg-[#121215]">
              {chatHistory.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <Sparkles className="size-8 text-orange-400/40 mx-auto animate-pulse" />
                  <p className="text-xs text-muted-foreground">
                    Ask Gemini to swap sights, customize day themes, or adjust budget in real-time.
                  </p>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                      msg.sender === 'user'
                        ? 'bg-orange-500 text-white ml-auto rounded-tr-xs shadow-xs'
                        : 'bg-[#18181b] text-foreground mr-auto border border-border/80 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <p className="font-bold text-[9px] uppercase tracking-wider mb-1 opacity-75">
                      {msg.sender === 'user' ? 'You' : 'AI Maestro'}
                    </p>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="p-3 rounded-2xl bg-[#18181b] border border-border/80 mr-auto text-xs text-orange-400 flex items-center gap-2">
                  <Sparkles className="size-3.5 animate-spin" />
                  <span>Refining itinerary with Gemini...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleChatSubmit} className="p-2.5 bg-[#18181b] border-t border-border/80 flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask AI to refine plan..."
                className="flex-1 px-3 py-2 rounded-xl bg-[#121215] border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/60"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatMessage.trim()}
                className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="size-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, DollarSign, Download, Share2, MessageSquare, Trash2,
  CheckCircle2, Clock, Sparkles, Send, CloudSun, ShieldCheck,
  Users, UserPlus, BrainCircuit, X, UserCheck, Plane, Building, Car, Search, Check, AlertCircle, Mail
} from 'lucide-react';
import {
  getTripDetails, updateTripData, deleteTripById, refineItineraryWithAi,
  addCollaboratorToTrip, removeCollaboratorFromTrip, searchCollaboratorUsers
} from '../services/tripService';
import { fetchWeatherForecast } from '../services/weatherService';
import { exportItineraryToPdf } from '../services/pdfService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';
import { getCachedData, setCachedData, subscribeRealtimeUpdate, broadcastRealtimeUpdate } from '@/utils/realtimeSync';

import TripLogisticsSummary from '../components/trip/TripLogisticsSummary';
import TripFlightSelector from '../components/trip/TripFlightSelector';
import TripHotelSelector from '../components/trip/TripHotelSelector';
import TripVehicleCabSelector from '../components/trip/TripVehicleCabSelector';

const ItineraryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showModal, showToast } = useModal();

  const cacheKey = `itinerary_details_${id}`;
  const initialTrip = getCachedData(cacheKey);

  const [trip, setTrip] = useState(initialTrip || null);
  const [loading, setLoading] = useState(!initialTrip);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [collabEmail, setCollabEmail] = useState('');
  const [collabRole, setCollabRole] = useState('editor');
  const [collabLoading, setCollabLoading] = useState(false);

  // User search for collaboration
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [inviteRoles, setInviteRoles] = useState({});

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

  useEffect(() => {
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
      setCachedData(cacheKey, updated.data);
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

  const handleSelectFlight = async (flightId) => {
    setServiceLoading(true);
    try {
      const res = await updateTripData(id, { selectedFlight: flightId });
      setTrip(res.data);
      setCachedData(cacheKey, res.data);
      showToast(flightId ? 'Flight plane linked to itinerary!' : 'Flight removed from trip', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update flight selection', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleSelectHotel = async (hotelId) => {
    setServiceLoading(true);
    try {
      const res = await updateTripData(id, { selectedHotel: hotelId });
      setTrip(res.data);
      setCachedData(cacheKey, res.data);
      showToast(hotelId ? 'Hotel reserved for itinerary!' : 'Hotel removed from trip', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update hotel selection', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleSelectVehicle = async (vehicleId) => {
    setServiceLoading(true);
    try {
      const res = await updateTripData(id, {
        selectedVehicle: vehicleId,
        selectedCabService: { pickupLocation: '', dropoffLocation: '', cabType: 'Standard Sedan', estimatedFare: 0 }
      });
      setTrip(res.data);
      setCachedData(cacheKey, res.data);
      showToast(vehicleId ? 'Rental car attached to itinerary!' : 'Vehicle rental removed', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update vehicle selection', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleBookCab = async (cabData) => {
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
      showToast('Cancellation request submitted to Admin for confirmation!', 'info');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit cancellation request', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  const handleRemoveService = async (type) => {
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
    } catch (err) {
      showToast('Failed to update trip services', 'error');
    } finally {
      setServiceLoading(false);
    }
  };

  useEffect(() => {
    if (!userSearchQuery.trim()) {
      setUserSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await searchCollaboratorUsers(userSearchQuery.trim());
        setUserSearchResults(res.data || []);
      } catch {
        setUserSearchResults([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  const handleInviteUser = async (targetUser = null, directEmail = null, selectedRole = 'editor') => {
    const emailToUse = (targetUser?.email || directEmail || collabEmail).trim();
    const roleToUse = selectedRole || collabRole;
    if (!emailToUse || collabLoading) return;

    setCollabLoading(true);
    try {
      const res = await addCollaboratorToTrip(id, emailToUse, roleToUse, targetUser?._id);
      setTrip((prev) => ({ ...prev, collaborators: res.data }));
      setCollabEmail('');
      setUserSearchQuery('');
      setUserSearchResults([]);
      showToast(`Collaboration invitation sent to ${targetUser?.name || emailToUse}!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send invite', 'error');
    } finally {
      setCollabLoading(false);
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    handleInviteUser(null, collabEmail.trim(), collabRole);
  };

  const handleRemoveCollaborator = async (collabId) => {
    try {
      const res = await removeCollaboratorFromTrip(id, collabId);
      setTrip((prev) => ({ ...prev, collaborators: res.data }));
      showToast('Collaborator removed', 'info');
    } catch (err) {
      showToast('Failed to remove collaborator', 'error');
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
  const isOwner = user && (trip.user === user._id || trip.user?._id === user._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              {trip.durationDays} Days • {trip.budgetLevel} Tier
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              Embedding Memory Vector Active
            </span>
            {trip.collaborators?.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Users className="w-3.5 h-3.5" />
                {trip.collaborators.length + 1} Co-Creators Access
              </span>
            )}
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
            onClick={() => setCollabModalOpen(true)}
            className="px-4 py-2.5 rounded-xl liquid-glass border border-purple-500/40 text-purple-300 hover:text-white text-sm font-medium flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/10"
          >
            <Users className="w-4 h-4 text-purple-400" />
            Collaborate ({trip.collaborators?.length || 0})
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

          {isOwner && (
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

      <TripLogisticsSummary
        trip={trip}
        onSelectTab={setActiveTab}
        onRemoveService={handleRemoveService}
        onRequestBooking={handleRequestBooking}
        onRequestCancellation={handleRequestCancellation}
        isRequesting={serviceLoading}
      />

      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'itinerary'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border-cyan-400/50'
              : 'liquid-glass text-slate-400 hover:text-white hover:bg-slate-850 border-slate-800'
          } border`}
        >
          <Calendar className="w-4 h-4" />
          Day-by-Day Plan
        </button>

        <button
          onClick={() => setActiveTab('flights')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'flights'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 border-cyan-400/50'
              : 'liquid-glass text-slate-400 hover:text-white hover:bg-slate-850 border-slate-800'
          } border`}
        >
          <Plane className="w-4 h-4 text-cyan-400" />
          Travel Plane / Flights
          {trip.selectedFlight && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('hotels')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'hotels'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 border-amber-400/50'
              : 'liquid-glass text-slate-400 hover:text-white hover:bg-slate-850 border-slate-800'
          } border`}
        >
          <Building className="w-4 h-4 text-amber-400" />
          Hotels & Stay
          {trip.selectedHotel && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('transport')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'transport'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 border-emerald-400/50'
              : 'liquid-glass text-slate-400 hover:text-white hover:bg-slate-850 border-slate-800'
          } border`}
        >
          <Car className="w-4 h-4 text-emerald-400" />
          Rent a Car & Cabs
          {(trip.selectedVehicle || trip.selectedCabService?.pickupLocation) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          )}
        </button>
      </div>

      {activeTab === 'flights' && (
        <TripFlightSelector
          trip={trip}
          onSelectFlight={handleSelectFlight}
          selectedFlightId={trip.selectedFlight?._id}
          isSelecting={serviceLoading}
        />
      )}

      {activeTab === 'hotels' && (
        <TripHotelSelector
          trip={trip}
          onSelectHotel={handleSelectHotel}
          selectedHotelId={trip.selectedHotel?._id}
          isSelecting={serviceLoading}
        />
      )}

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

      {activeTab === 'itinerary' && (
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
      )}

      {collabModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="liquid-glass-card rounded-3xl p-5 sm:p-7 max-w-lg w-full border border-purple-500/30 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Co-Create & Collaborate</h3>
                  <p className="text-xs text-slate-400">Search users and invite friends to co-edit this itinerary</p>
                </div>
              </div>
              <button
                onClick={() => setCollabModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar space-y-5 pr-1 flex-1">
              {isOwner ? (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Search User by Name or Email
                  </label>

                  {/* Real-time Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      placeholder="Type name or email (e.g. John, Sarah@gmail.com)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none border border-slate-800 focus:border-purple-500/50"
                    />
                    {isSearchingUsers && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-purple-400 font-semibold animate-pulse">
                        Searching...
                      </div>
                    )}
                  </div>

                  {/* Search Results Dropdown List */}
                  {userSearchResults.length > 0 && (
                    <div className="p-2 rounded-2xl bg-slate-900/90 border border-purple-500/40 space-y-2 shadow-xl animate-in fade-in duration-150">
                      <p className="text-[10px] uppercase font-bold text-purple-400 px-2 pt-1">
                        Matching Users ({userSearchResults.length})
                      </p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                        {userSearchResults.map((foundUser) => {
                          const currentRole = inviteRoles[foundUser._id] || 'editor';
                          const existing = trip.collaborators?.find(
                            (c) =>
                              (c.user?._id && c.user._id.toString() === foundUser._id.toString()) ||
                              (c.email && c.email.toLowerCase() === foundUser.email?.toLowerCase())
                          );

                          return (
                            <div
                              key={foundUser._id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 transition-all text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {foundUser.avatar?.url ? (
                                  <img
                                    src={foundUser.avatar.url}
                                    alt={foundUser.name}
                                    className="w-8 h-8 rounded-full object-cover border border-purple-500/30 shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center shrink-0">
                                    {foundUser.name ? foundUser.name[0].toUpperCase() : 'U'}
                                  </div>
                                )}
                                <div className="truncate">
                                  <p className="font-semibold text-white truncate">{foundUser.name}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{foundUser.email}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {existing?.status === 'accepted' ? (
                                  <span className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                                    ✓ Active
                                  </span>
                                ) : existing?.status === 'pending' ? (
                                  <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                                    ⏳ Request Sent
                                  </span>
                                ) : (
                                  <>
                                    <select
                                      value={currentRole}
                                      onChange={(e) =>
                                        setInviteRoles((prev) => ({ ...prev, [foundUser._id]: e.target.value }))
                                      }
                                      className="px-2 py-1 rounded-lg glass-input text-[11px] text-purple-300 border border-slate-800 focus:outline-none"
                                    >
                                      <option value="editor">Editor</option>
                                      <option value="viewer">Viewer</option>
                                    </select>
                                    <button
                                      type="button"
                                      disabled={collabLoading}
                                      onClick={() => handleInviteUser(foundUser, null, currentRole)}
                                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-md"
                                    >
                                      <UserPlus className="w-3.5 h-3.5" />
                                      <span>Invite</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fallback Direct Email Invite Form */}
                  <form onSubmit={handleAddCollaborator} className="pt-2 border-t border-slate-800/80 space-y-2">
                    <label className="text-[11px] font-medium text-slate-400 block">
                      Or invite by direct email address:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={collabEmail}
                        onChange={(e) => setCollabEmail(e.target.value)}
                        placeholder="co-creator@domain.com"
                        className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none border border-slate-800 focus:border-purple-500/50"
                      />
                      <select
                        value={collabRole}
                        onChange={(e) => setCollabRole(e.target.value)}
                        className="px-2.5 py-2 rounded-xl glass-input text-xs text-purple-300 font-semibold border border-slate-800 focus:outline-none"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        type="submit"
                        disabled={collabLoading || !collabEmail.trim()}
                        className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>You are a co-creator editor on this itinerary. You can make live edits and refine with AI.</span>
                </div>
              )}

              {/* Pending Invitations Section */}
              {trip.collaborators?.some((c) => c.status === 'pending') && (
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Invitations (Awaiting Acceptance)</span>
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      {trip.collaborators.filter((c) => c.status === 'pending').length} pending
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                    {trip.collaborators
                      ?.filter((c) => c.status === 'pending')
                      .map((collab) => (
                        <div
                          key={collab._id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/15 border border-amber-500/30 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {collab.user?.avatar?.url ? (
                              <img
                                src={collab.user.avatar.url}
                                alt={collab.user.name}
                                className="w-7 h-7 rounded-full object-cover border border-amber-500/30 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                                {collab.user?.name ? collab.user.name[0].toUpperCase() : collab.email[0].toUpperCase()}
                              </div>
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-white truncate">
                                {collab.user?.name || collab.email.split('@')[0]}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">{collab.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-[10px] uppercase">
                              {collab.role}
                            </span>
                            <span className="text-[10px] text-amber-400/80 italic hidden sm:inline">
                              Pending accept...
                            </span>
                            {isOwner && (
                              <button
                                onClick={() => handleRemoveCollaborator(collab._id)}
                                className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                title="Cancel invitation"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Active Collaborators Section */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Active Co-Creators</span>
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {/* Trip Owner */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {trip.user?.avatar?.url ? (
                        <img
                          src={trip.user.avatar.url}
                          alt={trip.user.name}
                          className="w-8 h-8 rounded-full object-cover border border-cyan-500/40 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {trip.user?.name ? trip.user.name[0].toUpperCase() : 'O'}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-white truncate">{trip.user?.name || 'Trip Owner'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{trip.user?.email || 'Creator'}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold text-[10px] uppercase">
                      Owner
                    </span>
                  </div>

                  {/* Accepted Collaborators */}
                  {trip.collaborators?.filter((c) => c.status === 'accepted' || !c.status).length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-2 text-center">
                      No accepted co-creators yet. Search above to invite teammates.
                    </p>
                  ) : (
                    trip.collaborators
                      ?.filter((c) => c.status === 'accepted' || !c.status)
                      .map((collab) => (
                        <div
                          key={collab._id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {collab.user?.avatar?.url ? (
                              <img
                                src={collab.user.avatar.url}
                                alt={collab.user.name}
                                className="w-8 h-8 rounded-full object-cover border border-purple-500/30 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                                {collab.user?.name ? collab.user.name[0].toUpperCase() : collab.email[0].toUpperCase()}
                              </div>
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-white truncate">
                                {collab.user?.name || collab.email.split('@')[0]}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">{collab.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-[10px] uppercase">
                              {collab.role}
                            </span>
                            {isOwner && (
                              <button
                                onClick={() => handleRemoveCollaborator(collab._id)}
                                className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                                title="Remove collaborator"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDetails;

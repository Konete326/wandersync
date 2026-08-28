import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  Lock,
  Star,
  Trash2,
  Eye,
  FileText,
  Download,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  ExternalLink,
  Users,
  Plane,
  Building,
  Car,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Send,
  Check,
  XCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  getAdminAllTrips,
  updateTripBookingStatusAdmin,
  toggleTripFeatured,
  toggleTripVisibility,
  deleteTripAdmin
} from '@/services/adminService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

import {
  subscribeRealtimeUpdate,
  broadcastRealtimeUpdate,
  getCachedData,
  setCachedData
} from '@/utils/realtimeSync';
import { getDestinationCoverImage } from '@/utils/destinationImages';

export default function AdminTrips() {
  const navigate = useNavigate();
  const { showModal, showToast } = useModal();

  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [countriesList, setCountriesList] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 8;

  const cacheKey = `trips_${visibility}_${bookingStatusFilter}_${selectedCountry}_${page}_${search}`;
  const initialData = getCachedData(cacheKey);

  const [trips, setTrips] = useState(initialData?.trips || []);
  const [loading, setLoading] = useState(!initialData);
  const [totalPages, setTotalPages] = useState(initialData?.pages || 1);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [inspectTrip, setInspectTrip] = useState(null);
  const [adminActionNotes, setAdminActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadCountries = async () => {
    try {
      const res = await fetchCountries(1, 100);
      if (res.data?.countries) {
        setCountriesList(res.data.countries);
      }
    } catch {}
  };

  const loadTrips = async (pageNum = 1, isBackground = false) => {
    const key = `trips_${visibility}_${bookingStatusFilter}_${selectedCountry}_${pageNum}_${search}`;
    const cached = getCachedData(key);
    if (!isBackground && !cached) {
      setLoading(true);
    }
    try {
      const res = await getAdminAllTrips(
        pageNum,
        limit,
        search,
        visibility,
        selectedCountry,
        '',
        bookingStatusFilter
      );
      if (res.data?.trips) {
        setTrips(res.data.trips);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
        setCachedData(key, res.data);
      } else {
        setTrips([]);
      }
    } catch {
      if (!isBackground) {
        showToast('Could not load itineraries', 'error');
      }
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    loadTrips(page);
  }, [page, visibility, bookingStatusFilter, selectedCountry]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeUpdate('trips', () => {
      loadTrips(page, true);
    });
    const timer = setInterval(() => {
      loadTrips(page, true);
    }, 8000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [page, visibility, bookingStatusFilter, selectedCountry, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadTrips(1);
  };

  const handleUpdateBookingStatus = async (tripId, status, customNotes = '', itemType = null, itemStatus = null) => {
    setActionLoading(true);
    try {
      const res = await updateTripBookingStatusAdmin(
        tripId,
        status,
        customNotes || adminActionNotes,
        itemType,
        itemStatus
      );
      setTrips((prev) => prev.map((t) => (t._id === tripId ? res.data : t)));
      if (inspectTrip && inspectTrip._id === tripId) {
        setInspectTrip(res.data);
      }
      broadcastRealtimeUpdate('trips');
      showToast(itemType ? `${itemType.toUpperCase()} status set to ${itemStatus.toUpperCase()}!` : `Booking updated: ${status.replace('_', ' ').toUpperCase()}!`, 'success');
      setAdminActionNotes('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update booking status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (id, currentVal) => {
    setTrips((prev) =>
      prev.map((t) => (t._id === id ? { ...t, featured: !currentVal } : t))
    );
    try {
      await toggleTripFeatured(id);
      broadcastRealtimeUpdate('trips');
      showToast(`Trip ${!currentVal ? 'featured on showcase' : 'unfeatured'}`, 'success');
    } catch {
      showToast('Failed to update featured state', 'error');
      loadTrips(page, true);
    }
  };

  const handleToggleVisibility = async (id, currentVal) => {
    setTrips((prev) =>
      prev.map((t) => (t._id === id ? { ...t, isPublic: !currentVal } : t))
    );
    try {
      await toggleTripVisibility(id);
      broadcastRealtimeUpdate('trips');
      showToast(`Trip is now ${!currentVal ? 'Public' : 'Private'}`, 'success');
    } catch {
      showToast('Failed to update visibility state', 'error');
      loadTrips(page, true);
    }
  };

  const handleDeleteTrip = (id, title) => {
    showModal({
      title: 'Permanently Delete Itinerary?',
      message: `Are you sure you want to delete the trip "${title || 'Untitled Trip'}"? This will permanently remove all associated days, schedule data, and community links.`,
      type: 'danger',
      onConfirm: async () => {
        setTrips((prev) => prev.filter((t) => t._id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
        try {
          await deleteTripAdmin(id);
          broadcastRealtimeUpdate('trips');
          showToast('Trip itinerary deleted successfully', 'success');
        } catch {
          showToast('Failed to delete itinerary', 'error');
          loadTrips(page);
        }
      }
    });
  };

  const handleDownloadJSON = (trip) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trip, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${trip.title || 'trip'}-itinerary.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Itinerary JSON exported successfully', 'success');
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-8">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Compass className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">AI Trips & Itineraries Maestro</h1>
            <p className="text-[11px] text-muted-foreground">
              Live moderation, individual logistics approvals / cancellations, and itinerary inspection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-secondary/50 border border-border text-[11px] font-bold text-foreground">
            Total Trips: <span className="text-orange-400 font-extrabold">{total}</span>
          </div>
        </div>
      </div>

      <div className="py-1.5 px-3 rounded-xl bg-[#121215] border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destination, title, country..."
            className="w-full pl-8 pr-2.5 h-[30px] rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
          />
        </form>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <select
            value={bookingStatusFilter}
            onChange={(e) => {
              setBookingStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-orange-500/40 text-xs text-orange-400 font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="all" className="bg-[#121215] text-foreground">All Bookings Status</option>
            <option value="pending" className="bg-[#121215] text-amber-400 font-bold">Pending Approval ⏳</option>
            <option value="cancellation_requested" className="bg-[#121215] text-amber-400 font-bold">Cancellation Requested ⚠️</option>
            <option value="confirmed" className="bg-[#121215] text-emerald-400 font-bold">Confirmed / Approved ✅</option>
            <option value="rejected" className="bg-[#121215] text-rose-400 font-bold">Declined / Cancelled ❌</option>
          </select>

          <select
            value={visibility}
            onChange={(e) => {
              setVisibility(e.target.value);
              setPage(1);
            }}
            className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
          >
            <option value="all" className="bg-[#121215] text-foreground">All Visibilities</option>
            <option value="public" className="bg-[#121215] text-foreground">Public Trips Only</option>
            <option value="private" className="bg-[#121215] text-foreground">Private Trips Only</option>
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setPage(1);
            }}
            className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
          >
            <option value="All" className="bg-[#121215] text-foreground">All Countries</option>
            {countriesList.map((c) => (
              <option key={c._id} value={c.name} className="bg-[#121215] text-foreground">{c.name}</option>
            ))}
          </select>

          {(search || visibility !== 'all' || bookingStatusFilter !== 'all' || selectedCountry !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setVisibility('all');
                setBookingStatusFilter('all');
                setSelectedCountry('All');
                setPage(1);
              }}
              className="h-[30px] px-2 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-[11px] font-semibold transition-colors cursor-pointer border border-border/60"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader text="Loading live traveler itineraries..." />
        </div>
      ) : trips.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-[#121215] border border-border/80 space-y-2">
          <Compass className="size-8 text-muted-foreground/30 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Trips Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No traveler itineraries match the selected search query or booking filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5">
          {trips.map((trip) => {
            const bookingStatus = trip.bookingRequest?.status || 'none';
            const isCancelPending = trip.bookingRequest?.cancellationRequest?.isPending;
            const hasLogistics = Boolean(trip.selectedFlight || trip.selectedHotel || trip.selectedVehicle || trip.selectedCabService?.pickupLocation);
            const flightStatus = trip.bookingRequest?.flightStatus || (bookingStatus === 'confirmed' ? 'confirmed' : bookingStatus === 'pending' ? 'pending' : 'none');
            const hotelStatus = trip.bookingRequest?.hotelStatus || (bookingStatus === 'confirmed' ? 'confirmed' : bookingStatus === 'pending' ? 'pending' : 'none');
            const vehicleStatus = trip.bookingRequest?.vehicleStatus || (bookingStatus === 'confirmed' ? 'confirmed' : bookingStatus === 'pending' ? 'pending' : 'none');

            return (
              <div
                key={trip._id}
                className={`rounded-2xl border bg-[#121215] transition-all overflow-hidden flex flex-col justify-between shadow-md group ${
                  isCancelPending
                    ? 'border-amber-500/80 shadow-amber-500/20'
                    : bookingStatus === 'pending'
                    ? 'border-amber-500/60 shadow-amber-500/10'
                    : bookingStatus === 'confirmed'
                    ? 'border-emerald-500/40'
                    : 'border-border/80 hover:border-orange-500/40'
                }`}
              >
                <div>
                  <div className="relative h-36 w-full overflow-hidden bg-secondary/30">
                    <img
                      src={getDestinationCoverImage(trip)}
                      alt={trip.title}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-orange-400 text-[10px] font-bold border border-orange-500/30">
                        {trip.destination?.city || 'City'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-zinc-300 text-[9px] font-semibold">
                        {trip.durationDays || 3}D
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                      {isCancelPending && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[9px] font-extrabold flex items-center gap-1 shadow-md animate-pulse">
                          <AlertTriangle className="size-2.5" /> Cancel Req
                        </span>
                      )}
                      {!isCancelPending && (bookingStatus === 'pending' || flightStatus === 'pending' || hotelStatus === 'pending' || vehicleStatus === 'pending') && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[9px] font-extrabold flex items-center gap-1 shadow-md animate-pulse">
                          <Clock className="size-2.5" /> Pending Approval
                        </span>
                      )}
                      {!isCancelPending && bookingStatus === 'confirmed' && flightStatus !== 'pending' && hotelStatus !== 'pending' && vehicleStatus !== 'pending' && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-zinc-950 text-[9px] font-extrabold flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="size-2.5" /> Approved
                        </span>
                      )}
                      {!isCancelPending && bookingStatus === 'partially_confirmed' && flightStatus !== 'pending' && hotelStatus !== 'pending' && vehicleStatus !== 'pending' && (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-zinc-950 text-[9px] font-extrabold flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="size-2.5" /> Partial
                        </span>
                      )}
                      {!isCancelPending && bookingStatus === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-extrabold flex items-center gap-1 shadow-md">
                          <ShieldAlert className="size-2.5" /> Declined / Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2.5">
                    <div>
                      <h3 className="text-xs font-bold text-foreground leading-snug line-clamp-1 group-hover:text-orange-400 transition-colors">
                        {trip.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="size-2.5 text-orange-400" />
                        <span>{trip.destination?.city}, {trip.destination?.country}</span>
                      </p>
                    </div>

                    {hasLogistics && (
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-secondary/40 border border-border text-[10px]">
                        <span className="text-muted-foreground font-semibold">Items:</span>
                        {trip.selectedFlight && (
                          <span className={`flex items-center gap-0.5 ${flightStatus === 'confirmed' ? 'text-emerald-400' : flightStatus === 'pending' ? 'text-amber-400' : flightStatus === 'rejected' ? 'text-rose-400' : 'text-cyan-400'}`} title={`Flight: ${flightStatus}`}>
                            <Plane className="size-3" />
                          </span>
                        )}
                        {trip.selectedHotel && (
                          <span className={`flex items-center gap-0.5 ${hotelStatus === 'confirmed' ? 'text-emerald-400' : hotelStatus === 'pending' ? 'text-amber-400' : hotelStatus === 'rejected' ? 'text-rose-400' : 'text-amber-400'}`} title={`Hotel: ${hotelStatus}`}>
                            <Building className="size-3" />
                          </span>
                        )}
                        {(trip.selectedVehicle || trip.selectedCabService?.pickupLocation) && (
                          <span className={`flex items-center gap-0.5 ${vehicleStatus === 'confirmed' ? 'text-emerald-400' : vehicleStatus === 'pending' ? 'text-amber-400' : vehicleStatus === 'rejected' ? 'text-rose-400' : 'text-emerald-400'}`} title={`Vehicle: ${vehicleStatus}`}>
                            <Car className="size-3" />
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] p-2 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="size-5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-[9px] flex items-center justify-center shrink-0">
                          {trip.user?.name?.charAt(0) || 'T'}
                        </div>
                        <span className="text-zinc-300 font-semibold truncate">{trip.user?.name || 'Traveler'}</span>
                      </div>
                      <span className="text-orange-400 font-mono font-bold shrink-0">
                        ${trip.estimatedTotalCost || 0}
                      </span>
                    </div>

                    {isCancelPending && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="size-3" /> Cancel: {trip.bookingRequest?.cancellationRequest?.itemType?.toUpperCase()}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateBookingStatus(trip._id, 'approve_cancellation')}
                            disabled={actionLoading}
                            className="flex-1 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                          >
                            <Check className="size-3" /> Approve Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(trip._id, 'reject_cancellation')}
                            disabled={actionLoading}
                            className="flex-1 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-rose-500/30"
                          >
                            <XCircle className="size-3" /> Decline
                          </button>
                        </div>
                      </div>
                    )}

                    {!isCancelPending && bookingStatus === 'pending' && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => setInspectTrip(trip)}
                          className="flex-1 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-amber-500/40"
                        >
                          <Eye className="size-3" /> Review Items
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(trip._id, 'confirmed')}
                          disabled={actionLoading}
                          className="flex-1 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <Check className="size-3" /> Approve All
                        </button>
                      </div>
                    )}

                    {!isCancelPending && bookingStatus === 'confirmed' && (
                      <div className="pt-1">
                        <button
                          onClick={() => handleUpdateBookingStatus(trip._id, 'rejected', 'Admin cancelled confirmed booking')}
                          disabled={actionLoading}
                          className="w-full py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer border border-rose-500/20"
                        >
                          <RotateCcw className="size-3" /> Revoke / Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 pt-0 flex items-center gap-1.5 border-t border-border/70 mt-1 text-[11px]">
                  <button
                    onClick={() => setInspectTrip(trip)}
                    className="flex-1 py-1 rounded-lg bg-secondary/60 hover:bg-secondary text-foreground font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-border"
                    title="Inspect Itinerary"
                  >
                    <Eye className="size-3 text-orange-400" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(trip._id, trip.featured)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      trip.featured
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border'
                    }`}
                    title={trip.featured ? 'Unfeature from homepage' : 'Feature on homepage showcase'}
                  >
                    <Star className="size-3" />
                  </button>

                  <button
                    onClick={() => handleToggleVisibility(trip._id, trip.isPublic)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      trip.isPublic
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border'
                    }`}
                    title={trip.isPublic ? 'Make Private' : 'Make Public'}
                  >
                    {trip.isPublic ? <Globe className="size-3" /> : <Lock className="size-3" />}
                  </button>

                  <button
                    onClick={() => handleDeleteTrip(trip._id, trip.title)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                    title="Delete Itinerary"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="p-3.5 rounded-2xl bg-[#121215] border border-border flex items-center justify-between text-xs shadow-md">
          <span className="text-muted-foreground">
            Page <span className="font-bold text-foreground">{page}</span> of{' '}
            <span className="font-bold text-foreground">{totalPages}</span> ({total} itineraries)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1 || loading}
              onClick={() => {
                const newPage = Math.max(page - 1, 1);
                setPage(newPage);
                loadTrips(newPage);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="size-3.5" />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p);
                    loadTrips(p);
                  }}
                  className={`size-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    page === p
                      ? 'bg-orange-500 text-zinc-950 font-bold shadow-sm shadow-orange-500/20'
                      : 'bg-secondary/40 text-muted-foreground hover:text-foreground border border-border hover:border-orange-500/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => {
                const newPage = Math.min(page + 1, totalPages);
                setPage(newPage);
                loadTrips(newPage);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {inspectTrip && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
          <div className="max-w-3xl w-full rounded-3xl overflow-hidden bg-[#121215] border border-border/80 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-secondary/30">
              <div className="flex items-center gap-2.5">
                <Compass className="size-5 text-orange-400" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">{inspectTrip.title}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Created by {inspectTrip.user?.name || 'Traveler'} ({inspectTrip.user?.email}) • {inspectTrip.durationDays} Days • ${inspectTrip.estimatedTotalCost || 0} USD
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadJSON(inspectTrip)}
                  className="px-2.5 py-1.5 rounded-lg bg-secondary/70 hover:bg-secondary text-foreground text-xs font-bold flex items-center gap-1.5 border border-border cursor-pointer"
                  title="Export Raw JSON"
                >
                  <Download className="size-3.5 text-orange-400" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={() => setInspectTrip(null)}
                  className="size-7 rounded-full bg-secondary/60 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Individual Logistics & Approvals</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    inspectTrip.bookingRequest?.cancellationRequest?.isPending
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      : inspectTrip.bookingRequest?.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : inspectTrip.bookingRequest?.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    Overall: {inspectTrip.bookingRequest?.cancellationRequest?.isPending ? 'CANCELLATION REQUESTED' : (inspectTrip.bookingRequest?.status || 'none').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl bg-black/40 border ${
                    inspectTrip.bookingRequest?.flightStatus === 'confirmed'
                      ? 'border-emerald-500/40'
                      : inspectTrip.bookingRequest?.flightStatus === 'pending' || inspectTrip.bookingRequest?.status === 'pending'
                      ? 'border-amber-500/40'
                      : 'border-border'
                  } space-y-2 flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground flex items-center gap-1 font-bold"><Plane className="size-3 text-cyan-400" /> Flight Plane</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          inspectTrip.bookingRequest?.flightStatus === 'confirmed'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : inspectTrip.bookingRequest?.flightStatus === 'rejected'
                            ? 'text-rose-400 bg-rose-500/10'
                            : inspectTrip.bookingRequest?.status === 'pending' || inspectTrip.bookingRequest?.flightStatus === 'pending'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-zinc-400'
                        }`}>
                          {inspectTrip.selectedFlight ? (inspectTrip.bookingRequest?.flightStatus || (inspectTrip.bookingRequest?.status === 'pending' ? 'Pending' : 'Selected')) : 'None'}
                        </span>
                      </div>
                      <p className="font-bold text-foreground mt-1 truncate">{inspectTrip.selectedFlight ? `${inspectTrip.selectedFlight.airline} (${inspectTrip.selectedFlight.flightNumber})` : 'Not Selected'}</p>
                      {inspectTrip.selectedFlight && <p className="text-[10px] text-emerald-400 font-bold mt-0.5">${inspectTrip.selectedFlight.price}</p>}
                    </div>

                    {inspectTrip.selectedFlight && (inspectTrip.bookingRequest?.flightStatus === 'pending' || (inspectTrip.bookingRequest?.status === 'pending' && inspectTrip.bookingRequest?.flightStatus !== 'confirmed')) && (
                      <div className="flex items-center gap-1 pt-1 border-t border-border/60">
                        <button
                          onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'custom', '', 'flight', 'confirmed')}
                          disabled={actionLoading}
                          className="flex-1 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="size-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'custom', '', 'flight', 'rejected')}
                          disabled={actionLoading}
                          className="flex-1 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-[10px] flex items-center justify-center gap-1 border border-rose-500/30 cursor-pointer"
                        >
                          <XCircle className="size-3" /> Decline
                        </button>
                      </div>
                    )}

                    {inspectTrip.selectedFlight && inspectTrip.bookingRequest?.flightStatus === 'confirmed' && (
                      <div className="pt-1 border-t border-border/60">
                        <button
                          onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'custom', 'Admin revoked flight approval', 'flight', 'rejected')}
                          disabled={actionLoading}
                          className="w-full py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-[10px] flex items-center justify-center gap-1 border border-rose-500/30 cursor-pointer"
                        >
                          <RotateCcw className="size-3" /> Cancel Flight Approval
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`p-3 rounded-xl bg-black/40 border ${
                    inspectTrip.bookingRequest?.hotelStatus === 'confirmed'
                      ? 'border-emerald-500/40'
                      : inspectTrip.bookingRequest?.hotelStatus === 'pending' || inspectTrip.bookingRequest?.status === 'pending'
                      ? 'border-amber-500/40'
                      : 'border-border'
                  } space-y-2 flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground flex items-center gap-1 font-bold"><Building className="size-3 text-amber-400" /> Hotel / Stay</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          inspectTrip.bookingRequest?.hotelStatus === 'confirmed'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : inspectTrip.bookingRequest?.hotelStatus === 'rejected'
                            ? 'text-rose-400 bg-rose-500/10'
                            : inspectTrip.bookingRequest?.status === 'pending' || inspectTrip.bookingRequest?.hotelStatus === 'pending'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-zinc-400'
                        }`}>
                          {inspectTrip.selectedHotel ? (inspectTrip.bookingRequest?.hotelStatus || (inspectTrip.bookingRequest?.status === 'pending' ? 'Pending' : 'Selected')) : 'None'}
                        </span>
                      </div>
                      <p className="font-bold text-foreground mt-1 truncate">{inspectTrip.selectedHotel ? inspectTrip.selectedHotel.name : 'Not Selected'}</p>
                      {inspectTrip.selectedHotel && <p className="text-[10px] text-emerald-400 font-bold mt-0.5">${inspectTrip.selectedHotel.pricePerNight} / night</p>}
                    </div>

                    {inspectTrip.selectedHotel && (inspectTrip.bookingRequest?.hotelStatus === 'pending' || (inspectTrip.bookingRequest?.status === 'pending' && inspectTrip.bookingRequest?.hotelStatus !== 'confirmed')) && (
                      <div className="flex items-center gap-1 pt-1 border-t border-border/60">
                        <button
                          onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'custom', '', 'hotel', 'confirmed')}
                          disabled={actionLoading}
                          className="flex-1 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="size-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'custom', '', 'hotel', 'rejected')}
                          disabled={actionLoading}
                          className="flex-1 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-[10px] flex items-center justify-center gap-1 border border-rose-500/30 cursor-pointer"
                        >
                          <XCircle className="size-3" /> Decline
                        </button>
                      </div>
                    )}

                    {inspectTrip.selectedHotel && inspectTrip.bookingRequest?.hotelStatus === 'confirmed' && (
                      <div className="pt-1 border-t border-border/60">
                        <button
                          onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'custom', 'Admin revoked hotel approval', 'hotel', 'rejected')}
                          disabled={actionLoading}
                          className="w-full py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-[10px] flex items-center justify-center gap-1 border border-rose-500/30 cursor-pointer"
                        >
                          <RotateCcw className="size-3" /> Cancel Hotel Approval
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`p-3 rounded-xl bg-black/40 border ${
                    inspectTrip.bookingRequest?.vehicleStatus === 'confirmed'
                      ? 'border-emerald-500/40'
                      : inspectTrip.bookingRequest?.vehicleStatus === 'pending' || inspectTrip.bookingRequest?.status === 'pending'
                      ? 'border-amber-500/40'
                      : 'border-border'
                  } space-y-2 flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground flex items-center gap-1 font-bold"><Car className="size-3 text-emerald-400" /> Car / Cab</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          inspectTrip.bookingRequest?.vehicleStatus === 'confirmed'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : inspectTrip.bookingRequest?.vehicleStatus === 'rejected'
                            ? 'text-rose-400 bg-rose-500/10'
                            : inspectTrip.bookingRequest?.status === 'pending' || inspectTrip.bookingRequest?.vehicleStatus === 'pending'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-zinc-400'
                        }`}>
                          {(inspectTrip.selectedVehicle || inspectTrip.selectedCabService?.pickupLocation) ? (inspectTrip.bookingRequest?.vehicleStatus || (inspectTrip.bookingRequest?.status === 'pending' ? 'Pending' : 'Selected')) : 'None'}
                        </span>
                      </div>
                      <p className="font-bold text-foreground mt-1 truncate">{inspectTrip.selectedVehicle ? inspectTrip.selectedVehicle.name : inspectTrip.selectedCabService?.pickupLocation ? `Cab: ${inspectTrip.selectedCabService.cabType}` : 'Not Selected'}</p>
                      {(inspectTrip.selectedVehicle || inspectTrip.selectedCabService?.pickupLocation) && (
                        <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
                          {inspectTrip.selectedVehicle ? `$${inspectTrip.selectedVehicle.pricePerDay} / day` : `$${inspectTrip.selectedCabService?.estimatedFare}`}
                        </p>
                      )}
                    </div>

                    {(inspectTrip.selectedVehicle || inspectTrip.selectedCabService?.pickupLocation) && (inspectTrip.bookingRequest?.vehicleStatus === 'pending' || (inspectTrip.bookingRequest?.status === 'pending' && inspectTrip.bookingRequest?.vehicleStatus !== 'confirmed')) && (
                      <div className="flex items-center gap-1 pt-1 border-t border-border/60">
                        <button
                          onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'custom', '', 'vehicle', 'confirmed')}
                          disabled={actionLoading}
                          className="flex-1 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="size-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'custom', '', 'vehicle', 'rejected')}
                          disabled={actionLoading}
                          className="flex-1 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-[10px] flex items-center justify-center gap-1 border border-rose-500/30 cursor-pointer"
                        >
                          <XCircle className="size-3" /> Decline
                        </button>
                      </div>
                    )}

                    {(inspectTrip.selectedVehicle || inspectTrip.selectedCabService?.pickupLocation) && inspectTrip.bookingRequest?.vehicleStatus === 'confirmed' && (
                      <div className="pt-1 border-t border-border/60">
                        <button
                          onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'custom', 'Admin revoked vehicle approval', 'vehicle', 'rejected')}
                          disabled={actionLoading}
                          className="w-full py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 font-bold text-[10px] flex items-center justify-center gap-1 border border-rose-500/30 cursor-pointer"
                        >
                          <RotateCcw className="size-3" /> Cancel Vehicle Approval
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {inspectTrip.bookingRequest?.cancellationRequest?.isPending && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 space-y-1">
                    <p className="font-bold text-xs flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 text-amber-400" />
                      Cancellation Request for: {inspectTrip.bookingRequest.cancellationRequest.itemType?.toUpperCase()}
                    </p>
                    <p className="text-[11px] text-zinc-300">
                      User Reason: "{inspectTrip.bookingRequest.cancellationRequest.reason}"
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'approve_cancellation')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="size-3.5" /> Approve Cancellation & Remove Item
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'reject_cancellation')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-1 border border-rose-500/30 cursor-pointer"
                      >
                        <XCircle className="size-3.5" /> Decline Cancellation
                      </button>
                    </div>
                  </div>
                )}

                {inspectTrip.bookingRequest?.userNotes && (
                  <div className="p-2.5 rounded-xl bg-black/30 border border-border">
                    <p className="text-[10px] text-muted-foreground font-semibold">User Booking Notes:</p>
                    <p className="text-zinc-200 mt-0.5 italic">"{inspectTrip.bookingRequest.userNotes}"</p>
                  </div>
                )}

                {!inspectTrip.bookingRequest?.cancellationRequest?.isPending && (inspectTrip.bookingRequest?.status === 'pending' || inspectTrip.bookingRequest?.flightStatus === 'pending' || inspectTrip.bookingRequest?.hotelStatus === 'pending' || inspectTrip.bookingRequest?.vehicleStatus === 'pending') && (
                  <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={adminActionNotes}
                      onChange={(e) => setAdminActionNotes(e.target.value)}
                      placeholder="Optional notes for traveler..."
                      className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-border text-xs text-foreground focus:outline-none focus:border-orange-500/50"
                    />
                    <button
                      onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'confirmed')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="size-3.5" /> Approve All Selected
                    </button>
                    <button
                      onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'rejected')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-500/30"
                    >
                      <XCircle className="size-3.5" /> Decline All
                    </button>
                  </div>
                )}

                {!inspectTrip.bookingRequest?.cancellationRequest?.isPending && inspectTrip.bookingRequest?.status === 'confirmed' && (
                  <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="size-4" /> Booking approved & confirmed
                    </div>
                    <button
                      onClick={() => handleUpdateBookingStatus(inspectTrip._id, 'rejected', 'Admin cancelled booking')}
                      disabled={actionLoading}
                      className="px-4 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" /> Revoke / Cancel All Booking Approvals
                    </button>
                  </div>
                )}

                {(!inspectTrip.bookingRequest || inspectTrip.bookingRequest.status === 'none') && (
                  <div className="p-2.5 rounded-xl bg-secondary/30 border border-border text-xs text-muted-foreground flex items-center gap-2">
                    <span>Traveler has not requested booking approval for this itinerary yet.</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border space-y-1.5">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">Trip Overview</span>
                <p className="text-zinc-300 leading-relaxed text-xs">{inspectTrip.overview}</p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
                  Day-by-Day Itinerary Activities ({inspectTrip.days?.length || 0} Days)
                </span>

                <div className="space-y-2.5">
                  {inspectTrip.days?.map((day, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-secondary/30 border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs">
                          Day {day.dayNumber}: {day.title}
                        </span>
                        <span className="text-[10px] text-orange-400 font-mono">{day.theme}</span>
                      </div>

                      <div className="space-y-1.5">
                        {day.activities?.map((act, actIdx) => (
                          <div key={actIdx} className="p-2 rounded-lg bg-black/40 border border-border/60 flex items-start justify-between gap-2 text-[11px]">
                            <div>
                              <span className="font-semibold text-foreground block">{act.timeSlot}: {act.title}</span>
                              <span className="text-[10px] text-muted-foreground">{act.description}</span>
                            </div>
                            <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                              {act.estimatedCost ? `$${act.estimatedCost}` : 'Free'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary/30 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Trip ID: <span className="font-mono text-zinc-300">{inspectTrip._id}</span>
              </span>
              <button
                onClick={() => setInspectTrip(null)}
                className="px-4 py-1.5 rounded-lg bg-orange-500 text-zinc-950 font-bold cursor-pointer"
              >
                Close Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

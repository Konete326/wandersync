import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass, Plus, Search, Calendar, MapPin, DollarSign, Trash2, ArrowRight,
  Globe, Sparkles, Download, Share2, Filter, Eye, Tag, Users, Clock, CheckCircle2,
  XCircle, Bell
} from 'lucide-react';
import { getMyTrips, deleteTripById, getPendingTripInvites, respondToTripInvite } from '../services/tripService';
import { exportItineraryToPdf } from '../services/pdfService';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';
import { getCachedData, setCachedData, subscribeRealtimeUpdate } from '@/utils/realtimeSync';
import { getCountryFlag } from '@/utils/worldCountriesData';
import { getDestinationCoverImage } from '@/utils/destinationImages';

export default function MyTrips() {
  const cacheKey = 'user_my_trips';
  const initialTrips = getCachedData(cacheKey);

  const [trips, setTrips] = useState(initialTrips || []);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(!initialTrips);
  const [exportingId, setExportingId] = useState(null);
  const [respondingId, setRespondingId] = useState(null);

  const { showModal, showToast } = useModal();
  const navigate = useNavigate();

  const loadTrips = useCallback(async (isBackground = false) => {
    if (!isBackground && !initialTrips) {
      setLoading(true);
    }
    try {
      const res = await getMyTrips();
      const tripList = res.data || [];
      setTrips(tripList);
      setCachedData(cacheKey, tripList);
    } catch {
      if (!isBackground) {
        showToast('Could not fetch travel library', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [initialTrips]);

  const loadPendingInvites = useCallback(async () => {
    try {
      const res = await getPendingTripInvites();
      setPendingInvites(res.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadTrips(!!initialTrips);
    loadPendingInvites();
  }, [loadTrips, loadPendingInvites]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeUpdate('trips', () => {
      loadTrips(true);
      loadPendingInvites();
    });
    return () => unsubscribe();
  }, [loadTrips, loadPendingInvites]);

  const handleRespondToInvite = async (tripId, tripTitle, action) => {
    setRespondingId(`${tripId}_${action}`);
    try {
      await respondToTripInvite(tripId, action);
      setPendingInvites((prev) => prev.filter((inv) => inv._id !== tripId));
      if (action === 'accept') {
        showToast(`Joined "${tripTitle}"! Added to your itineraries.`, 'success');
        loadTrips(true);
      } else {
        showToast(`Declined invitation to "${tripTitle}".`, 'info');
      }
    } catch {
      showToast(`Failed to ${action} invite`, 'error');
    } finally {
      setRespondingId(null);
    }
  };

  const handleDelete = (tripId, tripTitle, e) => {
    e.preventDefault();
    e.stopPropagation();

    showModal({
      title: 'Delete Itinerary',
      message: `Are you sure you want to permanently delete "${tripTitle}"? This cannot be undone.`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete Now',
      onConfirm: async () => {
        try {
          await deleteTripById(tripId);
          setTrips((prev) => prev.filter((t) => t._id !== tripId));
          showToast('Itinerary removed from your library', 'info');
        } catch {
          showToast('Failed to delete itinerary', 'error');
        }
      }
    });
  };

  const handleExportPdf = async (trip, e) => {
    e.preventDefault();
    e.stopPropagation();
    setExportingId(trip._id);
    try {
      await exportItineraryToPdf(trip);
      showToast('Itinerary PDF generated successfully!', 'success');
    } catch {
      showToast('Failed to generate PDF', 'error');
    } finally {
      setExportingId(null);
    }
  };

  const handleShare = (trip, e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/trips/${trip._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast('Itinerary link copied to clipboard!', 'success');
    } else {
      showToast(shareUrl, 'info');
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const countries = new Set();
    let totalDays = 0;
    let totalBudget = 0;

    trips.forEach((t) => {
      if (t.destination?.country) countries.add(t.destination.country);
      totalDays += Number(t.durationDays) || t.days?.length || 0;
      totalBudget += Number(t.estimatedTotalCost) || 0;
    });

    return {
      totalTrips,
      totalCountries: countries.size,
      totalDays,
      totalBudget
    };
  }, [trips]);

  // Filtered & Sorted trips
  const filteredTrips = useMemo(() => {
    let list = trips.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.destination?.city?.toLowerCase().includes(q) ||
        t.destination?.country?.toLowerCase().includes(q) ||
        t.budgetLevel?.toLowerCase().includes(q) ||
        t.travelStyle?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      const now = new Date().toISOString().split('T')[0];
      if (statusFilter === 'upcoming') {
        return (t.startDate && t.startDate >= now) || !t.startDate;
      }
      if (statusFilter === 'completed') {
        return t.endDate && t.endDate < now;
      }
      if (statusFilter === 'luxury') {
        return t.budgetLevel === 'Luxury';
      }
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'duration') {
        return (b.durationDays || 0) - (a.durationDays || 0);
      }
      if (sortBy === 'budget') {
        return (b.estimatedTotalCost || 0) - (a.estimatedTotalCost || 0);
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return list;
  }, [trips, search, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <Loader text="Loading your personal travel atlas..." />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Stats Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121215] border border-border/80 relative overflow-hidden shadow-xl space-y-6">
          <div className="absolute -top-24 -right-24 size-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="size-3" />
                  <span>Personal Travel Atlas</span>
                </span>
                <span className="text-xs text-muted-foreground">• AI Generated Itineraries</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                My Journeys & Itineraries
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                Revisit, export, customize, and collaborate on your bespoke travel journeys created with Google Gemini AI.
              </p>
            </div>

            <Link
              to="/create"
              className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Plan New Journey</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border/60 relative z-10">
            <div className="p-3.5 rounded-2xl bg-[#18181b] border border-border/70 flex items-center gap-3 shadow-xs">
              <div className="size-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <Compass className="size-5" />
              </div>
              <div>
                <span className="text-lg font-black text-foreground">{stats.totalTrips}</span>
                <p className="text-[11px] text-muted-foreground font-medium">Itineraries</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#18181b] border border-border/70 flex items-center gap-3 shadow-xs">
              <div className="size-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Globe className="size-5" />
              </div>
              <div>
                <span className="text-lg font-black text-foreground">{stats.totalCountries}</span>
                <p className="text-[11px] text-muted-foreground font-medium">Countries</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#18181b] border border-border/70 flex items-center gap-3 shadow-xs">
              <div className="size-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Calendar className="size-5" />
              </div>
              <div>
                <span className="text-lg font-black text-foreground">{stats.totalDays}</span>
                <p className="text-[11px] text-muted-foreground font-medium">Travel Days</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#18181b] border border-border/70 flex items-center gap-3 shadow-xs">
              <div className="size-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <DollarSign className="size-5" />
              </div>
              <div>
                <span className="text-lg font-black text-foreground">${stats.totalBudget.toLocaleString()}</span>
                <p className="text-[11px] text-muted-foreground font-medium">Total Est. Budget</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Co-Creator Invitations Banner */}
        {pendingInvites.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-[#121215] border border-amber-500/40 space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
              <Bell className="size-4 animate-bounce" />
              <span>Pending Co-Creator Invitations ({pendingInvites.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingInvites.map((invite) => (
                <div key={invite._id} className="p-3.5 rounded-2xl bg-[#18181b] border border-border/70 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <h4 className="font-bold text-foreground truncate">{invite.title}</h4>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-orange-400" />
                      <span>{invite.destination?.city || 'Destination'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRespondToInvite(invite._id, invite.title, 'decline')}
                      disabled={!!respondingId}
                      className="px-2.5 py-1 rounded-lg border border-rose-500/40 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespondToInvite(invite._id, invite.title, 'accept')}
                      disabled={!!respondingId}
                      className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#121215] border border-border/80 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destination, city, or trip theme..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/60 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#18181b] border border-border/80">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'upcoming'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'completed'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('luxury')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'luxury'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Luxury
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#18181b] border border-border/80 text-xs font-semibold text-foreground focus:outline-none focus:border-orange-500/60 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="duration">Longest Duration</option>
              <option value="budget">Budget (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <div className="rounded-3xl p-12 sm:p-16 text-center bg-[#121215] border border-border/80 space-y-4 shadow-lg">
            <div className="size-16 rounded-3xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
              <Compass className="size-8 animate-spin-slow" />
            </div>
            <h2 className="text-xl font-bold text-foreground">No Itineraries Found</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {search
                ? 'No journeys matched your search criteria. Try a different city or destination keyword.'
                : 'Your travel passport is currently empty. Start crafting your first custom journey with WanderSync AI!'}
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Generate First Itinerary</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => {
              const coverImg = getDestinationCoverImage(trip);
              const flag = getCountryFlag(trip.destination?.country);
              const totalDays = trip.durationDays || trip.days?.length || 3;
              const cost = trip.estimatedTotalCost || 0;
              const currency = trip.currency || 'USD';
              const isExporting = exportingId === trip._id;

              return (
                <div
                  key={trip._id}
                  onClick={() => navigate(`/trips/${trip._id}`)}
                  className="group relative rounded-3xl bg-[#121215] border border-border/80 hover:border-orange-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-md hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer"
                >
                  <div>
                    {/* Cover Image Header with Badges */}
                    <div className="h-48 w-full relative overflow-hidden bg-secondary">
                      <img
                        src={coverImg}
                        alt={trip.title}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white border border-white/15 text-xs font-bold flex items-center gap-1.5 shadow-md">
                          {flag && <span className="text-sm leading-none">{flag}</span>}
                          <span>{trip.destination?.country || 'Global'}</span>
                        </span>

                        <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-black shadow-md">
                          ${cost.toLocaleString()} {currency}
                        </span>
                      </div>

                      {/* Bottom Floating Info */}
                      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-0.5 rounded-md bg-orange-500/90 backdrop-blur-md text-white font-bold text-[11px] shadow-sm">
                          {totalDays} Days
                        </span>

                        {trip.budgetLevel && (
                          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-zinc-300 font-semibold text-[10px] border border-white/10">
                            {trip.budgetLevel} Style
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-foreground group-hover:text-orange-400 transition-colors line-clamp-1">
                          {trip.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 truncate font-medium">
                          <MapPin className="size-3.5 text-orange-400 shrink-0" />
                          <span>{trip.destination?.city ? `${trip.destination.city}, ${trip.destination.country}` : 'Destination'}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {trip.overview || 'Comprehensive AI-crafted travel roadmap featuring scenic routes, cultural landmarks, and local gastronomic spots.'}
                      </p>

                      {/* Highlights / Features Tag preview */}
                      {trip.highlights?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {trip.highlights.slice(0, 2).map((hl, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#18181b] text-muted-foreground border border-border/60 text-[10px] truncate max-w-[150px]"
                            >
                              • {hl}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Action Bar */}
                  <div className="p-4 pt-3 border-t border-border/70 flex items-center justify-between text-xs bg-[#0f0f12]">
                    <div className="flex items-center gap-1.5">
                      {/* PDF Export */}
                      <button
                        type="button"
                        onClick={(e) => handleExportPdf(trip, e)}
                        disabled={isExporting}
                        className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Download PDF Itinerary"
                      >
                        <Download className="size-3.5" />
                      </button>

                      {/* Share */}
                      <button
                        type="button"
                        onClick={(e) => handleShare(trip, e)}
                        className="p-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy Share Link"
                      >
                        <Share2 className="size-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(trip._id, trip.title, e)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Delete Itinerary"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* View Details CTA */}
                    <div className="flex items-center gap-1 text-orange-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                      <span>View Itinerary</span>
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

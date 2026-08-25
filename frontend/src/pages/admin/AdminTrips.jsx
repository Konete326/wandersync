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
  Users
} from 'lucide-react';
import {
  getAdminAllTrips,
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

export default function AdminTrips() {
  const navigate = useNavigate();
  const { showModal, showToast } = useModal();

  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [countriesList, setCountriesList] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 8;

  const cacheKey = `trips_${visibility}_${selectedCountry}_${page}_${search}`;
  const initialData = getCachedData(cacheKey);

  const [trips, setTrips] = useState(initialData?.trips || []);
  const [loading, setLoading] = useState(!initialData);
  const [totalPages, setTotalPages] = useState(initialData?.pages || 1);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [inspectTrip, setInspectTrip] = useState(null);

  const loadCountries = async () => {
    try {
      const res = await fetchCountries(1, 100);
      if (res.data?.countries) {
        setCountriesList(res.data.countries);
      }
    } catch {
    }
  };

  const loadTrips = async (pageNum = 1, isBackground = false) => {
    const key = `trips_${visibility}_${selectedCountry}_${pageNum}_${search}`;
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
        selectedCountry
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
  }, [page, visibility, selectedCountry]);

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
  }, [page, visibility, selectedCountry, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadTrips(1);
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
              Live moderation, visibility management, and deep inspection
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

          {(search || visibility !== 'all' || selectedCountry !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setVisibility('all');
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
            No traveler itineraries match the selected search query or visibility filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="rounded-2xl border border-border/80 bg-[#121215] hover:border-orange-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-md group"
            >
              <div>
                
                <div className="relative h-36 w-full overflow-hidden bg-secondary/30">
                  <img
                    src={trip.coverImage?.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&auto=format&fit=crop&q=80'}
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

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    {trip.featured && (
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-500/90 text-zinc-950 text-[9px] font-extrabold flex items-center gap-0.5">
                        <Star className="size-2.5 fill-current" />
                        <span>Featured</span>
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-sm ${
                      trip.isPublic
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-900/80 text-zinc-400 border border-border'
                    }`}>
                      {trip.isPublic ? 'Public' : 'Private'}
                    </span>
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
          ))}
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
                    Created by {inspectTrip.user?.name || 'Traveler'} • {inspectTrip.durationDays} Days • ${inspectTrip.estimatedTotalCost || 0} USD
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  Plus,
  Search,
  MapPin,
  Trash2,
  Edit3,
  Globe,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Luggage,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Timer
} from 'lucide-react';
import { fetchFlights, deleteFlight } from '@/services/flightService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import LazyImage from '@/components/common/LazyImage';
import { getCountryFlag } from '@/utils/worldCountriesData';
import {
  subscribeRealtimeUpdate,
  broadcastRealtimeUpdate,
  getCachedData,
  setCachedData
} from '@/utils/realtimeSync';

const cabinClasses = ['All', 'Economy', 'Premium Economy', 'Business Class', 'First Class'];

const extractAirportCode = (airportStr = '', city = '') => {
  if (!airportStr && !city) return 'AIR';
  const match = airportStr.match(/\b([A-Z]{3})\b/);
  if (match) return match[1];
  const words = (airportStr || city).trim().split(/[\s-]+/);
  if (words.length >= 3) return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  return (city || airportStr).slice(0, 3).toUpperCase();
};

const formatPrice = (p) => {
  if (typeof p === 'number') return `$${p.toLocaleString()}`;
  if (typeof p === 'string') {
    if (p.startsWith('$')) return p;
    if (/^\d+$/.test(p)) return `$${Number(p).toLocaleString()}`;
    return p;
  }
  return '$0';
};

export default function AdminFlights() {
  const navigate = useNavigate();
  const { showModal, showToast } = useModal();

  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCabin, setSelectedCabin] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 6;

  const cacheKey = `flights_${selectedCountry}_${selectedCabin}_${page}_${search}`;
  const initialData = getCachedData(cacheKey);

  const [flights, setFlights] = useState(initialData?.flights || []);
  const [loading, setLoading] = useState(!initialData);
  const [countriesList, setCountriesList] = useState([]);
  const [totalPages, setTotalPages] = useState(initialData?.pages || 1);
  const [total, setTotal] = useState(initialData?.total || 0);

  const loadCountries = async () => {
    try {
      const res = await fetchCountries(1, 100);
      if (res.data?.countries) {
        setCountriesList(res.data.countries);
      }
    } catch {
    }
  };

  const loadFlights = async (pageNum = 1, isBackground = false) => {
    const key = `flights_${selectedCountry}_${selectedCabin}_${pageNum}_${search}`;
    const cached = getCachedData(key);
    if (!isBackground && !cached) {
      setLoading(true);
    }

    try {
      const res = await fetchFlights(
        pageNum,
        limit,
        search,
        selectedCountry,
        '',
        selectedCabin
      );
      if (res.data?.flights) {
        setFlights(res.data.flights);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
        setCachedData(key, res.data);
      } else {
        setFlights([]);
      }
    } catch {
      if (!isBackground) {
        showToast('Could not load flight schedules', 'error');
      }
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    loadFlights(page);
  }, [page, selectedCountry, selectedCabin]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeUpdate('flights', () => {
      loadFlights(page, true);
    });
    const timer = setInterval(() => {
      loadFlights(page, true);
    }, 8000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [page, selectedCountry, selectedCabin, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadFlights(1);
  };

  const handleDelete = (id, flightNumber, airline) => {
    showModal({
      title: 'Cancel & Delete Flight',
      message: `Are you sure you want to permanently cancel and delete flight "${flightNumber || airline}" from the schedule board?`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete Flight',
      onConfirm: async () => {
        setFlights((prev) => prev.filter((f) => f._id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
        try {
          await deleteFlight(id);
          broadcastRealtimeUpdate('flights');
          showToast('Flight deleted from schedule board', 'info');
        } catch {
          showToast('Failed to delete flight schedule', 'error');
          loadFlights(page);
        }
      }
    });
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3.5 font-sans select-none pb-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#121215] border border-border/80 shadow-md">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Plane className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold font-heading text-foreground tracking-tight">
                Flight Schedule Board
              </h1>
              <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                {total} Routes Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage international airline timetables, non-stop routes, luggage policies, and ticket fares
            </p>
          </div>
        </div>

        <GlowingButton
          onClick={() => navigate('/admin/flights/new')}
          className="h-9 px-3.5 text-xs font-semibold"
        >
          <Plus className="size-3.5 mr-1" />
          <span>New Flight Route</span>
        </GlowingButton>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 rounded-2xl bg-[#121215] border border-border/80 shadow-md flex flex-wrap items-center justify-between gap-2.5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by airline, route (e.g. DXB), or flight #..."
            className="w-full h-8 pl-8 pr-3 rounded-xl bg-secondary/40 border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-orange-500/60"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setPage(1);
            }}
            className="h-8 px-2.5 rounded-xl bg-secondary/40 border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 cursor-pointer"
          >
            <option value="All">All Countries</option>
            {countriesList.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedCabin}
            onChange={(e) => {
              setSelectedCabin(e.target.value);
              setPage(1);
            }}
            className="h-8 px-2.5 rounded-xl bg-secondary/40 border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 cursor-pointer"
          >
            {cabinClasses.map((cls) => (
              <option key={cls} value={cls}>{cls === 'All' ? 'All Cabins' : cls}</option>
            ))}
          </select>

          {(search || selectedCountry !== 'All' || selectedCabin !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCountry('All');
                setSelectedCabin('All');
                setPage(1);
              }}
              className="h-8 px-2.5 rounded-xl bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors cursor-pointer border border-border"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Flight Cards Grid */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader text="Loading live flight timetables..." />
        </div>
      ) : flights.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121215] border border-border/80 space-y-3 shadow-md">
          <Plane className="size-10 text-muted-foreground/30 mx-auto animate-bounce" />
          <h3 className="text-sm font-bold text-foreground">No Flight Schedules Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No flight routes match your search filters. Click "New Flight Route" to schedule your first route.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flights.map((flight) => {
            const originCode = extractAirportCode(flight.originAirport, flight.originCity);
            const destCode = extractAirportCode(flight.destinationAirport, flight.destinationCity);
            const originFlag = getCountryFlag(flight.originCountry || flight.originCity);
            const destFlag = getCountryFlag(flight.destinationCountry || flight.destinationCity);

            return (
              <div
                key={flight._id}
                className="group rounded-2xl border border-border/80 hover:border-orange-500/50 bg-[#121215] transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl hover:shadow-orange-500/5 relative"
              >
                <div>
                  {/* Top Image Preview Banner */}
                  <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
                    <LazyImage
                      src={flight.coverImage || flight.images?.[0]}
                      alt={flight.airline}
                      containerClassName="size-full"
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-black/30 to-black/60 pointer-events-none" />

                    {/* Flight Number Badge */}
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 flex items-center gap-1.5 shadow-md">
                      <Plane className="size-3 text-orange-400" />
                      <span className="text-[11px] font-extrabold text-white tracking-wider font-mono">
                        {flight.flightNumber || 'FLIGHT'}
                      </span>
                    </div>

                    {/* Cabin Class Pill */}
                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/15 text-foreground text-[10px] font-bold shadow-md">
                      {flight.cabinClass || 'Economy'}
                    </div>

                    {/* Airline Name & Aircraft Title on Image Base */}
                    <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white leading-tight drop-shadow-md truncate">
                          {flight.airline}
                        </h3>
                        <p className="text-[10px] text-zinc-300 drop-shadow-sm truncate">
                          {flight.aircraft || 'Commercial Aircraft'}
                        </p>
                      </div>
                      <span className="text-xs font-black text-orange-400 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-orange-500/40 shrink-0 shadow-md">
                        {formatPrice(flight.price)}
                      </span>
                    </div>
                  </div>

                  {/* Route & Timetable Boarding Section */}
                  <div className="p-4 space-y-3">
                    <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 relative">
                      <div className="flex items-center justify-between gap-2">
                        {/* Origin Side */}
                        <div className="space-y-0.5 text-left flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{originFlag}</span>
                            <span className="text-lg font-black text-foreground font-mono tracking-tight">
                              {originCode}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-foreground block truncate">
                            {flight.originCity || 'Departure City'}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-orange-400 font-bold">
                            <Clock className="size-2.5" />
                            <span>{flight.departureTime || '08:00 AM'}</span>
                          </div>
                        </div>

                        {/* Mid Trajectory Vector */}
                        <div className="flex flex-col items-center px-2 shrink-0">
                          <span className="text-[10px] font-bold text-muted-foreground font-mono bg-secondary/60 px-2 py-0.5 rounded-full border border-border">
                            {flight.duration || 'Direct'}
                          </span>
                          <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500/40 via-orange-400 to-orange-500/40 relative my-2 flex items-center justify-center">
                            <div className="size-4 rounded-full bg-[#18181b] border border-orange-500/50 flex items-center justify-center shadow-xs">
                              <Plane className="size-2.5 text-orange-400 rotate-90" />
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            {flight.status || 'On-Time'}
                          </span>
                        </div>

                        {/* Destination Side */}
                        <div className="space-y-0.5 text-right flex-1 min-w-0">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-lg font-black text-foreground font-mono tracking-tight">
                              {destCode}
                            </span>
                            <span className="text-sm">{destFlag}</span>
                          </div>
                          <span className="text-[11px] font-semibold text-foreground block truncate">
                            {flight.destinationCity || 'Arrival City'}
                          </span>
                          <div className="flex items-center justify-end gap-1 text-[10px] text-orange-400 font-bold">
                            <Clock className="size-2.5" />
                            <span>{flight.arrivalTime || '04:00 PM'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Strip: Baggage & Specs */}
                    <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground px-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Luggage className="size-3.5 text-orange-400 shrink-0" />
                        <span className="truncate">{flight.baggage || '20 kg Baggage'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 shrink-0">
                        <ShieldCheck className="size-3 text-emerald-400" />
                        <span>Instant e-Ticket</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 pt-2.5 border-t border-border/70 bg-black/20 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/flights/edit/${flight._id}`)}
                    className="flex-1 h-8 rounded-xl bg-secondary/60 hover:bg-orange-500 hover:text-zinc-950 text-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-border hover:border-orange-500 shadow-xs"
                  >
                    <Edit3 className="size-3" />
                    <span>Edit Route</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(flight._id, flight.flightNumber, flight.airline)}
                    className="size-8 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 flex items-center justify-center transition-colors cursor-pointer border border-rose-500/30"
                    title="Remove flight schedule"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-3.5 rounded-2xl bg-[#121215] border border-border/80 flex items-center justify-between text-xs shadow-md">
          <span className="text-muted-foreground">
            Page <span className="font-bold text-foreground">{page}</span> of{' '}
            <span className="font-bold text-foreground">{totalPages}</span> ({total} scheduled flights)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => {
                const newPage = Math.max(page - 1, 1);
                setPage(newPage);
                loadFlights(newPage);
              }}
              className="px-3 py-1 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="size-3.5" />
              <span>Prev</span>
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPage(p);
                    loadFlights(p);
                  }}
                  className={`size-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    page === p
                      ? 'bg-orange-500 text-zinc-950 font-bold shadow-xs'
                      : 'bg-secondary/40 text-muted-foreground hover:text-foreground border border-border hover:border-orange-500/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => {
                const newPage = Math.min(page + 1, totalPages);
                setPage(newPage);
                loadFlights(newPage);
              }}
              className="px-3 py-1 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

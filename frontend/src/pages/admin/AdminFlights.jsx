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
  ExternalLink,
  Luggage,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { fetchFlights, deleteFlight } from '@/services/flightService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

const cabinClasses = ['All', 'Economy', 'Premium Economy', 'Business Class', 'First Class'];

export default function AdminFlights() {
  const navigate = useNavigate();
  const { showModal, showToast } = useModal();

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCabin, setSelectedCabin] = useState('All');
  const [countriesList, setCountriesList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;

  const loadCountries = async () => {
    try {
      const res = await fetchCountries(1, 100);
      if (res.data?.countries) {
        setCountriesList(res.data.countries);
      }
    } catch {
    }
  };

  const loadFlights = async (pageNum = 1) => {
    setLoading(true);
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
      } else {
        setFlights([]);
      }
    } catch {
      showToast('Could not load flight schedules', 'error');
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadFlights(1);
  };

  const handleDelete = (id, flightNumber, airline) => {
    showModal({
      title: 'Remove Scheduled Flight?',
      message: `Are you sure you want to delete flight ${airline} (${flightNumber}) from the global schedule? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteFlight(id);
          showToast(`Flight ${flightNumber} removed successfully`, 'success');
          loadFlights(page);
        } catch {
          showToast('Failed to delete flight', 'error');
        }
      }
    });
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-8">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Plane className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">Flights & Aviation Schedules</h1>
            <p className="text-[11px] text-muted-foreground">
              Manage international routes, cabin classes, and live pricing
            </p>
          </div>
        </div>

        <GlowingButton
          onClick={() => navigate('/admin/flights/new')}
          size="sm"
          innerClassName="py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="size-3.5" />
          <span>New Flight</span>
        </GlowingButton>
      </div>

      <div className="py-1.5 px-3 rounded-xl bg-[#121215] border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search airline, flight code, city..."
            className="w-full pl-8 pr-2.5 h-[30px] rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
          />
        </form>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setPage(1);
            }}
            className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
          >
            <option value="All" className="bg-[#121215] text-foreground">All Destination Countries</option>
            {countriesList.map((c) => (
              <option key={c._id} value={c.name} className="bg-[#121215] text-foreground">{c.name}</option>
            ))}
          </select>

          <select
            value={selectedCabin}
            onChange={(e) => {
              setSelectedCabin(e.target.value);
              setPage(1);
            }}
            className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
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
              className="h-[30px] px-2 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-[11px] font-semibold transition-colors cursor-pointer border border-border/60"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader text="Loading flight routes..." />
        </div>
      ) : flights.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-[#121215] border border-border/80 space-y-2">
          <Plane className="size-8 text-muted-foreground/30 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Flights Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Click "New Flight" to add your first flight route.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {flights.map((flight) => (
            <div
              key={flight._id}
              className="rounded-2xl border border-border/80 bg-[#121215] hover:border-orange-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-md group"
            >
              <div>
                
                <div className="relative h-44 w-full overflow-hidden bg-secondary/30">
                  <img
                    src={flight.coverImage || flight.images?.[0]}
                    alt={flight.airline}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-orange-400 text-[10px] font-bold border border-orange-500/30">
                    {flight.flightNumber}
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-foreground text-[10px] font-semibold border border-white/10">
                    {flight.cabinClass || 'Economy'}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-tight">{flight.airline}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{flight.aircraft}</p>
                    </div>
                    <span className="text-xs font-extrabold text-orange-400 shrink-0 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                      {flight.price}
                    </span>
                  </div>

                  
                  <div className="p-3 rounded-xl bg-secondary/30 border border-border flex items-center justify-between text-xs">
                    <div className="space-y-0.5 text-left">
                      <span className="text-base font-extrabold text-foreground font-mono">{flight.originAirport}</span>
                      <span className="text-[10px] text-muted-foreground block truncate max-w-[80px]">{flight.originCity}</span>
                      <span className="text-[9px] text-orange-400 font-medium block">{flight.departureTime}</span>
                    </div>

                    <div className="flex flex-col items-center px-2">
                      <span className="text-[9px] text-muted-foreground font-mono">{flight.duration}</span>
                      <div className="w-16 h-0.5 bg-border relative my-1 flex items-center justify-center">
                        <Plane className="size-2.5 text-orange-400 absolute" />
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold">{flight.status}</span>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-base font-extrabold text-foreground font-mono">{flight.destinationAirport}</span>
                      <span className="text-[10px] text-muted-foreground block truncate max-w-[80px]">{flight.destinationCity}</span>
                      <span className="text-[9px] text-orange-400 font-medium block">{flight.arrivalTime}</span>
                    </div>
                  </div>

                  
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                    <Luggage className="size-3 text-orange-400 shrink-0" />
                    <span className="truncate">{flight.baggage}</span>
                  </div>
                </div>
              </div>

              
              <div className="p-4 pt-0 border-t border-border/70 mt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/admin/flights/edit/${flight._id}`)}
                  className="flex-1 py-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-foreground text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-border"
                >
                  <Edit3 className="size-3 text-orange-400" />
                  <span>Edit Route</span>
                </button>

                <button
                  onClick={() => handleDelete(flight._id, flight.flightNumber, flight.airline)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors cursor-pointer border border-rose-500/20"
                  title="Remove flight"
                >
                  <Trash2 className="size-3.5" />
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
            <span className="font-bold text-foreground">{totalPages}</span> ({total} scheduled flights)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1 || loading}
              onClick={() => {
                const newPage = Math.max(page - 1, 1);
                setPage(newPage);
                loadFlights(newPage);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
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
                    loadFlights(p);
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
                loadFlights(newPage);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
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

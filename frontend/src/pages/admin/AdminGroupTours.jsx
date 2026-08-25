import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Plus,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Trash2,
  Edit3,
  CreditCard,
  Phone,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles
} from 'lucide-react';
import { fetchGroupTours, deleteGroupTour } from '@/services/groupTourService';
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

const statusOptions = ['All', 'Open', 'Filling Fast', 'Sold Out', 'In Progress', 'Completed'];

export default function AdminGroupTours() {
  const navigate = useNavigate();
  const { showModal, showToast } = useModal();

  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 6;

  const cacheKey = `tours_${selectedCountry}_${selectedStatus}_${page}_${search}`;
  const initialData = getCachedData(cacheKey);

  const [tours, setTours] = useState(initialData?.tours || []);
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

  const loadTours = async (pageNum = 1, isBackground = false) => {
    const key = `tours_${selectedCountry}_${selectedStatus}_${pageNum}_${search}`;
    const cached = getCachedData(key);
    if (!isBackground && !cached) {
      setLoading(true);
    }

    try {
      const res = await fetchGroupTours(
        pageNum,
        limit,
        search,
        selectedCountry,
        selectedStatus
      );
      if (res.data?.tours) {
        setTours(res.data.tours);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
        setCachedData(key, res.data);
      } else {
        setTours([]);
      }
    } catch {
      if (!isBackground) {
        showToast('Could not load group tour packages', 'error');
      }
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    loadTours(page);
  }, [page, selectedCountry, selectedStatus]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeUpdate('group-tours', () => {
      loadTours(page, true);
    });
    const timer = setInterval(() => {
      loadTours(page, true);
    }, 8000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [page, selectedCountry, selectedStatus, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadTours(1);
  };

  const handleDelete = (id, title) => {
    showModal({
      title: 'Delete Tour Package',
      message: `Are you sure you want to permanently delete "${title}" from the active agency catalog?`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete Tour',
      onConfirm: async () => {
        setTours((prev) => prev.filter((t) => t._id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
        try {
          await deleteGroupTour(id);
          broadcastRealtimeUpdate('group-tours');
          showToast('Tour package removed from catalog', 'info');
        } catch {
          showToast('Failed to delete group tour', 'error');
          loadTours(page);
        }
      }
    });
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-8">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Compass className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">Agency Group Tours & Guided Expeditions</h1>
            <p className="text-[11px] text-muted-foreground">
              Organize group packages, allocate capacities, and manage instant ticketing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/tour-pos')}
            className="px-3 py-1.5 rounded-lg bg-[#18181b]/80 hover:bg-[#272730] text-foreground hover:text-orange-400 border border-border/80 hover:border-orange-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CreditCard className="size-3.5 text-orange-400" />
            <span>POS Terminal</span>
          </button>

          <GlowingButton
            onClick={() => navigate('/admin/group-tours/new')}
            size="sm"
            innerClassName="py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>Create Tour</span>
          </GlowingButton>
        </div>
      </div>

      <div className="py-1.5 px-3 rounded-xl bg-[#121215] border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search group tour by title, city, country..."
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
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="h-[30px] px-2.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
          >
            <option key="All" value="All" className="bg-[#121215] text-foreground">All Statuses</option>
            {statusOptions.map((st) => (
              <option key={st} value={st} className="bg-[#121215] text-foreground">{st === 'All' ? 'All Statuses' : st}</option>
            ))}
          </select>

          {(search || selectedCountry !== 'All' || selectedStatus !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCountry('All');
                setSelectedStatus('All');
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
          <Loader text="Loading agency group tours..." />
        </div>
      ) : tours.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-[#121215] border border-border/80 space-y-2">
          <Compass className="size-8 text-muted-foreground/30 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Group Tours Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Click "Create Tour" to create your first organized group tour package.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tours.map((tour) => {
            const seatsRemaining = Math.max(0, tour.totalCapacity - tour.bookedSeats);
            const percentBooked = Math.min(100, Math.round((tour.bookedSeats / tour.totalCapacity) * 100));

            return (
              <div
                key={tour._id}
                className="rounded-2xl border border-border/80 bg-[#121215] hover:border-orange-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-md group"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-secondary/30">
                    <img
                      src={tour.coverImage || tour.images?.[0]}
                      alt={tour.title}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-orange-400 text-[10px] font-bold border border-orange-500/30">
                      {tour.category || 'Group Tour'}
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm ${
                        tour.status === 'Sold Out'
                          ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                          : tour.status === 'Filling Fast'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {tour.status}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <span>{tour.durationDays} Days / {Math.max(1, tour.durationDays - 1)} Nights</span>
                      <span>${tour.pricePerPerson} / Person</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-tight group-hover:text-orange-400 transition-colors">
                        {tour.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="size-2.5 text-orange-400" />
                        <span>{tour.city}, {tour.country}</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-secondary/30 border border-border text-[11px] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3 text-orange-400" /> Tour Window
                        </span>
                        <span className="font-semibold text-foreground">
                          {new Date(tour.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                          {new Date(tour.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="text-right space-y-0.5">
                        <span className="text-muted-foreground">Guide</span>
                        <span className="font-semibold text-foreground block truncate max-w-[90px]">{tour.tourGuideName}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="size-3 text-cyan-400" /> Seats Capacity
                        </span>
                        <span className="font-mono font-bold text-foreground">
                          <span className="text-orange-400">{tour.bookedSeats}</span> / {tour.totalCapacity} ({seatsRemaining} left)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentBooked >= 90 ? 'bg-rose-500' : percentBooked >= 60 ? 'bg-amber-400' : 'bg-orange-500'
                          }`}
                          style={{ width: `${percentBooked}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-border/70 mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/admin/tour-pos?tourId=${tour._id}`)}
                    className="flex-1 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CreditCard className="size-3 text-orange-400" />
                    <span>POS Book</span>
                  </button>

                  <button
                    onClick={() => navigate(`/admin/group-tours/edit/${tour._id}`)}
                    className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-foreground text-xs border border-border cursor-pointer transition-colors"
                    title="Edit Tour Package"
                  >
                    <Edit3 className="size-3.5 text-orange-400" />
                  </button>

                  <button
                    onClick={() => handleDelete(tour._id, tour.title)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs border border-rose-500/20 cursor-pointer transition-colors"
                    title="Delete Package"
                  >
                    <Trash2 className="size-3.5" />
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
            <span className="font-bold text-foreground">{totalPages}</span> ({total} group tour packages)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1 || loading}
              onClick={() => {
                const newPage = Math.max(page - 1, 1);
                setPage(newPage);
                loadTours(newPage);
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
                    loadTours(p);
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
                loadTours(newPage);
              }}
              className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
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

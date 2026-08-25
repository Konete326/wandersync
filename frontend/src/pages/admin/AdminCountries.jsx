import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  MapPin,
  Sparkles,
  ArrowRight,
  Layers
} from 'lucide-react';
import { fetchCountries, deleteCountry } from '@/services/countryService';
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

const continents = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];

export default function AdminCountries() {
  const navigate = useNavigate();
  const { showModal, showToast } = useModal();

  const [continent, setContinent] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const cacheKey = `countries_${continent}_${page}_${search}`;
  const initialData = getCachedData(cacheKey);

  const [countries, setCountries] = useState(initialData?.countries || []);
  const [loading, setLoading] = useState(!initialData);
  const [totalPages, setTotalPages] = useState(initialData?.pages || 1);
  const [total, setTotal] = useState(initialData?.total || 0);

  const loadData = async (pageNum = 1, isBackground = false) => {
    const key = `countries_${continent}_${pageNum}_${search}`;
    const cached = getCachedData(key);
    if (!isBackground && !cached) {
      setLoading(true);
    }

    try {
      const res = await fetchCountries(pageNum, 6, continent, search);
      if (res.data) {
        setCountries(res.data.countries || []);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
        setCachedData(key, res.data);
      }
    } catch {
      if (!isBackground) {
        showToast('Could not load countries catalog', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [continent]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeUpdate('countries', () => {
      loadData(page, true);
    });
    const timer = setInterval(() => {
      loadData(page, true);
    }, 8000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [page, continent, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(1);
  };

  const handleDelete = (id, name) => {
    showModal({
      title: 'Delete Country',
      message: `Are you sure you want to permanently delete "${name}" from the global catalog?`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        setCountries((prev) => prev.filter((c) => c._id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
        try {
          await deleteCountry(id);
          broadcastRealtimeUpdate('countries');
          showToast('Country deleted successfully', 'info');
        } catch {
          showToast('Failed to delete country', 'error');
          loadData(page);
        }
      }
    });
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto min-h-[calc(100vh-5.5rem)] flex flex-col justify-between space-y-3 font-sans select-none pb-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Globe className="size-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-foreground leading-tight">Countries & Cities Catalog</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  {total}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                Manage global countries, regional hubs, and local currencies
              </p>
            </div>
          </div>

          <GlowingButton
            onClick={() => navigate('/admin/countries/new')}
            size="sm"
            innerClassName="py-1 px-2.5 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>Add Country</span>
          </GlowingButton>
        </div>

        <div className="py-1 px-3 rounded-xl bg-[#121215] border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-xs">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country by name, code (e.g. Japan, JP)..."
              className="w-full pl-8 pr-2.5 h-[28px] rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
            />
          </form>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {continents.map((c) => (
                <button
                  key={c}
                  onClick={() => setContinent(c)}
                  className={`h-[28px] px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                    continent === c
                      ? 'border-orange-500/60 bg-orange-500/10 text-orange-400 font-bold shadow-xs'
                      : 'bg-[#18181b]/80 text-muted-foreground hover:text-foreground border-border/80 hover:border-orange-500/30'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {(search || continent !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setContinent('All');
                  setPage(1);
                }}
                className="h-[28px] px-2 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground text-[10px] font-semibold transition-colors cursor-pointer border border-border/60"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader text="Loading countries catalog..." />
          </div>
        ) : countries.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121215] border border-border/80 text-center space-y-2.5 max-w-md mx-auto my-6">
            <Globe className="size-8 text-orange-400 mx-auto" />
            <h3 className="text-xs font-bold text-foreground">No Countries Found</h3>
            <p className="text-[11px] text-muted-foreground">
              {search || continent !== 'All'
                ? 'No destinations match your active filter. Try resetting your search.'
                : 'Your country catalog is empty. Add your first global country and city hub.'}
            </p>
            <div className="pt-1">
              <GlowingButton
                onClick={() => navigate('/admin/countries/new')}
                size="sm"
                innerClassName="py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="size-3.5" />
                <span>Create First Country</span>
              </GlowingButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {countries.map((item) => (
              <div
                key={item._id}
                className="rounded-xl bg-[#121215] border border-border/80 overflow-hidden shadow-xs hover:border-orange-500/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-28 sm:h-32 w-full overflow-hidden">
                    <LazyImage
                      src={item.coverImage}
                      alt={item.name}
                      containerClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/75 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5 shadow-xs">
                        <span className="text-sm leading-none">{getCountryFlag(item.code || item.name)}</span>
                        <span className="uppercase text-[9px]">{item.continent}</span>
                      </span>
                      {item.code && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-orange-500 text-zinc-950">
                          {item.code}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-orange-400 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {item.currency}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
                      {item.description || `Explore the iconic sights, culture, and hubs of ${item.name}.`}
                    </p>

                    {item.images && item.images.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                        {item.images.slice(0, 5).map((img, idx) => (
                          <div key={idx} className="size-6 rounded overflow-hidden border border-border shrink-0">
                            <img src={img} alt={`Scenic ${idx}`} className="size-full object-cover" />
                          </div>
                        ))}
                        {item.images.length > 5 && (
                          <div className="size-6 rounded bg-secondary border border-border flex items-center justify-center text-[9px] font-bold text-orange-400 shrink-0">
                            +{item.images.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    {item.popularCities && item.popularCities.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {item.popularCities.map((c, i) => (
                          <span key={i} className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-secondary/80 text-zinc-300 border border-border">
                            {c.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-3 py-2 bg-secondary/20 border-t border-border/70 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/admin/countries/edit/${item._id}`)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      title="Edit country"
                    >
                      <Edit3 className="size-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.name)}
                      className="p-1 rounded text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete country"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/admin/spots?country=${encodeURIComponent(item.name)}`)}
                    className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Spots</span>
                    <ArrowRight className="size-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Sticky Bottom Pagination */}
      <div className="sticky bottom-0 z-20 mt-4 px-3.5 py-2 rounded-xl bg-[#121215]/95 backdrop-blur-md border border-border/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="text-[11px]">
          Showing <strong className="text-foreground">{total === 0 ? 0 : (page - 1) * 6 + 1}</strong> to{' '}
          <strong className="text-foreground">{Math.min(page * 6, total)}</strong> of{' '}
          <strong className="text-foreground">{total}</strong> countries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1 || loading}
            onClick={() => {
              const newPage = Math.max(page - 1, 1);
              setPage(newPage);
              loadData(newPage);
            }}
            className="h-[28px] px-2.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="size-3" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPage(p);
                  loadData(p);
                }}
                className={`size-6 rounded-md text-[11px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
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
            disabled={page >= totalPages || loading}
            onClick={() => {
              const newPage = Math.min(page + 1, totalPages);
              setPage(newPage);
              loadData(newPage);
            }}
            className="h-[28px] px-2.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

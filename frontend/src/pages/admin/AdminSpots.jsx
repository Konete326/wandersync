import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Navigation,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Globe,
  ArrowRight
} from 'lucide-react';
import { fetchSpots, deleteSpot } from '@/services/spotService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

const spotCategories = ['All', 'Landmark', 'Temple & Shrine', 'Nature & Park', 'Museum', 'Beach', 'Historical Site', 'Viewpoint'];

export default function AdminSpots() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCountry = searchParams.get('country') || 'All';

  const { showModal, showToast } = useModal();

  const [spots, setSpots] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [country, setCountry] = useState(initialCountry);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadCountryOptions = async () => {
      try {
        const res = await fetchCountries(1, 50);
        if (res.data?.countries) {
          setCountriesList(res.data.countries);
        }
      } catch {
      }
    };
    loadCountryOptions();
  }, []);

  const loadData = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchSpots(pageNum, 6, country, '', category, search);
      if (res.data) {
        setSpots(res.data.spots || []);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      }
    } catch {
      showToast('Could not load tourist attractions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [country, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData(1);
  };

  const handleDelete = (id, name) => {
    showModal({
      title: 'Delete Tourist Spot',
      message: `Are you sure you want to delete attraction "${name}"?`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteSpot(id);
          showToast('Tourist spot deleted successfully', 'info');
          loadData(page);
        } catch {
          showToast('Failed to delete spot', 'error');
        }
      }
    });
  };

  return (
    <div className="w-full space-y-4 max-w-7xl mx-auto font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Navigation className="size-3.5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-heading">
              Tourist Areas & Attractions
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
              {total} Spots
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage key cultural landmarks, natural wonders, visiting hours, tickets, and multiple scenic shots
          </p>
        </div>

        <GlowingButton
          onClick={() => navigate('/admin/spots/new')}
          size="sm"
          innerClassName="py-2 px-3.5 text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="size-3.5 text-orange-400" />
          <span>Add Attraction</span>
        </GlowingButton>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-[#121215] p-2.5 rounded-xl border border-border/80">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spot by name, city, landmark..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-[#121215] border border-border/80 rounded-lg px-2.5 py-1 text-xs text-foreground font-semibold focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 cursor-pointer"
          >
            <option value="All" className="bg-[#121215] text-foreground">All Countries</option>
            {countriesList.map((c) => (
              <option key={c._id} value={c.name} className="bg-[#121215] text-foreground">{c.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {spotCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-orange-500 text-zinc-950 font-bold shadow-sm shadow-orange-500/20'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground border border-border hover:border-orange-500/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6-Card Grid */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader text="Loading attractions..." />
        </div>
      ) : spots.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121215] border border-border/80 text-center space-y-3 max-w-md mx-auto">
          <Navigation className="size-10 text-orange-400 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Attractions Found</h3>
          <p className="text-xs text-muted-foreground">
            {search || country !== 'All' || category !== 'All'
              ? 'No tourist attractions match your search filters.'
              : 'Add key tourist spots and landmarks for travelers to explore.'}
          </p>
          <div className="pt-2">
            <GlowingButton
              onClick={() => navigate('/admin/spots/new')}
              size="sm"
              innerClassName="py-2 px-3.5 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Create First Attraction</span>
            </GlowingButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spots.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl bg-[#121215] border border-border/80 overflow-hidden shadow-sm hover:border-orange-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div
                  className="relative h-44 w-full bg-cover bg-center overflow-hidden"
                  style={{ backgroundImage: `url(${item.coverImage})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-black/20 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-black/70 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
                      <Globe className="size-2.5 text-orange-400" />
                      <span>{item.country}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-950/80 backdrop-blur-md text-orange-300 border border-orange-500/30">
                      {item.city}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground group-hover:text-orange-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30 whitespace-nowrap">
                      {item.ticketPrice || 'Free'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-orange-400" /> {item.duration || '2 hours'}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-zinc-300">{item.category}</span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description || 'Verified landmark with high traveler ratings and scenic panoramic views.'}
                  </p>

                  {/* Multi-Photo Thumbnails */}
                  {item.images && item.images.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                      {item.images.slice(0, 5).map((img, idx) => (
                        <div key={idx} className="size-9 rounded-lg overflow-hidden border border-border shrink-0">
                          <img src={img} alt={`Spot ${idx}`} className="size-full object-cover" />
                        </div>
                      ))}
                      {item.images.length > 5 && (
                        <div className="size-9 rounded-lg bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-orange-400 shrink-0">
                          +{item.images.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-secondary/20 border-t border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/admin/spots/edit/${item._id}`)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    title="Edit spot"
                  >
                    <Edit3 className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.name)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete spot"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/admin/hotels?city=${encodeURIComponent(item.city)}`)}
                  className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Nearby Hotels</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mandatory 6-Card Bottom Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/80 text-xs text-muted-foreground">
        <div>
          Showing <strong className="text-foreground">{total === 0 ? 0 : (page - 1) * 6 + 1}</strong> to{' '}
          <strong className="text-foreground">{Math.min(page * 6, total)}</strong> of{' '}
          <strong className="text-foreground">{total}</strong> attractions
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1 || loading}
            onClick={() => {
              const newPage = Math.max(page - 1, 1);
              setPage(newPage);
              loadData(newPage);
            }}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="size-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPage(p);
                  loadData(p);
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
              loadData(newPage);
            }}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

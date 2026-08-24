import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  ArrowRight,
  Search,
  Building,
  Navigation,
  DollarSign
} from 'lucide-react';
import { fetchGalleryItems } from '../services/galleryService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';

export default function Gallery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useModal();

  const [items, setItems] = useState([]);
  const [activeCountry, setActiveCountry] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadGallery = async (pageNum = 1, country = 'All') => {
    setLoading(true);
    try {
      const res = await fetchGalleryItems(pageNum, 12, country === 'All' ? '' : country);
      if (res.data?.items) {
        setItems(res.data.items);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } else {
        setItems([]);
      }
    } catch {
      showToast('Could not load gallery destinations', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery(page, activeCountry);
  }, [page, activeCountry]);

  const uniqueCountries = useMemo(() => {
    const list = new Set(['All']);
    items.forEach((item) => {
      if (item.country) list.add(item.country);
    });
    return Array.from(list);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.country?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-[#fafafa] font-sans pb-16 select-none">
      {/* Top Sticky Filter Bar */}
      <div className="border-b border-border/80 bg-[#121215]/80 backdrop-blur-xl sticky top-14 z-30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
            {uniqueCountries.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setActiveCountry(c);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCountry === c
                    ? 'bg-orange-500 text-zinc-950 font-bold shadow-md shadow-orange-500/20'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/70'
                }`}
              >
                {c === 'All' ? '🌍 All World' : c}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, cities..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-secondary/50 border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="py-28 flex items-center justify-center">
            <Loader text="Loading live global destinations..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-3xl border border-dashed border-border/80 text-center space-y-4 max-w-lg mx-auto bg-card/30">
            <Globe className="size-12 text-orange-400 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">No Destinations Found</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeCountry !== 'All'
                  ? `No verified destinations in ${activeCountry} yet.`
                  : 'The catalog is ready for live destinations. Admin can publish new spots in the Command Center Studio.'}
              </p>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/media/new')}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-2 shadow-md shadow-orange-500/20"
              >
                <span>Add Destination in Studio</span>
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="uiverse-card group cursor-pointer"
                  onClick={() => navigate(`/gallery/${item._id}`)}
                >
                  <div
                    className="uiverse-card-header"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  >
                    <div className="uiverse-card-header-bar">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/10 font-sans flex items-center gap-1">
                        <Globe className="size-2.5 text-orange-400" />
                        <span>{item.country}</span>
                      </span>
                      {item.city && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange-950/80 backdrop-blur-md text-orange-300 border border-orange-500/30">
                          {item.city}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="uiverse-card-body font-sans">
                    <span className="uiverse-card-name group-hover:text-orange-400 transition-colors truncate">
                      {item.title}
                    </span>
                    <div className="uiverse-card-job flex items-center justify-center gap-1">
                      <MapPin className="size-3 text-orange-400 shrink-0" />
                      <span className="truncate">{item.city ? `${item.city}, ${item.country}` : item.location}</span>
                    </div>
                    <div className="uiverse-card-bio">
                      {item.description || 'Curated global destination powered by WanderSync Atlas.'}
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1 text-muted-foreground">
                      <Sparkles className="size-3 text-orange-400" />
                      <span className="text-[11px] text-muted-foreground font-medium">{item.category || 'Curated Destination'}</span>
                    </div>
                  </div>

                  <div className="uiverse-card-footer font-sans">
                    <div className="uiverse-stats">
                      <div className="uiverse-stat">
                        <span className="label">Country</span>
                        <span className="value text-xs truncate max-w-[80px] mx-auto">{item.country}</span>
                      </div>
                      <div className="uiverse-stat">
                        <span className="label">City</span>
                        <span className="value text-xs truncate max-w-[80px] mx-auto">{item.city || 'Region'}</span>
                      </div>
                      <div className="uiverse-stat">
                        <span className="label">Explore</span>
                        <span className="value text-xs text-orange-400 font-bold mx-auto flex items-center justify-center gap-0.5">
                          <span>View Details</span>
                          <ArrowRight className="size-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3.5 rounded-2xl bg-[#121215] border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
                <span className="text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{filteredItems.length}</span> of{' '}
                  <span className="font-bold text-foreground">{total}</span> destinations
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page <= 1 || loading}
                    onClick={() => {
                      const newPage = Math.max(page - 1, 1);
                      setPage(newPage);
                      loadGallery(newPage, activeCountry);
                    }}
                    className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setPage(p);
                          loadGallery(p, activeCountry);
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
                      loadGallery(newPage, activeCountry);
                    }}
                    className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-foreground disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

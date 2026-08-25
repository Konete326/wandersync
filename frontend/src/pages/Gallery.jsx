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
  DollarSign,
  Compass,
  Images,
  Eye
} from 'lucide-react';
import { fetchGalleryItems } from '../services/galleryService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';
import CardGallerySlider from '../components/common/CardGallerySlider';
import LiveWeatherBadge from '../components/common/LiveWeatherBadge';
import { getCountryFlag } from '@/utils/worldCountriesData';
import {
  subscribeRealtimeUpdate,
  getCachedData,
  setCachedData
} from '@/utils/realtimeSync';

export default function Gallery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useModal();

  const [activeCountry, setActiveCountry] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const cacheKey = `user_gallery_${activeCountry}_${page}`;
  const initialData = getCachedData(cacheKey);

  const [items, setItems] = useState(initialData?.items || []);
  const [totalPages, setTotalPages] = useState(initialData?.pages || 1);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [loading, setLoading] = useState(!initialData);

  const loadGallery = async (pageNum = 1, country = 'All', isBackground = false) => {
    const key = `user_gallery_${country}_${pageNum}`;
    const cached = getCachedData(key);
    if (!isBackground && !cached) {
      setLoading(true);
    }
    try {
      const res = await fetchGalleryItems(pageNum, 12, country === 'All' ? '' : country);
      if (res.data?.items) {
        setItems(res.data.items);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
        setCachedData(key, res.data);
      } else {
        setItems([]);
      }
    } catch {
      if (!isBackground) {
        showToast('Could not load gallery destinations', 'error');
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery(page, activeCountry);
  }, [page, activeCountry]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeUpdate('gallery', () => {
      loadGallery(page, activeCountry, true);
    });
    const timer = setInterval(() => {
      loadGallery(page, activeCountry, true);
    }, 10000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
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
      {/* Sticky Filter Bar */}
      <div className="border-b border-border/80 bg-[#121215]/80 backdrop-blur-xl sticky top-14 z-30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="w-full max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto py-1">
            {uniqueCountries.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setActiveCountry(c);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                  activeCountry === c
                    ? 'bg-orange-500 text-zinc-950 font-bold border border-orange-500 shadow-sm shadow-orange-500/20'
                    : 'bg-[#18181b]/80 hover:bg-[#272730] text-muted-foreground hover:text-foreground font-medium border border-border/80 hover:border-zinc-500'
                }`}
              >
                {c === 'All' ? '🌍 Global Catalog' : `${getCountryFlag(c)} ${c}`}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, landmarks, cities..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#18181b]/80 border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="py-28 flex items-center justify-center">
            <Loader text="Loading live global destinations..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-3xl border border-dashed border-border/80 text-center space-y-4 max-w-xl mx-auto bg-card/30">
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
                type="button"
                onClick={() => navigate('/admin/gallery')}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-2 shadow-md shadow-orange-500/20"
              >
                <span>Manage in Gallery Studio</span>
                <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="group relative rounded-2xl bg-[#121215] border border-border/80 hover:border-orange-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-md hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer"
                  onClick={() => navigate(`/gallery/${item._id}`)}
                >
                  <div>
                    {/* Image Gallery Slider Header */}
                    <CardGallerySlider
                      coverImage={item.imageUrl}
                      images={item.images}
                      alt={item.title}
                      containerClassName="h-52 w-full rounded-t-2xl"
                      overlayChildren={
                        <div className="absolute inset-x-3 top-3 flex items-center justify-between pointer-events-none z-10">
                          <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white border border-white/15 text-xs font-bold flex items-center gap-1.5 shadow-md">
                            <span className="text-sm leading-none">{getCountryFlag(item.country)}</span>
                            <span>{item.country}</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            {item.country && (
                              <LiveWeatherBadge
                                locationName={item.city ? `${item.city}, ${item.country}` : item.country}
                              />
                            )}
                            {item.city && (
                              <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-orange-400 border border-orange-500/40 text-[11px] font-bold shadow-md">
                                {item.city}
                              </span>
                            )}
                          </div>
                        </div>
                      }
                    />

                    {/* Card Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-foreground group-hover:text-orange-400 transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                        <span className="text-[10px] font-semibold text-zinc-300 bg-secondary/70 px-2 py-0.5 rounded-md border border-border shrink-0">
                          {item.category || 'Landmark'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 text-orange-400 shrink-0" />
                        <span className="truncate">{item.city ? `${item.city}, ${item.country}` : (item.location || item.country)}</span>
                      </div>

                      <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed pt-1">
                        {item.description || 'Curated luxury travel destination on the WanderSync global atlas.'}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Action Strip */}
                  <div className="p-4 pt-3 border-t border-border/70 flex items-center justify-between text-xs bg-black/20">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Sparkles className="size-3.5 text-orange-400" />
                      <span className="text-[11px] font-medium">
                        {item.images?.length ? `${item.images.length + 1} HD Photos` : 'Curated Spot'}
                      </span>
                    </div>

                    <div className="text-orange-400 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore Spot</span>
                      <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 rounded-2xl bg-[#121215] border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
                <span className="text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{filteredItems.length}</span> of{' '}
                  <span className="font-bold text-foreground">{total}</span> global destinations
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
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
                        type="button"
                        onClick={() => {
                          setPage(p);
                          loadGallery(p, activeCountry);
                        }}
                        className={`size-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer border ${
                          page === p
                            ? 'border-orange-500 bg-orange-500 text-zinc-950 font-bold shadow-xs'
                            : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border hover:border-orange-500/30'
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

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Globe,
  Navigation,
  Building,
  Star,
  ArrowRight,
  Compass,
  Search
} from 'lucide-react';
import { fetchGalleryItems } from '../services/galleryService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';
import GlowingButton from '../components/common/GlowingButton';

const defaultCountries = [
  'All',
  'Japan',
  'Italy',
  'Switzerland',
  'Greece',
  'Canada',
  'Indonesia',
  'France',
  'Iceland'
];

export default function Gallery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showModal, showToast } = useModal();

  const [items, setItems] = useState([]);
  const [activeCountry, setActiveCountry] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState(null);

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
    const list = new Set(defaultCountries);
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

  const handlePlanTripHere = (item) => {
    navigate(`/create?destination=${encodeURIComponent(`${item.city || item.title}, ${item.country}`)}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-[#fafafa] font-sans pb-16">
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
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCountry === c
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/50 font-bold'
                    : 'bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/60 hover:bg-secondary'
                }`}
              >
                {c === 'All' ? '🌍 All Countries' : c}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country, city, spot..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-secondary/50 border border-border/80 text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
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
          <div className="p-16 rounded-3xl border border-dashed border-border/80 text-center space-y-4 max-w-lg mx-auto bg-card/30">
            <Globe className="size-12 text-cyan-400 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">No Destinations Found</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeCountry !== 'All'
                  ? `No verified destinations in ${activeCountry} yet.`
                  : 'The gallery is ready for real destinations. Admin can publish new country spots in the Command Center.'}
              </p>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/media')}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer inline-flex items-center gap-2"
              >
                <span>Upload in Admin Media</span>
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
                  onClick={() => setSelectedDestination(item)}
                >
                  <div
                    className="uiverse-card-header"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  >
                    <div className="uiverse-card-header-bar">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/10 font-sans flex items-center gap-1">
                        <Globe className="size-2.5 text-cyan-400" />
                        <span>{item.country}</span>
                      </span>
                      {item.city && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                          {item.city}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="uiverse-card-body font-sans">
                    <span className="uiverse-card-name group-hover:text-cyan-400 transition-colors truncate">
                      {item.title}
                    </span>
                    <div className="uiverse-card-job flex items-center justify-center gap-1">
                      <MapPin className="size-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{item.city ? `${item.city}, ${item.country}` : item.location}</span>
                    </div>
                    <div className="uiverse-card-bio">
                      {item.description || 'Curated global destination powered by WanderSync Atlas.'}
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1 text-muted-foreground">
                      <Sparkles className="size-3 text-cyan-400" />
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
                        <span className="label">Category</span>
                        <span className="value text-xs truncate max-w-[80px] mx-auto">{item.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-border/80">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3.5 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Prev Page</span>
                </button>
                <span className="text-xs text-muted-foreground px-3">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3.5 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <span>Next Page</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedDestination && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="max-w-3xl w-full rounded-3xl overflow-hidden bg-[#121215] border border-border/80 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="relative h-64 sm:h-72 w-full bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${selectedDestination.imageUrl})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-black/40 to-transparent" />
              <button
                onClick={() => setSelectedDestination(null)}
                className="absolute top-4 right-4 size-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500 text-zinc-950">
                    {selectedDestination.country}
                  </span>
                  <span className="text-xs text-zinc-300 font-semibold">
                    {selectedDestination.city} • {selectedDestination.category}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                  {selectedDestination.title}
                </h2>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <p className="text-muted-foreground leading-relaxed text-sm">
                {selectedDestination.description || `Experience the captivating landmarks, culture, and architecture of ${selectedDestination.city || selectedDestination.title}, ${selectedDestination.country}.`}
              </p>

              {selectedDestination.touristPlaces && selectedDestination.touristPlaces.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Navigation className="size-4 text-cyan-400" />
                    <span>Top Tourist Landmarks & Attractions</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedDestination.touristPlaces.map((spot, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-secondary/40 border border-border/80 space-y-2">
                        {spot.imageUrl && (
                          <img src={spot.imageUrl} alt={spot.name} className="h-28 w-full object-cover rounded-xl" />
                        )}
                        <h5 className="font-bold text-foreground text-xs">{spot.name}</h5>
                        <p className="text-[11px] text-muted-foreground">{spot.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDestination.hotels && selectedDestination.hotels.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-border/70">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Building className="size-4 text-cyan-400" />
                    <span>Recommended Stays & Luxury Accommodations</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedDestination.hotels.map((hotel, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-secondary/40 border border-border/80 space-y-2">
                        {hotel.imageUrl && (
                          <img src={hotel.imageUrl} alt={hotel.name} className="h-28 w-full object-cover rounded-xl" />
                        )}
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-foreground text-xs">{hotel.name}</h5>
                          <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                            <Star className="size-3 fill-amber-400" /> {hotel.rating || 4.8}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{hotel.priceRange || '$$$'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5 bg-secondary/30 border-t border-border/80 flex items-center justify-between gap-4">
              <button
                onClick={() => setSelectedDestination(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close
              </button>
              <GlowingButton
                onClick={() => handlePlanTripHere(selectedDestination)}
                size="sm"
                innerClassName="font-bold flex items-center gap-2"
              >
                <Compass className="size-3.5" />
                <span>Plan Trip to {selectedDestination.city || selectedDestination.title}</span>
              </GlowingButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Compass,
  X,
  Navigation,
  Building,
  Star,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Languages,
  Utensils,
  Lightbulb
} from 'lucide-react';
import { fetchGalleryItems, deleteGalleryItem } from '@/services/galleryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import DestinationCard from '@/components/admin/DestinationCard';

import {
  subscribeRealtimeUpdate,
  broadcastRealtimeUpdate,
  getCachedData,
  setCachedData
} from '@/utils/realtimeSync';

const categories = [
  'All',
  'Landscape',
  'Cultural Heritage',
  'Cityscapes',
  'Coastal',
  'Mountains',
  'Nature',
  'Tropical'
];

export default function AdminGallery() {
  const navigate = useNavigate();
  const { showModal, showToast } = useModal();
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const cacheKey = `gallery_${category}_${page}_${limit}_${search}`;
  const initialData = getCachedData(cacheKey);

  const [items, setItems] = useState(initialData?.items || []);
  const [totalPages, setTotalPages] = useState(initialData?.pages || 1);
  const [total, setTotal] = useState(initialData?.total || 0);
  const [loading, setLoading] = useState(!initialData);

  const [inspectItem, setInspectItem] = useState(null);

  const loadItems = async (pageNum = 1, currentLimit = limit, isBackground = false) => {
    const key = `gallery_${category}_${pageNum}_${currentLimit}_${search}`;
    const cached = getCachedData(key);
    if (!isBackground && !cached) {
      setLoading(true);
    }
    try {
      const res = await fetchGalleryItems(pageNum, currentLimit, '', category, search);
      if (res.data?.items) {
        setItems(res.data.items);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
        setCachedData(key, res.data);
      }
    } catch {
      if (!isBackground) {
        showToast('Could not load destinations catalog', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(1, limit);
  }, [category, limit]);

  useEffect(() => {
    const unsubscribe = subscribeRealtimeUpdate('gallery', () => {
      loadItems(page, limit, true);
    });
    const timer = setInterval(() => {
      loadItems(page, limit, true);
    }, 8000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [page, limit, category, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadItems(1, limit);
  };

  const handleOpenAdd = () => {
    navigate('/admin/media/new');
  };

  const handleOpenEdit = (item) => {
    navigate(`/admin/media/edit/${item._id}`);
  };

  const handleDelete = (id, title = 'this destination') => {
    showModal({
      title: 'Delete Destination',
      message: `Are you sure you want to permanently delete "${title}" and all associated tourist spots and hotel stays?`,
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        setItems((prev) => prev.filter((i) => i._id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
        try {
          await deleteGalleryItem(id);
          broadcastRealtimeUpdate('gallery');
          showToast('Destination deleted from database', 'info');
        } catch {
          showToast('Failed to delete destination', 'error');
          loadItems(page, limit);
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
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground leading-tight">Destinations & Photos Hub</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
                {total}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Manage destination landmarks, photo galleries, and stays
            </p>
          </div>
        </div>

        <GlowingButton
          onClick={handleOpenAdd}
          size="sm"
          innerClassName="py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="size-3.5" />
          <span>Add Destination</span>
        </GlowingButton>
      </div>

      <div className="py-1.5 px-3 rounded-xl bg-[#121215] border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destination, city, or country..."
            className="w-full pl-8 pr-2.5 h-[30px] rounded-lg bg-[#121215] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
          />
        </form>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`h-[30px] px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-orange-500 text-zinc-950 font-bold shadow-xs shadow-orange-500/20'
                    : 'bg-[#18181b]/80 text-muted-foreground hover:text-foreground border border-border/80 hover:border-orange-500/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {(search || category !== 'All World') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategory('All World');
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
          <Loader text="Loading destinations catalog..." />
        </div>
      ) : items.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 sm:p-6 rounded-2xl bg-[#121215] border border-border/80 items-center">
          <div className="space-y-2.5">
            <div className="size-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <ImageIcon className="size-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">No Destinations in This View</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {search || category !== 'All'
                ? `No destinations match filter "${category}" with search "${search}". Try resetting your filters.`
                : 'Your destination catalog is currently empty. Publish new travel landmarks with spots, hotels, and images.'}
            </p>
            <div className="pt-1">
              <GlowingButton
                onClick={handleOpenAdd}
                size="sm"
                innerClassName="py-2 px-3.5 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="size-3.5 text-orange-400" />
                <span>Add First Destination</span>
              </GlowingButton>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 text-foreground font-semibold">
              <Sparkles className="size-3.5 text-orange-400" />
              <span>Destination Guidelines</span>
            </div>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-muted-foreground">
              <li>Upload primary landmark cover photos in 16:9 or landscape format.</li>
              <li>Provide direct tourist attraction photos and descriptions.</li>
              <li>Specify verified hotel names, nightly prices ($/night), and ratings.</li>
              <li>Use Gemini AI Autofill to instantly populate attractions.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <DestinationCard
                key={item._id}
                item={item}
                onInspect={(itm) => setInspectItem(itm)}
                onEdit={(itm) => handleOpenEdit(itm)}
                onDelete={(id, title) => handleDelete(id, title)}
              />
            ))}
          </div>
        </div>
      )}

      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/80 text-xs text-muted-foreground">
        <div>
          Showing <strong className="text-foreground">{total === 0 ? 0 : (page - 1) * limit + 1}</strong> to{' '}
          <strong className="text-foreground">{Math.min(page * limit, total)}</strong> of{' '}
          <strong className="text-foreground">{total}</strong> destinations
        </div>

        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1 || loading}
            onClick={() => {
              const newPage = Math.max(page - 1, 1);
              setPage(newPage);
              loadItems(newPage, limit);
            }}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
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
                  loadItems(p, limit);
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
              loadItems(newPage, limit);
            }}
            className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="max-w-3xl w-full rounded-2xl bg-[#121215] border border-orange-500/30 shadow-2xl space-y-3.5 max-h-[88vh] overflow-y-auto p-4 sm:p-6 font-sans">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {inspectItem.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-foreground mt-1">{inspectItem.title}</h3>
                <p className="text-xs text-muted-foreground">{inspectItem.city}, {inspectItem.country} • {inspectItem.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const editId = inspectItem._id;
                    setInspectItem(null);
                    navigate(`/admin/media/edit/${editId}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold hover:bg-orange-500/20 transition-all cursor-pointer"
                >
                  Edit in Studio
                </button>
                <button
                  onClick={() => setInspectItem(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden border border-border">
                <img
                  src={inspectItem.imageUrl}
                  alt={inspectItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-secondary/40 p-3 rounded-xl border border-border text-[11px]">
                <div>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3 text-orange-400" /> Best Time:
                  </span>
                  <p className="font-bold text-foreground">{inspectItem.bestTimeToVisit || 'Year-round'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3 text-orange-400" /> Ideal Duration:
                  </span>
                  <p className="font-bold text-foreground">{inspectItem.idealDuration || '5-7 Days'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="size-3 text-orange-400" /> Daily Budget:
                  </span>
                  <p className="font-bold text-foreground">{inspectItem.estimatedBudget || '$120-$200/day'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Languages className="size-3 text-orange-400" /> Language:
                  </span>
                  <p className="font-bold text-foreground">{inspectItem.language || 'English'}</p>
                </div>
              </div>

              <div className="p-3 bg-secondary/30 rounded-xl border border-border text-zinc-300 leading-relaxed text-xs">
                {inspectItem.description || 'No description provided.'}
              </div>

              
              <div className="space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Navigation className="size-3.5 text-orange-400" />
                  <span>Tourist Places ({inspectItem.touristPlaces?.length || 0})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inspectItem.touristPlaces?.map((spot, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-secondary/40 border border-border/70 space-y-1">
                      {spot.imageUrl && (
                        <img src={spot.imageUrl} alt={spot.name} className="h-20 w-full object-cover rounded-lg border border-border/60" />
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-bold text-foreground text-xs">{spot.name}</p>
                        <span className="text-[10px] text-orange-400 font-semibold">{spot.ticketPrice || 'Free'}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{spot.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              
              <div className="space-y-2 pt-2.5 border-t border-border/70">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Building className="size-3.5 text-orange-400" />
                  <span>Hotels & Stays ({inspectItem.hotels?.length || 0})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inspectItem.hotels?.map((hotel, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-secondary/40 border border-border/70 space-y-1">
                      {hotel.imageUrl && (
                        <img src={hotel.imageUrl} alt={hotel.name} className="h-20 w-full object-cover rounded-lg border border-border/60" />
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-bold text-foreground text-xs">{hotel.name}</p>
                        <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                          <Star className="size-2.5 fill-amber-400" /> {hotel.rating || 4.8}
                        </span>
                      </div>
                      <p className="text-[11px] text-orange-400 font-semibold">
                        {hotel.pricePerNight || '$180/night'} • {hotel.priceRange || '$$$'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              
              {inspectItem.localFoods?.length > 0 && (
                <div className="space-y-2 pt-2.5 border-t border-border/70">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <Utensils className="size-3.5 text-orange-400" />
                    <span>Local Dishes & Culinary Highlights ({inspectItem.localFoods.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inspectItem.localFoods.map((food, i) => (
                      <div key={i} className="p-2 bg-secondary/40 border border-border/60 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground text-xs">{food.name}</p>
                          <p className="text-[10px] text-muted-foreground">{food.description}</p>
                        </div>
                        <span className="text-[10px] text-orange-400 font-bold">{food.price || '$15'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

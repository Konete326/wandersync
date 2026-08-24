import { useState, useEffect } from 'react';
import {
  MapPin,
  UploadCloud,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Sparkles,
  Globe,
  Building,
  Navigation,
  Eye,
  Star,
  CheckCircle2,
  Compass
} from 'lucide-react';
import {
  fetchGalleryItems,
  uploadGalleryItem,
  deleteGalleryItem,
  autofillDestinationAi
} from '@/services/galleryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

export default function AdminGallery() {
  const { showModal, showToast } = useModal();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inspectItem, setInspectItem] = useState(null);

  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('Japan');
  const [city, setCity] = useState('Kyoto');
  const [locationName, setLocationName] = useState('Kansai Region, Honshu');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Landscape');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [heroUrl, setHeroUrl] = useState('');

  const [touristPlaces, setTouristPlaces] = useState([
    { name: '', imageUrl: '', description: '' }
  ]);
  const [hotels, setHotels] = useState([
    { name: '', imageUrl: '', rating: 4.8, priceRange: '$$$' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const loadItems = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchGalleryItems(pageNum, 6);
      if (res.data?.items) {
        setItems(res.data.items);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      }
    } catch {
      showToast('Could not load destinations catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(page);
  }, [page]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setHeroUrl('');
    }
  };

  const handleAddTouristPlace = () => {
    setTouristPlaces((prev) => [
      ...prev,
      { name: '', imageUrl: '', description: '' }
    ]);
  };

  const handleRemoveTouristPlace = (index) => {
    setTouristPlaces((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTouristPlaceChange = (index, field, value) => {
    setTouristPlaces((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddHotel = () => {
    setHotels((prev) => [
      ...prev,
      { name: '', imageUrl: '', rating: 4.8, priceRange: '$$$' }
    ]);
  };

  const handleRemoveHotel = (index) => {
    setHotels((prev) => prev.filter((_, i) => i !== index));
  };

  const handleHotelChange = (index, field, value) => {
    setHotels((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAiAutofill = async () => {
    if (!country.trim() || !city.trim()) {
      showToast('Please enter both Country and City first', 'warning');
      return;
    }

    setAiGenerating(true);
    try {
      const res = await autofillDestinationAi(country.trim(), city.trim());
      const data = res.data;
      if (data) {
        if (data.title) setTitle(data.title);
        if (data.location) setLocationName(data.location);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);
        if (data.touristPlaces && data.touristPlaces.length > 0) {
          setTouristPlaces(data.touristPlaces);
        }
        if (data.hotels && data.hotels.length > 0) {
          setHotels(data.hotels);
        }
        showToast(`AI generated details for ${city}, ${country}!`, 'success');
      }
    } catch (err) {
      showToast('AI autofill failed. Please enter details manually.', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !country.trim() || !city.trim()) {
      showModal({
        title: 'Missing Details',
        message: 'Please provide a title, country, and city.',
        type: 'warning'
      });
      return;
    }

    if (!selectedFile && !heroUrl.trim()) {
      showModal({
        title: 'Missing Landmark Image',
        message: 'Please select a photo file or provide an image URL for the main destination hero.',
        type: 'warning'
      });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('country', country);
    formData.append('city', city);
    formData.append('location', locationName || `${city}, ${country}`);
    formData.append('description', description);
    formData.append('category', category);

    if (selectedFile) {
      formData.append('image', selectedFile);
    } else if (heroUrl.trim()) {
      formData.append('imageUrl', heroUrl.trim());
    }

    const validTouristPlaces = touristPlaces.filter((p) => p.name.trim());
    formData.append('touristPlaces', JSON.stringify(validTouristPlaces));

    const validHotels = hotels.filter((h) => h.name.trim());
    formData.append('hotels', JSON.stringify(validHotels));

    try {
      await uploadGalleryItem(formData);
      showToast('Destination published to MongoDB Atlas & Cloudinary!', 'success');
      setTitle('');
      setCountry('Japan');
      setCity('');
      setLocationName('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl('');
      setHeroUrl('');
      setTouristPlaces([{ name: '', imageUrl: '', description: '' }]);
      setHotels([{ name: '', imageUrl: '', rating: 4.8, priceRange: '$$$' }]);
      loadItems(1);
    } catch (error) {
      showModal({
        title: 'Upload Failed',
        message: error.response?.data?.message || 'Failed to publish destination.',
        type: 'danger'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showModal({
      title: 'Delete Destination',
      message: 'Are you sure you want to permanently delete this destination, tourist spots, and hotels from Atlas & Cloudinary?',
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteGalleryItem(id);
          showToast('Destination deleted from database', 'info');
          loadItems(page);
        } catch {
          showToast('Failed to delete destination', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
            Global Destinations & Media Hub
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Administer verified destinations, country/city tags, tourist landmarks, and luxury hotels ({total} Live)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full items-start">
        <div className="lg:col-span-5 bg-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Compass className="size-3.5" />
              </div>
              <h2 className="text-sm font-bold text-foreground">Add New Destination</h2>
            </div>
            <button
              type="button"
              onClick={handleAiAutofill}
              disabled={aiGenerating}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Auto-generate spots and hotels with Gemini AI"
            >
              <Sparkles className="size-3" />
              <span>{aiGenerating ? 'AI Thinking...' : 'AI Autofill'}</span>
            </button>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Destination Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kyoto Traditional Odyssey"
                className="w-full px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/80 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Japan"
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/80 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kyoto"
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/80 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Location / Region</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Kansai Region"
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/80 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/80 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  <option value="Landscape">Landscape</option>
                  <option value="Cultural Heritage">Cultural Heritage</option>
                  <option value="Cityscapes">Cityscapes</option>
                  <option value="Coastal">Coastal & Beach</option>
                  <option value="Mountains">Mountains</option>
                  <option value="Nature">Nature & Wildlife</option>
                  <option value="Tropical">Tropical</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground font-medium">Hero Landmark Image</label>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1 text-[11px] text-muted-foreground file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:bg-secondary file:text-foreground cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground">OR</span>
                <input
                  type="url"
                  placeholder="Image URL..."
                  value={heroUrl}
                  onChange={(e) => {
                    setHeroUrl(e.target.value);
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null);
                  }}
                  className="flex-1 px-2.5 py-1 rounded-md bg-secondary/50 border border-border/80 text-xs text-foreground"
                />
              </div>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Hero Preview"
                  className="mt-1 h-20 w-full object-cover rounded-lg border border-border/80"
                />
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Navigation className="size-3 text-cyan-400" />
                  <span>Tourist Places ({touristPlaces.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddTouristPlace}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="size-3" /> Add Spot
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {touristPlaces.map((spot, idx) => (
                  <div key={idx} className="p-2 bg-secondary/30 border border-border/60 rounded-lg space-y-1 relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Spot name (e.g. Fushimi Inari)"
                        value={spot.name}
                        onChange={(e) => handleTouristPlaceChange(idx, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 bg-secondary/60 border border-border/80 rounded text-[11px] text-foreground"
                      />
                      {touristPlaces.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTouristPlace(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="Spot image URL..."
                      value={spot.imageUrl}
                      onChange={(e) => handleTouristPlaceChange(idx, 'imageUrl', e.target.value)}
                      className="w-full px-2 py-1 bg-secondary/60 border border-border/80 rounded text-[11px] text-foreground"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Building className="size-3 text-cyan-400" />
                  <span>Hotels & Stays ({hotels.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddHotel}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="size-3" /> Add Hotel
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {hotels.map((hotel, idx) => (
                  <div key={idx} className="p-2 bg-secondary/30 border border-border/60 rounded-lg space-y-1 relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Hotel name (e.g. Hoshinoya Kyoto)"
                        value={hotel.name}
                        onChange={(e) => handleHotelChange(idx, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 bg-secondary/60 border border-border/80 rounded text-[11px] text-foreground"
                      />
                      {hotels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHotel(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="Hotel image URL..."
                      value={hotel.imageUrl}
                      onChange={(e) => handleHotelChange(idx, 'imageUrl', e.target.value)}
                      className="w-full px-2 py-1 bg-secondary/60 border border-border/80 rounded text-[11px] text-foreground"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-muted-foreground font-medium">Description</label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="2-sentence overview..."
                className="w-full px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/80 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none"
              />
            </div>

            <GlowingButton
              type="submit"
              disabled={submitting}
              className="w-full mt-2"
              innerClassName="py-2 text-xs font-bold flex items-center justify-center gap-2"
            >
              <UploadCloud className="size-3.5" />
              <span>{submitting ? 'Publishing Destination...' : 'Publish to Atlas & Cloudinary'}</span>
            </GlowingButton>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">Published Destinations Catalog</h2>
              <p className="text-[11px] text-muted-foreground">Real-time Cloudinary & Atlas synchronized media entries</p>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-full">
              {total} Total
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <Loader text="Loading destination catalog..." />
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-border/80 text-center space-y-3 bg-card/40">
              <ImageIcon className="size-8 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">No Destinations in Gallery</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Fill in the form on the left or use AI Autofill to publish your first destination country and city.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="uiverse-card group max-w-none"
                  >
                    <div
                      className="uiverse-card-header"
                      style={{ backgroundImage: `url(${item.imageUrl})` }}
                    >
                      <div className="uiverse-card-header-bar">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/10 font-sans flex items-center gap-1">
                          <Globe className="size-2.5 text-cyan-400" />
                          <span>{item.country}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setInspectItem(item)}
                            className="p-1.5 rounded-lg bg-black/70 hover:bg-cyan-600 text-white transition-colors cursor-pointer"
                            title="Inspect spots & hotels"
                          >
                            <Eye className="size-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                            title="Delete destination"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="uiverse-card-body font-sans">
                      <span className="uiverse-card-name group-hover:text-cyan-400 transition-colors truncate">
                        {item.title}
                      </span>
                      <div className="uiverse-card-job flex items-center justify-center gap-1">
                        <MapPin className="size-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{item.city}, {item.country}</span>
                      </div>
                      <div className="uiverse-card-bio">
                        {item.description || 'Verified destination in WanderSync Atlas catalog.'}
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1 text-muted-foreground">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/80 border border-border">
                          {item.touristPlaces?.length || 0} Tourist Spots
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/80 border border-border">
                          {item.hotels?.length || 0} Hotels
                        </span>
                      </div>
                    </div>

                    <div className="uiverse-card-footer font-sans">
                      <div className="uiverse-stats">
                        <div className="uiverse-stat">
                          <span className="label">Country</span>
                          <span className="value text-xs truncate max-w-[70px] mx-auto">{item.country}</span>
                        </div>
                        <div className="uiverse-stat">
                          <span className="label">City</span>
                          <span className="value text-xs truncate max-w-[70px] mx-auto">{item.city}</span>
                        </div>
                        <div className="uiverse-stat">
                          <span className="label">Category</span>
                          <span className="value text-xs truncate max-w-[70px] mx-auto">{item.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-3 border-t border-border/80">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <ChevronLeft className="size-3" />
                    <span>Prev</span>
                  </button>
                  <span className="text-xs text-muted-foreground px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="px-2.5 py-1 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="size-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-2xl p-5 bg-card border border-border shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{inspectItem.title}</h3>
                <p className="text-xs text-muted-foreground">{inspectItem.city}, {inspectItem.country} • {inspectItem.category}</p>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Navigation className="size-3.5 text-cyan-400" />
                  <span>Tourist Places ({inspectItem.touristPlaces?.length || 0})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inspectItem.touristPlaces?.map((spot, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-secondary/40 border border-border/70 space-y-1">
                      {spot.imageUrl && (
                        <img src={spot.imageUrl} alt={spot.name} className="h-20 w-full object-cover rounded-lg" />
                      )}
                      <p className="font-bold text-foreground mt-1">{spot.name}</p>
                      <p className="text-[11px] text-muted-foreground">{spot.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/70">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Building className="size-3.5 text-cyan-400" />
                  <span>Hotels & Stays ({inspectItem.hotels?.length || 0})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {inspectItem.hotels?.map((hotel, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-secondary/40 border border-border/70 space-y-1">
                      {hotel.imageUrl && (
                        <img src={hotel.imageUrl} alt={hotel.name} className="h-20 w-full object-cover rounded-lg" />
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-bold text-foreground">{hotel.name}</p>
                        <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                          <Star className="size-2.5 fill-amber-400" /> {hotel.rating || 4.8}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{hotel.priceRange || '$$$'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

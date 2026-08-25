import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Navigation,
  Plus,
  Trash2,
  X,
  Save,
  Clock,
  DollarSign,
  Images,
  MapPin,
  Globe,
  Sparkles,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import { uploadImage } from '@/services/mediaService';
import { compressImage } from '@/utils/imageCompressor';
import {
  fetchSpotById,
  createSpot,
  updateSpot
} from '@/services/spotService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import ValidatedInput from '@/components/common/ValidatedInput';
import AiAutofillModal from '@/components/admin/AiAutofillModal';
import { broadcastRealtimeUpdate } from '@/utils/realtimeSync';
import { getCitySuggestions } from '@/utils/worldCountriesData';

const spotCategories = [
  'All',
  'Landmark',
  'Natural',
  'Historical',
  'Cultural',
  'Adventure',
  'Beach',
  'Mountain',
  'Urban'
];

const SPOT_PRESETS = [
  {
    name: 'Fushimi Inari-taisha',
    country: 'Japan',
    city: 'Kyoto',
    category: 'Cultural',
    ticketPrice: 'Free',
    duration: '2-3 hours',
    bestTimeToVisit: 'Early Morning / Dusk',
    address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto',
    description: 'Iconic Shinto shrine famed for thousands of vibrant vermilion torii gates winding through sacred mount inari forests.',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Burj Khalifa Sky Deck',
    country: 'United Arab Emirates',
    city: 'Dubai',
    category: 'Landmark',
    ticketPrice: '179 AED (~$49)',
    duration: '1.5-2 hours',
    bestTimeToVisit: 'Sunset (5:30 PM)',
    address: '1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
    description: 'World highest observation deck at level 148 offering breathtaking 360-degree views of Dubai futuristic skyline and the Arabian Gulf.',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Eiffel Tower Summit',
    country: 'France',
    city: 'Paris',
    category: 'Landmark',
    ticketPrice: '€28.30',
    duration: '2 hours',
    bestTimeToVisit: 'Evening Twilight',
    address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
    description: 'Iconic iron lattice tower on the Champ de Mars, offering summit panorama of Paris monuments and hourly night beacon sparkles.',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Badshahi Mosque & Fort',
    country: 'Pakistan',
    city: 'Lahore',
    category: 'Historical',
    ticketPrice: 'Free / 500 PKR Fort',
    duration: '3 hours',
    bestTimeToVisit: 'Late Afternoon',
    address: 'Walled City of Lahore, Punjab, Pakistan',
    description: 'Grand Mughal architectural masterpiece crafted in red sandstone and marble, standing across from the historic Lahore Fort.',
    coverImage: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1200&auto=format&fit=crop&q=80'
  }
];

export default function AdminSpotEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useModal();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [countriesList, setCountriesList] = useState([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [coverMode, setCoverMode] = useState('upload');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const coverFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);

  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [showGalleryUrlInput, setShowGalleryUrlInput] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    category: 'Landmark',
    description: '',
    ticketPrice: 'Free',
    duration: '2-3 hours',
    bestTimeToVisit: 'Morning / Golden Hour',
    address: '',
    coverImage: '',
    images: [],
    featured: false
  });

  useEffect(() => {
    const loadCountryOptions = async () => {
      try {
        const res = await fetchCountries(1, 50);
        if (res.data?.countries) {
          setCountriesList(res.data.countries);
        }
      } catch {}
    };
    loadCountryOptions();
  }, []);

  useEffect(() => {
    if (isEditing) {
      const loadItem = async () => {
        try {
          const res = await fetchSpotById(id);
          if (res.data) {
            setFormData({
              name: res.data.name || '',
              country: res.data.country || '',
              city: res.data.city || '',
              category: res.data.category || 'Landmark',
              description: res.data.description || '',
              ticketPrice: res.data.ticketPrice || 'Free',
              duration: res.data.duration || '2-3 hours',
              bestTimeToVisit: res.data.bestTimeToVisit || 'Morning',
              address: res.data.address || '',
              coverImage: res.data.coverImage || '',
              images: res.data.images || [],
              featured: Boolean(res.data.featured)
            });
            setCoverPreview(res.data.coverImage || '');
          }
        } catch {
          showToast('Failed to load attraction details', 'error');
          navigate('/admin/spots');
        } finally {
          setLoading(false);
        }
      };
      loadItem();
    }
  }, [id, isEditing, navigate, showToast]);

  const handleCoverChange = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      setCoverFile(file);
      try {
        const previewUrl = URL.createObjectURL(file);
        setCoverPreview(previewUrl);
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          setCoverPreview(event.target.result);
        };
        reader.readAsDataURL(file);
      }
      setFormData((prev) => ({ ...prev, coverImage: '' }));
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = '';
      }
    }
  };

  const handleCoverDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverFile(file);
      try {
        const previewUrl = URL.createObjectURL(file);
        setCoverPreview(previewUrl);
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          setCoverPreview(event.target.result);
        };
        reader.readAsDataURL(file);
      }
      setFormData((prev) => ({ ...prev, coverImage: '' }));
    }
  };

  const handleCoverUrlChange = (url) => {
    setFormData((prev) => ({ ...prev, coverImage: url }));
    setCoverFile(null);
    setCoverPreview(url);
  };

  const handleAddGalleryImages = async (files) => {
    if (!files || !files.length) return;
    setUploadingGallery(true);
    try {
      const fileList = Array.from(files);
      const uploadPromises = fileList.map((f) => uploadImage(f, 'wandersync/spots'));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.data?.url).filter(Boolean);
      if (newUrls.length > 0) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
        showToast(`${newUrls.length} spot photo(s) uploaded successfully!`, 'success');
      }
    } catch {
      showToast('Failed to upload some images', 'error');
    } finally {
      setUploadingGallery(false);
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = '';
      }
    }
  };

  const handleAddGalleryUrl = () => {
    if (!galleryUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, galleryUrlInput.trim()]
    }));
    setGalleryUrlInput('');
    setShowGalleryUrlInput(false);
    showToast('Photo URL added to gallery!', 'success');
  };

  const handleRemoveGalleryImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.country.trim() || !formData.city.trim()) {
      showToast('Name, country, and city are mandatory fields', 'warning');
      return;
    }
    if (!coverFile && !formData.coverImage && !coverPreview) {
      showToast('Please upload an attraction cover photo', 'warning');
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append('name', formData.name);
      body.append('country', formData.country);
      body.append('city', formData.city);
      body.append('category', formData.category);
      body.append('description', formData.description);
      body.append('ticketPrice', formData.ticketPrice);
      body.append('duration', formData.duration);
      body.append('bestTimeToVisit', formData.bestTimeToVisit);
      body.append('address', formData.address);
      body.append('featured', String(formData.featured));
      body.append('images', JSON.stringify(formData.images.filter(Boolean)));

      if (coverFile) {
        try {
          const compressedCover = await compressImage(coverFile);
          body.append('image', compressedCover);
        } catch {
          body.append('image', coverFile);
        }
      } else {
        const fallback = formData.coverImage || coverPreview || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80';
        body.append('coverImage', fallback);
      }

      if (isEditing) {
        await updateSpot(id, body);
        broadcastRealtimeUpdate('spots');
        showToast('Tourist spot updated successfully', 'success');
      } else {
        await createSpot(body);
        broadcastRealtimeUpdate('spots');
        showToast('New tourist attraction saved', 'success');
      }
      navigate('/admin/spots');
    } catch {
      showToast('Failed to save tourist spot', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAiGeneratedData = (data) => {
    setFormData((prev) => ({
      ...prev,
      name: data.title || data.name || prev.name,
      country: data.country || prev.country,
      city: data.city || prev.city,
      category: data.category || prev.category,
      description: data.description || prev.description,
      ticketPrice: data.entryFee || data.ticketPrice || prev.ticketPrice,
      duration: data.idealDuration || data.duration || prev.duration,
      bestTimeToVisit: data.bestTimeToVisit || prev.bestTimeToVisit,
      address: data.address || prev.address,
      coverImage: data.coverImage || prev.coverImage,
      images: data.images?.length ? data.images : prev.images
    }));
    if (data.coverImage) {
      setCoverPreview(data.coverImage);
      setCoverFile(null);
    }
  };

  const applySpotPreset = (preset) => {
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      name: preset.name || prev.name,
      country: preset.country || prev.country,
      city: preset.city || prev.city,
      category: preset.category || prev.category,
      ticketPrice: preset.ticketPrice || prev.ticketPrice,
      duration: preset.duration || prev.duration,
      bestTimeToVisit: preset.bestTimeToVisit || prev.bestTimeToVisit,
      address: preset.address || prev.address,
      description: preset.description || prev.description,
      coverImage: preset.coverImage || prev.coverImage
    }));
    if (preset.coverImage) {
      setCoverPreview(preset.coverImage);
      setCoverFile(null);
    }
    showToast(`Auto-filled details for ${preset.name}!`, 'success');
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader text="Loading spot studio..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-12">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/spots')}
            className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <div>
            <h1 className="text-sm font-bold font-heading text-foreground">
              {isEditing ? 'Edit Attraction Details' : 'Create Tourist Attraction / Spot'}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Set landmark tickets, estimated visit duration, and location
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="h-[30px] px-3 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
          >
            <Sparkles className="size-3.5 animate-pulse" />
            <span>Generate by AI</span>
          </button>

          <GlowingButton
            onClick={handleSubmit}
            disabled={saving}
            size="sm"
            innerClassName="h-[30px] px-3 text-xs font-bold flex items-center gap-1.5"
          >
            <Save className="size-3.5 text-orange-400" />
            <span>{saving ? 'Saving...' : isEditing ? 'Update Spot' : 'Save Spot'}</span>
          </GlowingButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 text-orange-400" />
              <h2 className="text-sm font-bold text-foreground">1. Landmark Essentials & Geography</h2>
            </div>
            <span className="text-[10px] text-orange-400/90 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-md font-semibold">
              Instant Preset Auto-Fill
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap mr-1">
                Quick Presets:
              </span>
              {SPOT_PRESETS.map((spot) => (
                <button
                  key={spot.name}
                  type="button"
                  onClick={() => applySpotPreset(spot)}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    formData.name.toLowerCase() === spot.name.toLowerCase()
                      ? 'bg-orange-500 text-zinc-950 font-bold border-orange-500 shadow-xs'
                      : 'bg-[#18181b] hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 border-border/80 hover:border-orange-500/40'
                  }`}
                >
                  {spot.name} ({spot.city})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <ValidatedInput
                    label="Country"
                    required
                    validationType="name"
                    list="country-options"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. Japan"
                  />
                  <datalist id="country-options">
                    {countriesList.map((c) => (
                      <option key={c._id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <ValidatedInput
                    label="City / Area"
                    required
                    validationType="name"
                    list="spot-city-options"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Kyoto"
                  />
                  <datalist id="spot-city-options">
                    {getCitySuggestions(formData.country).map((cityName) => (
                      <option key={cityName} value={cityName} />
                    ))}
                  </datalist>
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                    {getCitySuggestions(formData.country).slice(0, 3).map((cityName) => (
                      <button
                        key={cityName}
                        type="button"
                        onClick={() => setFormData({ ...formData, city: cityName })}
                        className={`px-1.5 py-0.2 rounded text-[9px] font-medium border transition-all cursor-pointer shrink-0 ${
                          formData.city.toLowerCase() === cityName.toLowerCase()
                            ? 'bg-orange-500 text-zinc-950 font-bold border-orange-500'
                            : 'bg-secondary/60 hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 border-border'
                        }`}
                      >
                        {cityName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-orange-500/60"
                  >
                    {spotCategories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  label="Attraction Name"
                  required
                  validationType="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Fushimi Inari-taisha"
                />

                <ValidatedInput
                  label="Ticket / Admission"
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                  placeholder="e.g. Free / $15 / ¥1000"
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                    <Clock className="size-3 text-orange-400" /> Suggested Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 2-3 hours"
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-orange-500/60"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                  <span>Description & Landmark Significance</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="History, iconic sights, and best visiting advice (Optional)..."
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-orange-500/60 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-zinc-300">
                  Primary Spot Photo *
                </label>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#18181b] border border-border/80 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setCoverMode('upload')}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                      coverMode === 'upload'
                        ? 'bg-orange-500 text-zinc-950 font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverMode('url')}
                    className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-all ${
                      coverMode === 'url'
                        ? 'bg-orange-500 text-zinc-950 font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {coverMode === 'url' ? (
                <div className="space-y-2">
                  <div className="relative">
                    <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => handleCoverUrlChange(e.target.value)}
                      placeholder="Paste HTTPS image link..."
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500/60"
                    />
                  </div>
                  {coverPreview && (
                    <div className="relative h-36 w-full rounded-xl overflow-hidden border border-border group">
                      <img src={coverPreview} alt="Preview" className="size-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-black/80 text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                        Live Preview
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCoverDrop}
                  className="relative h-44 w-full rounded-xl border border-dashed border-border/90 hover:border-orange-500/50 bg-[#151518] flex flex-col items-center justify-center overflow-hidden transition-all group"
                >
                  {coverPreview ? (
                    <div className="relative size-full">
                      <img src={coverPreview} alt="Cover Preview" className="size-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-zinc-950 font-bold text-xs cursor-pointer shadow-md">
                          Change Photo
                          <input
                            ref={coverFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverPreview('');
                            setCoverFile(null);
                            setFormData((prev) => ({ ...prev, coverImage: '' }));
                          }}
                          className="p-1 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-white cursor-pointer"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="size-full flex flex-col items-center justify-center p-4 cursor-pointer text-center space-y-1.5">
                      <UploadCloud className="size-6 text-orange-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-foreground">Upload Primary Photo</span>
                      <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP (Drag & Drop)</span>
                      <input
                        ref={coverFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Images className="size-3.5 text-orange-400" />
                <span>Attraction Gallery ({formData.images.length})</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGalleryUrlInput((prev) => !prev)}
                  className="text-[11px] font-semibold text-zinc-400 hover:text-foreground flex items-center gap-1 cursor-pointer"
                >
                  <LinkIcon className="size-3" />
                  <span>Paste URL</span>
                </button>

                <label className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-lg">
                  <Plus className="size-3" />
                  <span>{uploadingGallery ? 'Uploading...' : 'Upload Photos'}</span>
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingGallery}
                    onChange={(e) => handleAddGalleryImages(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {showGalleryUrlInput && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#151518] border border-border/80">
                <input
                  type="text"
                  value={galleryUrlInput}
                  onChange={(e) => setGalleryUrlInput(e.target.value)}
                  placeholder="Paste attraction photo image link..."
                  className="flex-1 px-3 py-1 text-xs bg-secondary/60 border border-border rounded-lg text-foreground focus:outline-none focus:border-orange-500/60"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryUrl}
                  className="px-3 py-1 rounded-lg bg-orange-500 text-zinc-950 font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="size-3" /> Add
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-border group">
                  <img src={imgUrl} alt={`Spot ${idx + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded bg-black/70 text-rose-400 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
          <button
            type="button"
            onClick={() => navigate('/admin/spots')}
            className="px-4 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <GlowingButton
            onClick={handleSubmit}
            disabled={saving}
            size="sm"
            innerClassName="px-4 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Save className="size-3.5 text-orange-400" />
            <span>{saving ? 'Saving...' : isEditing ? 'Update Tourist Spot' : 'Save Tourist Spot'}</span>
          </GlowingButton>
        </div>
      </form>

      <AiAutofillModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        entityType="spot"
        onAutofill={handleAiGeneratedData}
        onDataGenerated={handleAiGeneratedData}
        targetName={formData.name || 'Tourist Spot'}
      />
    </div>
  );
}

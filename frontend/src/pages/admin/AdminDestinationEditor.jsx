import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  UploadCloud,
  X,
  Plus,
  Trash2,
  MapPin,
  Globe,
  Building,
  Navigation,
  Utensils,
  Lightbulb,
  Compass,
  Calendar,
  Clock,
  DollarSign,
  Languages,
  Bus,
  Star,
  CheckCircle2,
  Save,
  ImageIcon,
  Images
} from 'lucide-react';
import { uploadImage } from '@/services/mediaService';
import { compressImage } from '@/utils/imageCompressor';
import {
  uploadGalleryItem,
  updateGalleryItem,
  fetchGalleryItemById,
  autofillDestinationAi
} from '@/services/galleryService';
import { useModal } from '@/context/ModalContext';
import GlowingButton from '@/components/common/GlowingButton';
import Loader from '@/components/common/Loader';
import ValidatedInput from '@/components/common/ValidatedInput';
import AiAutofillModal from '@/components/admin/AiAutofillModal';

const categories = [
  'Landscape',
  'Cultural Heritage',
  'Cityscapes',
  'Coastal',
  'Mountains',
  'Nature',
  'Tropical'
];

export default function AdminDestinationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useModal();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    country: '',
    city: '',
    location: '',
    category: 'Landscape',
    description: '',
    imageUrl: '',
    galleryImages: [],
    bestTimeToVisit: 'Oct - Apr',
    idealDuration: '5-7 Days',
    estimatedBudget: '$120-$180/day',
    currency: 'USD ($)',
    language: 'English / Local',
    transportation: 'Subway, Rail & Taxis',
    featured: false,
    travelTips: ['Carry local currency for small vendors', 'Check visa requirements 30 days prior'],
    touristPlaces: [
      {
        name: '',
        imageUrl: '',
        images: [],
        description: '',
        ticketPrice: 'Free',
        duration: '2-3 hours'
      }
    ],
    hotels: [
      {
        name: '',
        imageUrl: '',
        images: [],
        rating: 4.8,
        priceRange: '$$$',
        pricePerNight: '$180/night',
        amenities: ['Free WiFi', 'Breakfast Included']
      }
    ],
    localFoods: [
      {
        name: '',
        description: '',
        price: '$15'
      }
    ]
  });

  const [primaryFile, setPrimaryFile] = useState(null);
  const [primaryPreview, setPrimaryPreview] = useState('');
  const [uploadingSpotIndex, setUploadingSpotIndex] = useState(null);
  const [uploadingHotelIndex, setUploadingHotelIndex] = useState(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const loadItem = async () => {
        try {
          const res = await fetchGalleryItemById(id);
          if (res.data) {
            setFormData({
              title: res.data.title || '',
              country: res.data.country || '',
              city: res.data.city || '',
              location: res.data.location || '',
              category: res.data.category || 'Landscape',
              description: res.data.description || '',
              imageUrl: res.data.imageUrl || '',
              galleryImages: res.data.galleryImages || [],
              bestTimeToVisit: res.data.bestTimeToVisit || 'Year-round',
              idealDuration: res.data.idealDuration || '5-7 Days',
              estimatedBudget: res.data.estimatedBudget || '$120-$200/day',
              currency: res.data.currency || 'USD ($)',
              language: res.data.language || 'English / Local',
              transportation: res.data.transportation || '',
              featured: Boolean(res.data.featured),
              travelTips: res.data.travelTips?.length ? res.data.travelTips : ['Carry local cash'],
              touristPlaces: res.data.touristPlaces?.length
                ? res.data.touristPlaces.map((p) => ({ ...p, images: p.images || [] }))
                : [{ name: '', imageUrl: '', images: [], description: '', ticketPrice: 'Free', duration: '2 hours' }],
              hotels: res.data.hotels?.length
                ? res.data.hotels.map((h) => ({ ...h, images: h.images || [] }))
                : [{ name: '', imageUrl: '', images: [], rating: 4.8, priceRange: '$$$', pricePerNight: '$180/night', amenities: [] }],
              localFoods: res.data.localFoods?.length ? res.data.localFoods : [{ name: '', description: '', price: '$15' }]
            });
            setPrimaryPreview(res.data.imageUrl || '');
          }
        } catch {
          showToast('Failed to load destination details', 'error');
          navigate('/admin/media');
        } finally {
          setLoading(false);
        }
      };
      loadItem();
    }
  }, [id, isEditing]);

  const handlePrimaryFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setPrimaryFile(compressed);
      setPrimaryPreview(URL.createObjectURL(compressed));
    }
  };

  const handleSpotFileChange = async (index, file) => {
    if (!file) return;
    setUploadingSpotIndex(index);
    try {
      const res = await uploadImage(file, 'wandersync/spots');
      if (res.data?.url) {
        const updated = [...formData.touristPlaces];
        const newUrl = res.data.url;
        if (!updated[index].imageUrl) {
          updated[index].imageUrl = newUrl;
        }
        updated[index].images = [...(updated[index].images || []), newUrl];
        setFormData((prev) => ({ ...prev, touristPlaces: updated }));
        showToast('Tourist attraction image compressed & uploaded', 'success');
      }
    } catch {
      showToast('Failed to upload tourist spot image', 'error');
    } finally {
      setUploadingSpotIndex(null);
    }
  };

  const handleRemoveSpotImage = (spotIndex, imgIndex) => {
    const updated = [...formData.touristPlaces];
    const removedImg = updated[spotIndex].images[imgIndex];
    updated[spotIndex].images = updated[spotIndex].images.filter((_, idx) => idx !== imgIndex);
    if (updated[spotIndex].imageUrl === removedImg) {
      updated[spotIndex].imageUrl = updated[spotIndex].images[0] || '';
    }
    setFormData((prev) => ({ ...prev, touristPlaces: updated }));
  };

  const handleHotelFileChange = async (index, file) => {
    if (!file) return;
    setUploadingHotelIndex(index);
    try {
      const res = await uploadImage(file, 'wandersync/hotels');
      if (res.data?.url) {
        const updated = [...formData.hotels];
        const newUrl = res.data.url;
        if (!updated[index].imageUrl) {
          updated[index].imageUrl = newUrl;
        }
        updated[index].images = [...(updated[index].images || []), newUrl];
        setFormData((prev) => ({ ...prev, hotels: updated }));
        showToast('Hotel photo compressed & uploaded', 'success');
      }
    } catch {
      showToast('Failed to upload hotel photo', 'error');
    } finally {
      setUploadingHotelIndex(null);
    }
  };

  const handleRemoveHotelImage = (hotelIndex, imgIndex) => {
    const updated = [...formData.hotels];
    const removedImg = updated[hotelIndex].images[imgIndex];
    updated[hotelIndex].images = updated[hotelIndex].images.filter((_, idx) => idx !== imgIndex);
    if (updated[hotelIndex].imageUrl === removedImg) {
      updated[hotelIndex].imageUrl = updated[hotelIndex].images[0] || '';
    }
    setFormData((prev) => ({ ...prev, hotels: updated }));
  };

  const handleGalleryUpload = async (files) => {
    if (!files || !files.length) return;
    setUploadingGallery(true);
    try {
      const fileList = Array.from(files);
      const uploadPromises = fileList.map((f) => uploadImage(f, 'wandersync/gallery'));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.data?.url).filter(Boolean);
      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...newUrls]
        }));
        showToast(`${newUrls.length} destination photo(s) compressed & uploaded`, 'success');
      }
    } catch {
      showToast('Failed to upload gallery image', 'error');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const handleAiModalAutofill = (data) => {
    setFormData((prev) => ({
      ...prev,
      title: data.title || prev.title,
      location: data.location || prev.location,
      category: data.category || prev.category,
      description: data.description || prev.description,
      bestTimeToVisit: data.bestTimeToVisit || prev.bestTimeToVisit,
      idealDuration: data.idealDuration || prev.idealDuration,
      estimatedBudget: data.estimatedBudget || prev.estimatedBudget,
      currency: data.currency || prev.currency,
      language: data.language || prev.language,
      transportation: data.transportation || prev.transportation,
      travelTips: data.travelTips?.length ? data.travelTips : prev.travelTips,
      touristPlaces: data.touristPlaces?.length
        ? data.touristPlaces.map((p) => ({ ...p, images: p.images || (p.imageUrl ? [p.imageUrl] : []) }))
        : prev.touristPlaces,
      hotels: data.hotels?.length
        ? data.hotels.map((h) => ({ ...h, images: h.images || (h.imageUrl ? [h.imageUrl] : []) }))
        : prev.hotels,
      localFoods: data.localFoods?.length ? data.localFoods : prev.localFoods
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.country || !formData.city) {
      showToast('Title, country, and city are mandatory fields', 'warning');
      return;
    }
    if (!primaryFile && !formData.imageUrl) {
      showToast('Please upload a primary landmark photo', 'warning');
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('country', formData.country);
      body.append('city', formData.city);
      body.append('location', formData.location || `${formData.city}, ${formData.country}`);
      body.append('category', formData.category);
      body.append('description', formData.description);
      body.append('bestTimeToVisit', formData.bestTimeToVisit);
      body.append('idealDuration', formData.idealDuration);
      body.append('estimatedBudget', formData.estimatedBudget);
      body.append('currency', formData.currency);
      body.append('language', formData.language);
      body.append('transportation', formData.transportation);
      body.append('featured', String(formData.featured));

      body.append('galleryImages', JSON.stringify(formData.galleryImages.filter(Boolean)));
      body.append('travelTips', JSON.stringify(formData.travelTips.filter(Boolean)));
      body.append('touristPlaces', JSON.stringify(formData.touristPlaces.filter((p) => p.name)));
      body.append('hotels', JSON.stringify(formData.hotels.filter((h) => h.name)));
      body.append('localFoods', JSON.stringify(formData.localFoods.filter((f) => f.name)));

      if (primaryFile) {
        const compressed = await compressImage(primaryFile);
        body.append('image', compressed);
      } else if (formData.imageUrl) {
        body.append('imageUrl', formData.imageUrl);
      }

      if (isEditing) {
        await updateGalleryItem(id, body);
        showToast('Destination successfully updated!', 'success');
      } else {
        await uploadGalleryItem(body);
        showToast('New destination published to live catalog!', 'success');
      }
      navigate('/admin/media');
    } catch {
      showToast('Failed to save destination', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader text="Loading destination studio..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-12">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/media')}
            className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Back to Catalog"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold font-heading text-foreground">
                {isEditing ? 'Edit Destination Details' : 'Create New Travel Destination'}
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30">
                {isEditing ? 'Editing' : 'New'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Comprehensive travel builder for landmarks, attractions, hotels, and foods
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
            <span>{saving ? 'Saving...' : isEditing ? 'Update Destination' : 'Publish Destination'}</span>
          </GlowingButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2.5">
            <Compass className="size-4 text-orange-400" />
            <h2 className="text-sm font-bold text-foreground">1. Primary Landmark & Multi-Photo Gallery</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ValidatedInput
                  label="Country"
                  required
                  validationType="name"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. Japan"
                />

                <ValidatedInput
                  label="City / Destination"
                  required
                  validationType="name"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Kyoto"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ValidatedInput
                  label="Destination Title"
                  required
                  validationType="name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Kyoto - Ancient Temples & Bamboo Groves"
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Comprehensive Overview & Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter a rich, engaging overview describing the history, atmosphere, and essence of this travel destination..."
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Primary Landmark Cover Photo *</label>
              <div className="relative h-44 w-full rounded-xl border border-dashed border-border hover:border-orange-500/40 bg-secondary/30 flex flex-col items-center justify-center overflow-hidden transition-colors">
                {primaryPreview ? (
                  <div className="relative size-full group">
                    <img src={primaryPreview} alt="Cover Preview" className="size-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="px-2.5 py-1 rounded-lg bg-orange-500 text-zinc-950 font-bold text-xs cursor-pointer">
                        Change Photo
                        <input type="file" accept="image/*" onChange={handlePrimaryFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="size-full flex flex-col items-center justify-center p-4 cursor-pointer text-center space-y-1.5">
                    <UploadCloud className="size-6 text-orange-400" />
                    <span className="text-xs font-bold text-foreground">Upload Cover Image</span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP (Cloudinary direct)</span>
                    <input type="file" accept="image/*" onChange={handlePrimaryFileChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          
          <div className="pt-3 border-t border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Images className="size-3.5 text-orange-400" />
                <span>Additional Scenic Photos & Panorama ({formData.galleryImages.length})</span>
              </label>
              <label className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                <Plus className="size-3" />
                <span>{uploadingGallery ? 'Uploading...' : 'Add Extra Photos (Multiple)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingGallery}
                  onChange={(e) => handleGalleryUpload(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {formData.galleryImages.map((imgUrl, idx) => (
                <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-border group">
                  <img src={imgUrl} alt={`Scenic ${idx + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded bg-black/70 text-rose-400 hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove image"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2.5">
            <Lightbulb className="size-4 text-orange-400" />
            <h2 className="text-sm font-bold text-foreground">2. Traveler Essentials & Logistics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-300 flex items-center gap-1">
                <Calendar className="size-3 text-orange-400" /> Best Time to Visit
              </label>
              <input
                type="text"
                value={formData.bestTimeToVisit}
                onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                placeholder="e.g. Oct - Apr"
                className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-300 flex items-center gap-1">
                <Clock className="size-3 text-orange-400" /> Ideal Duration
              </label>
              <input
                type="text"
                value={formData.idealDuration}
                onChange={(e) => setFormData({ ...formData, idealDuration: e.target.value })}
                placeholder="e.g. 5-7 Days"
                className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-300 flex items-center gap-1">
                <DollarSign className="size-3 text-orange-400" /> Daily Budget
              </label>
              <input
                type="text"
                value={formData.estimatedBudget}
                onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                placeholder="e.g. $140-$200/day"
                className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-300 flex items-center gap-1">
                <DollarSign className="size-3 text-orange-400" /> Local Currency
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="e.g. JPY (¥) / USD"
                className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-300 flex items-center gap-1">
                <Languages className="size-3 text-orange-400" /> Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                placeholder="e.g. Japanese / English"
                className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-300 flex items-center gap-1">
                <Bus className="size-3 text-orange-400" /> Transit / Pass
              </label>
              <input
                type="text"
                value={formData.transportation}
                onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
                placeholder="e.g. JR Pass & Subway"
                className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-orange-400" />
                <span>Essential Traveler Tips ({formData.travelTips.length})</span>
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, travelTips: [...formData.travelTips, ''] })}
                className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="size-3" /> Add Tip
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {formData.travelTips.map((tip, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-secondary/40 border border-border rounded-lg px-2.5 py-1">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => {
                      const updated = [...formData.travelTips];
                      updated[i] = e.target.value;
                      setFormData({ ...formData, travelTips: updated });
                    }}
                    placeholder={`Traveler tip #${i + 1}...`}
                    className="w-full bg-transparent text-xs text-foreground focus:outline-none"
                  />
                  {formData.travelTips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, travelTips: formData.travelTips.filter((_, idx) => idx !== i) })}
                      className="text-muted-foreground hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
            <div className="flex items-center gap-2">
              <Navigation className="size-4 text-orange-400" />
              <h2 className="text-sm font-bold text-foreground">
                3. Key Tourist Spots & Attractions ({formData.touristPlaces.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  touristPlaces: [
                    ...formData.touristPlaces,
                    { name: '', imageUrl: '', images: [], description: '', ticketPrice: 'Free', duration: '2 hours' }
                  ]
                })
              }
              className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold hover:bg-orange-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3" /> Add Attraction
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {formData.touristPlaces.map((spot, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-secondary/30 border border-border space-y-2.5 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                    Attraction #{i + 1}
                  </span>
                  {formData.touristPlaces.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, touristPlaces: formData.touristPlaces.filter((_, idx) => idx !== i) })}
                      className="p-1 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title="Remove attraction"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-300">Spot Photos (Multiple Upload)</label>
                    <div className="relative h-24 w-full rounded-lg border border-dashed border-border overflow-hidden bg-zinc-900 flex items-center justify-center">
                      {spot.imageUrl ? (
                        <div className="relative size-full group/img">
                          <img src={spot.imageUrl} alt={spot.name} className="size-full object-cover" />
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer">
                            + Add Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleSpotFileChange(i, e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="size-full flex flex-col items-center justify-center p-2 cursor-pointer text-center">
                          {uploadingSpotIndex === i ? (
                            <span className="text-[10px] text-orange-400 animate-pulse">Uploading...</span>
                          ) : (
                            <>
                              <UploadCloud className="size-4 text-orange-400 mb-0.5" />
                              <span className="text-[10px] font-bold text-foreground">Upload Photo</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSpotFileChange(i, e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {spot.images && spot.images.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                        {spot.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="relative size-8 shrink-0 rounded border border-border overflow-hidden group/thumb">
                            <img src={img} alt={`Thumb ${imgIdx}`} className="size-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveSpotImage(i, imgIdx)}
                              className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center cursor-pointer"
                            >
                              <X className="size-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-7 space-y-2">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-zinc-300">Attraction Name *</label>
                      <input
                        type="text"
                        value={spot.name}
                        onChange={(e) => {
                          const updated = [...formData.touristPlaces];
                          updated[i].name = e.target.value;
                          setFormData({ ...formData, touristPlaces: updated });
                        }}
                        placeholder="e.g. Fushimi Inari Shrine"
                        className="w-full px-2.5 py-1 rounded bg-secondary/70 border border-border text-xs text-foreground focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-bold text-zinc-400">Entry Ticket</label>
                        <input
                          type="text"
                          value={spot.ticketPrice || 'Free'}
                          onChange={(e) => {
                            const updated = [...formData.touristPlaces];
                            updated[i].ticketPrice = e.target.value;
                            setFormData({ ...formData, touristPlaces: updated });
                          }}
                          placeholder="e.g. Free / $15"
                          className="w-full px-2 py-1 rounded bg-secondary/70 border border-border text-[11px] text-foreground focus:outline-none"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-bold text-zinc-400">Duration</label>
                        <input
                          type="text"
                          value={spot.duration || '2-3 hours'}
                          onChange={(e) => {
                            const updated = [...formData.touristPlaces];
                            updated[i].duration = e.target.value;
                            setFormData({ ...formData, touristPlaces: updated });
                          }}
                          placeholder="e.g. 2 hours"
                          className="w-full px-2 py-1 rounded bg-secondary/70 border border-border text-[11px] text-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-zinc-300">Spot Description & Highlights</label>
                  <textarea
                    rows={2}
                    value={spot.description}
                    onChange={(e) => {
                      const updated = [...formData.touristPlaces];
                      updated[i].description = e.target.value;
                      setFormData({ ...formData, touristPlaces: updated });
                    }}
                    placeholder="Short description of landmark significance and best view spots..."
                    className="w-full px-2.5 py-1 rounded bg-secondary/70 border border-border text-xs text-foreground focus:outline-none resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
            <div className="flex items-center gap-2">
              <Building className="size-4 text-orange-400" />
              <h2 className="text-sm font-bold text-foreground">
                4. Verified Hotels & Stays ({formData.hotels.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  hotels: [
                    ...formData.hotels,
                    { name: '', imageUrl: '', images: [], rating: 4.8, priceRange: '$$$', pricePerNight: '$180/night', amenities: ['Free WiFi'] }
                  ]
                })
              }
              className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold hover:bg-orange-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3" /> Add Hotel / Stay
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {formData.hotels.map((hotel, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-secondary/30 border border-border space-y-2.5 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                    Stay #{i + 1}
                  </span>
                  {formData.hotels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hotels: formData.hotels.filter((_, idx) => idx !== i) })}
                      className="p-1 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title="Remove hotel"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-300">Hotel Photos (Multiple Upload)</label>
                    <div className="relative h-24 w-full rounded-lg border border-dashed border-border overflow-hidden bg-zinc-900 flex items-center justify-center">
                      {hotel.imageUrl ? (
                        <div className="relative size-full group/himg">
                          <img src={hotel.imageUrl} alt={hotel.name} className="size-full object-cover" />
                          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/himg:opacity-100 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer">
                            + Add Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleHotelFileChange(i, e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <label className="size-full flex flex-col items-center justify-center p-2 cursor-pointer text-center">
                          {uploadingHotelIndex === i ? (
                            <span className="text-[10px] text-orange-400 animate-pulse">Uploading...</span>
                          ) : (
                            <>
                              <UploadCloud className="size-4 text-orange-400 mb-0.5" />
                              <span className="text-[10px] font-bold text-foreground">Upload Photo</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleHotelFileChange(i, e.target.files?.[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {hotel.images && hotel.images.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                        {hotel.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="relative size-8 shrink-0 rounded border border-border overflow-hidden group/hthumb">
                            <img src={img} alt={`Hotel ${imgIdx}`} className="size-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveHotelImage(i, imgIdx)}
                              className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover/hthumb:opacity-100 flex items-center justify-center cursor-pointer"
                            >
                              <X className="size-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-7 space-y-2">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-zinc-300">Hotel Name *</label>
                      <input
                        type="text"
                        value={hotel.name}
                        onChange={(e) => {
                          const updated = [...formData.hotels];
                          updated[i].name = e.target.value;
                          setFormData({ ...formData, hotels: updated });
                        }}
                        placeholder="e.g. Hoshinoya Kyoto"
                        className="w-full px-2.5 py-1 rounded bg-secondary/70 border border-border text-xs text-foreground focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-bold text-zinc-400">Nightly Rate *</label>
                        <input
                          type="text"
                          value={hotel.pricePerNight || '$180/night'}
                          onChange={(e) => {
                            const updated = [...formData.hotels];
                            updated[i].pricePerNight = e.target.value;
                            setFormData({ ...formData, hotels: updated });
                          }}
                          placeholder="$180/night"
                          className="w-full px-1.5 py-1 rounded bg-secondary/70 border border-border text-[11px] text-foreground focus:outline-none"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] font-bold text-zinc-400">Tier</label>
                        <select
                          value={hotel.priceRange || '$$$'}
                          onChange={(e) => {
                            const updated = [...formData.hotels];
                            updated[i].priceRange = e.target.value;
                            setFormData({ ...formData, hotels: updated });
                          }}
                          className="w-full px-1 py-1 rounded bg-secondary/70 border border-border text-[11px] text-foreground focus:outline-none"
                        >
                          <option value="$">$ (Budget)</option>
                          <option value="$$">$$ (Mid)</option>
                          <option value="$$$">$$$ (Upscale)</option>
                          <option value="$$$$">$$$$ (Luxury)</option>
                        </select>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] font-bold text-zinc-400">Rating</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={hotel.rating || 4.8}
                          onChange={(e) => {
                            const updated = [...formData.hotels];
                            updated[i].rating = parseFloat(e.target.value);
                            setFormData({ ...formData, hotels: updated });
                          }}
                          className="w-full px-1.5 py-1 rounded bg-secondary/70 border border-border text-[11px] text-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
            <div className="flex items-center gap-2">
              <Utensils className="size-4 text-orange-400" />
              <h2 className="text-sm font-bold text-foreground">
                5. Local Dishes & Food Specialties ({formData.localFoods.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  localFoods: [...formData.localFoods, { name: '', description: '', price: '$15' }]
                })
              }
              className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold hover:bg-orange-500/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3" /> Add Dish
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {formData.localFoods.map((food, i) => (
              <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border space-y-2 relative">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={food.name}
                    onChange={(e) => {
                      const updated = [...formData.localFoods];
                      updated[i].name = e.target.value;
                      setFormData({ ...formData, localFoods: updated });
                    }}
                    placeholder="Dish Name (e.g. Kyoto Ramen)"
                    className="w-full font-bold bg-transparent text-xs text-foreground focus:outline-none"
                  />
                  {formData.localFoods.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, localFoods: formData.localFoods.filter((_, idx) => idx !== i) })}
                      className="text-muted-foreground hover:text-rose-400 p-0.5 cursor-pointer ml-1"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={food.price || '$15'}
                    onChange={(e) => {
                      const updated = [...formData.localFoods];
                      updated[i].price = e.target.value;
                      setFormData({ ...formData, localFoods: updated });
                    }}
                    placeholder="e.g. $12"
                    className="w-20 px-2 py-0.5 rounded bg-secondary/70 border border-border text-[11px] text-foreground focus:outline-none"
                  />
                  <input
                    type="text"
                    value={food.description}
                    onChange={(e) => {
                      const updated = [...formData.localFoods];
                      updated[i].description = e.target.value;
                      setFormData({ ...formData, localFoods: updated });
                    }}
                    placeholder="Description & best market..."
                    className="flex-1 px-2 py-0.5 rounded bg-secondary/70 border border-border text-[11px] text-foreground focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
          <button
            type="button"
            onClick={() => navigate('/admin/media')}
            className="px-4 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <GlowingButton
            type="submit"
            disabled={saving}
            size="md"
            innerClassName="py-2.5 px-6 text-xs sm:text-sm font-bold flex items-center gap-2"
          >
            <Save className="size-4 text-orange-400" />
            <span>{saving ? 'Publishing to Catalog...' : isEditing ? 'Update Destination' : 'Publish Destination'}</span>
          </GlowingButton>
        </div>
      </form>

      <AiAutofillModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        entityType="destination"
        onAutofill={handleAiModalAutofill}
      />
    </div>
  );
}

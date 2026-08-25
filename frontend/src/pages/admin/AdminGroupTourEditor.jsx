import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Compass,
  Plus,
  Trash2,
  X,
  Save,
  DollarSign,
  Calendar,
  Clock,
  Images,
  MapPin,
  Globe,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { uploadImage } from '@/services/mediaService';
import { compressImage } from '@/utils/imageCompressor';
import {
  fetchGroupTourById,
  createGroupTour,
  updateGroupTour
} from '@/services/groupTourService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import ValidatedInput from '@/components/common/ValidatedInput';
import AiAutofillModal from '@/components/admin/AiAutofillModal';
import { detectLocalCallingCode } from '@/utils/countryDetector';
import { GROUP_TOUR_PRESETS } from '@/utils/entityPresetsData';
import { broadcastRealtimeUpdate } from '@/utils/realtimeSync';

const tourCategories = ['Cultural & Adventure', 'Family Expedition', 'Honeymoon Special', 'Pilgrimage & Sacred', 'Nature & Safari', 'Corporate Retreat'];
const tourStatuses = ['Open', 'Filling Fast', 'Sold Out', 'In Progress', 'Completed'];

export default function AdminGroupTourEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useModal();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [countriesList, setCountriesList] = useState([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    tagline: 'All-inclusive guided group expedition',
    category: 'Cultural & Adventure',
    country: '',
    city: '',
    startDate: '',
    endDate: '',
    durationDays: 7,
    totalCapacity: 20,
    pricePerPerson: 850,
    inclusions: ['Luxury Hotel Stays', 'Daily Buffet Breakfast & Dinners', 'AC Tourist Bus', 'Licensed Guide', 'Monument Tickets'],
    tourGuideName: 'Senior Tour Maestro',
    tourGuidePhone: `${detectLocalCallingCode()} 300 5558687`,
    status: 'Open',
    coverImage: '',
    images: [],
    featured: false
  });

  const [newInclusion, setNewInclusion] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

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

  useEffect(() => {
    if (isEditing) {
      const loadItem = async () => {
        try {
          const res = await fetchGroupTourById(id);
          if (res.data) {
            const d = res.data;
            setFormData({
              title: d.title || '',
              tagline: d.tagline || 'All-inclusive guided group expedition',
              category: d.category || 'Cultural & Adventure',
              country: d.country || '',
              city: d.city || '',
              startDate: d.startDate ? d.startDate.split('T')[0] : '',
              endDate: d.endDate ? d.endDate.split('T')[0] : '',
              durationDays: d.durationDays || 7,
              totalCapacity: d.totalCapacity || 20,
              pricePerPerson: d.pricePerPerson || 850,
              inclusions: d.inclusions || [],
              tourGuideName: d.tourGuideName || 'Senior Tour Maestro',
              tourGuidePhone: d.tourGuidePhone || '+1 (800) 555-TOUR',
              status: d.status || 'Open',
              coverImage: d.coverImage || '',
              images: d.images || [],
              featured: Boolean(d.featured)
            });
            setCoverPreview(d.coverImage || '');
          }
        } catch {
          showToast('Failed to load group tour package', 'error');
          navigate('/admin/group-tours');
        } finally {
          setLoading(false);
        }
      };
      loadItem();
    }
  }, [id, isEditing]);

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setCoverFile(compressed);
      setCoverPreview(URL.createObjectURL(compressed));
    }
  };

  const handleAddInclusion = () => {
    if (!newInclusion.trim()) return;
    setFormData((prev) => ({
      ...prev,
      inclusions: [...prev.inclusions, newInclusion.trim()]
    }));
    setNewInclusion('');
  };

  const handleRemoveInclusion = (index) => {
    setFormData((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  const handleAddGalleryImages = async (files) => {
    if (!files || !files.length) return;
    setUploadingGallery(true);
    try {
      const fileList = Array.from(files);
      const uploadPromises = fileList.map((f) => uploadImage(f, 'wandersync/tours'));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.data?.url).filter(Boolean);
      if (newUrls.length > 0) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
        showToast(`${newUrls.length} tour photo(s) uploaded`, 'success');
      }
    } catch {
      showToast('Failed to upload tour images', 'error');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.country || !formData.city || !formData.startDate || !formData.endDate || !formData.pricePerPerson) {
      showToast('Title, destination, tour dates, and seat pricing are required', 'warning');
      return;
    }
    if (!coverFile && !formData.coverImage) {
      showToast('Please upload a tour cover image', 'warning');
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('tagline', formData.tagline);
      body.append('category', formData.category);
      body.append('country', formData.country);
      body.append('city', formData.city);
      body.append('startDate', formData.startDate);
      body.append('endDate', formData.endDate);
      body.append('durationDays', String(formData.durationDays));
      body.append('totalCapacity', String(formData.totalCapacity));
      body.append('pricePerPerson', String(formData.pricePerPerson));
      body.append('tourGuideName', formData.tourGuideName);
      body.append('tourGuidePhone', formData.tourGuidePhone);
      body.append('status', formData.status);
      body.append('featured', String(formData.featured));
      body.append('inclusions', JSON.stringify(formData.inclusions));
      body.append('images', JSON.stringify(formData.images.filter(Boolean)));

      if (coverFile) {
        const compressedCover = await compressImage(coverFile);
        body.append('image', compressedCover);
      } else {
        const fallback = formData.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80';
        body.append('coverImage', fallback);
      }

      if (isEditing) {
        await updateGroupTour(id, body);
        broadcastRealtimeUpdate('group-tours');
        showToast('Group tour package updated successfully', 'success');
      } else {
        await createGroupTour(body);
        broadcastRealtimeUpdate('group-tours');
        showToast('New group tour published to agency catalog', 'success');
      }
      navigate('/admin/group-tours');
    } catch {
      showToast('Failed to save group tour', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAiAutofill = (data) => {
    setFormData((prev) => ({
      ...prev,
      title: data.title || prev.title,
      country: data.destinationCountry || prev.country,
      city: data.destinationCity || prev.city,
      durationDays: data.durationDays || prev.durationDays,
      totalCapacity: data.maxGroupSize || prev.totalCapacity,
      pricePerPerson: data.discountPrice || data.price || prev.pricePerPerson,
      category: data.category || prev.category,
      inclusions: data.included?.length ? data.included : prev.inclusions
    }));
  };

  const applyGroupTourPreset = (preset) => {
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      title: preset.title || prev.title,
      tagline: preset.tagline || prev.tagline,
      category: preset.category || prev.category,
      country: preset.country || prev.country,
      city: preset.city || prev.city,
      durationDays: preset.durationDays || prev.durationDays,
      totalCapacity: preset.totalCapacity || prev.totalCapacity,
      pricePerPerson: preset.pricePerPerson || prev.pricePerPerson,
      tourGuideName: preset.tourGuideName || prev.tourGuideName,
      tourGuidePhone: preset.tourGuidePhone || prev.tourGuidePhone,
      coverImage: preset.coverImage || prev.coverImage,
      inclusions: preset.inclusions?.length ? preset.inclusions : prev.inclusions
    }));
    if (preset.coverImage) {
      setCoverPreview(preset.coverImage);
    }
    showToast(`Auto-filled package for ${preset.title}!`, 'success');
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader text="Loading group tour studio..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-12">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/group-tours')}
            className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">
              {isEditing ? `Edit Group Tour: ${formData.title}` : 'Design New Agency Group Tour'}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Set multi-day group itinerary, capacity limits, package inclusions, and pricing
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
            <span>{saving ? 'Saving...' : isEditing ? 'Update Tour' : 'Publish Tour'}</span>
          </GlowingButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-orange-400" />
              <h2 className="text-sm font-bold text-foreground">1. Group Tour Core Details</h2>
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
              {GROUP_TOUR_PRESETS.map((tour) => (
                <button
                  key={tour.title}
                  type="button"
                  onClick={() => applyGroupTourPreset(tour)}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    formData.title.toLowerCase() === tour.title.toLowerCase()
                      ? 'bg-orange-500 text-zinc-950 font-bold border-orange-500 shadow-xs'
                      : 'bg-[#18181b] hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 border-border/80 hover:border-orange-500/40'
                  }`}
                >
                  {tour.country}: {tour.durationDays}D Expedition
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-3">
              <ValidatedInput
                label="Group Tour Package Title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 7-Day Turkey Cultural & Cappadocia Balloon Caravan"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ValidatedInput
                  label="Tagline / Highlights Hook"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="All-inclusive guided group expedition"
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Tour Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 min-h-[38px] rounded-xl bg-secondary/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none cursor-pointer"
                  >
                    {tourCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <ValidatedInput
                    label="Destination Country"
                    required
                    validationType="name"
                    list="country-group-options"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. Turkey"
                  />
                  <datalist id="country-group-options">
                    {countriesList.map((c) => (
                      <option key={c._id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <ValidatedInput
                  label="City / Hub Region"
                  required
                  validationType="name"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Istanbul & Cappadocia"
                />

                <ValidatedInput
                  label="Total Duration (Days)"
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value, 10) || 1 })}
                  placeholder="7"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  label="Start Date"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />

                <ValidatedInput
                  label="End Date"
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />

                <ValidatedInput
                  label="Total Group Capacity (Seats)"
                  type="number"
                  required
                  value={formData.totalCapacity}
                  onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value, 10) || 1 })}
                  placeholder="20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  label="Seat Price / Person ($ USD)"
                  type="number"
                  required
                  value={formData.pricePerPerson}
                  onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) || 0 })}
                  placeholder="850"
                />

                <ValidatedInput
                  label="Lead Tour Guide Name"
                  value={formData.tourGuideName}
                  onChange={(e) => setFormData({ ...formData, tourGuideName: e.target.value })}
                  placeholder="e.g. Ahmed Al-Mansoor"
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Package Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 min-h-[38px] rounded-xl bg-secondary/60 border border-border text-xs sm:text-sm text-foreground focus:outline-none cursor-pointer"
                  >
                    {tourStatuses.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Tour Primary Cover Photo *</label>
              <div className="relative h-56 w-full rounded-xl border border-dashed border-border hover:border-orange-500/40 bg-secondary/30 flex flex-col items-center justify-center overflow-hidden transition-colors">
                {coverPreview ? (
                  <div className="relative size-full group">
                    <img src={coverPreview} alt="Cover Preview" className="size-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="px-2.5 py-1 rounded-lg bg-orange-500 text-zinc-950 font-bold text-xs cursor-pointer">
                        Change Photo
                        <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="size-full flex flex-col items-center justify-center p-4 cursor-pointer text-center space-y-1.5">
                    <UploadCloud className="size-6 text-orange-400" />
                    <span className="text-xs font-bold text-foreground">Upload Tour Cover</span>
                    <span className="text-[10px] text-muted-foreground">Auto-compressed</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          
          <div className="pt-4 border-t border-border/70 space-y-3">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="size-3.5 text-orange-400" />
              <span>Package Perks & Inclusions ({formData.inclusions.length})</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInclusion();
                  }
                }}
                placeholder="e.g. 5-Star Hotel, Buffet Breakfast, Airport Transfers, Entry Tickets"
                className="flex-1 px-3.5 py-2 min-h-[38px] rounded-xl bg-secondary/50 border border-border text-xs sm:text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
              <button
                type="button"
                onClick={handleAddInclusion}
                className="px-3.5 py-2 min-h-[38px] rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border cursor-pointer flex items-center gap-1"
              >
                <Plus className="size-3.5 text-orange-400" />
                <span>Add Perk</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {formData.inclusions.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-secondary/60 border border-border text-xs text-foreground flex items-center gap-1.5 group"
                >
                  <CheckCircle2 className="size-3 text-emerald-400" />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInclusion(idx)}
                    className="text-muted-foreground hover:text-rose-400 cursor-pointer ml-1"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          
          <div className="pt-3 border-t border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Images className="size-3.5 text-orange-400" />
                <span>Tour Scenic Photo Gallery ({formData.images.length})</span>
              </label>
              <label className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                <Plus className="size-3" />
                <span>{uploadingGallery ? 'Uploading...' : 'Add Photos (Multiple)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingGallery}
                  onChange={(e) => handleAddGalleryImages(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-border group">
                  <img src={imgUrl} alt={`Tour ${idx + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded bg-black/70 text-rose-400 opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      <AiAutofillModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        entityType="groupTour"
        onAutofill={handleAiAutofill}
      />
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Globe,
  Plus,
  Trash2,
  X,
  Save,
  Languages,
  DollarSign,
  Clock,
  Images,
  MapPin,
  Sparkles,
  ChevronDown,
  Search,
  Check,
  Zap
} from 'lucide-react';
import { uploadImage } from '@/services/mediaService';
import { compressImage } from '@/utils/imageCompressor';
import {
  fetchCountryById,
  createCountry,
  updateCountry
} from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import ValidatedInput from '@/components/common/ValidatedInput';
import AiAutofillModal from '@/components/admin/AiAutofillModal';
import { WORLD_COUNTRIES, findCountryPreset } from '@/utils/worldCountriesData';
import { broadcastRealtimeUpdate } from '@/utils/realtimeSync';

const continents = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];

const popularPresetChips = [
  'Pakistan',
  'Japan',
  'United Arab Emirates',
  'Switzerland',
  'Turkey',
  'Saudi Arabia',
  'United States',
  'United Kingdom',
  'France',
  'Italy',
  'Spain'
];

const CURRENCY_SUGGESTIONS = [
  'PKR (Rs)',
  'USD ($)',
  'EUR (€)',
  'GBP (£)',
  'AED (د.إ)',
  'SAR (﷼)',
  'TRY (₺)',
  'JPY (¥)',
  'CHF (Fr.)',
  'AUD ($)',
  'CAD ($)',
  'SGD ($)',
  'MYR (RM)',
  'THB (฿)',
  'QAR (QR)'
];

const LANGUAGE_SUGGESTIONS = [
  'Urdu / English',
  'English',
  'Arabic / English',
  'Japanese',
  'German / French / Italian',
  'Turkish',
  'French',
  'Spanish',
  'Italian',
  'German',
  'Thai',
  'Malay / English',
  'Indonesian',
  'Mandarin'
];

const TIMEZONE_SUGGESTIONS = [
  'UTC+5 (PKT)',
  'UTC+4 (GST)',
  'UTC+3 (AST/TRT)',
  'UTC+0 (GMT)',
  'UTC+1 (CET)',
  'UTC+2 (EET)',
  'UTC+7 (ICT)',
  'UTC+8 (SGT/MYT)',
  'UTC+9 (JST)',
  'UTC+10 (AEST)',
  'UTC-5 (EST)',
  'UTC-8 (PST)'
];

export default function AdminCountryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useModal();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingCityIndex, setUploadingCityIndex] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countryFilter, setCountryFilter] = useState('');
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    continent: 'Asia',
    currency: 'USD ($)',
    language: 'English',
    timezone: 'UTC+9',
    description: '',
    coverImage: '',
    images: [],
    popularCities: [{ name: '', description: '', images: [] }],
    featured: false
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing) {
      const loadItem = async () => {
        try {
          const res = await fetchCountryById(id);
          if (res.data) {
            setFormData({
              name: res.data.name || '',
              code: res.data.code || '',
              continent: res.data.continent || 'Asia',
              currency: res.data.currency || 'USD ($)',
              language: res.data.language || 'English',
              timezone: res.data.timezone || 'UTC',
              description: res.data.description || '',
              coverImage: res.data.coverImage || '',
              images: res.data.images || [],
              popularCities: res.data.popularCities?.length
                ? res.data.popularCities.map((c) => ({
                    name: c.name || '',
                    description: c.description || '',
                    images: c.images || (c.coverImage ? [c.coverImage] : [])
                  }))
                : [{ name: '', description: '', images: [] }],
              featured: Boolean(res.data.featured)
            });
            setCoverPreview(res.data.coverImage || '');
          }
        } catch {
          showToast('Failed to load country details', 'error');
          navigate('/admin/countries');
        } finally {
          setLoading(false);
        }
      };
      loadItem();
    }
  }, [id, isEditing]);

  const applyCountryPreset = (preset, notify = true) => {
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      name: preset.name || prev.name,
      code: preset.code || prev.code,
      continent: preset.continent || prev.continent,
      currency: preset.currency || prev.currency,
      language: preset.language || prev.language,
      timezone: preset.timezone || prev.timezone,
      description: preset.description || prev.description,
      coverImage: preset.coverImage || prev.coverImage,
      popularCities: preset.popularCities?.length
        ? preset.popularCities.map((c) => ({
            name: c.name || '',
            description: c.description || '',
            images: c.images || []
          }))
        : prev.popularCities
    }));
    if (preset.coverImage) {
      setCoverPreview(preset.coverImage);
    }
    setCountryDropdownOpen(false);
    if (notify) {
      showToast(`Auto-filled country telemetry for ${preset.name}!`, 'success');
    }
  };

  const handleCountryNameChange = (val) => {
    setFormData((prev) => ({ ...prev, name: val }));
    setCountryFilter(val);
    const matched = findCountryPreset(val);
    if (matched && matched.name.toLowerCase() === val.trim().toLowerCase()) {
      applyCountryPreset(matched, false);
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setCoverFile(compressed);
      setCoverPreview(URL.createObjectURL(compressed));
    }
  };

  const handleAddGalleryImages = async (files) => {
    if (!files || !files.length) return;
    setUploadingGallery(true);
    try {
      const fileList = Array.from(files);
      const uploadPromises = fileList.map((f) => uploadImage(f, 'wandersync/countries'));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.data?.url).filter(Boolean);
      if (newUrls.length > 0) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
        showToast(`${newUrls.length} scenic photo(s) compressed & uploaded`, 'success');
      }
    } catch {
      showToast('Failed to upload some images', 'error');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddCityImages = async (cityIndex, files) => {
    if (!files || !files.length) return;
    const currentImages = formData.popularCities[cityIndex]?.images || [];
    const remainingSlots = 3 - currentImages.length;
    if (remainingSlots <= 0) {
      showToast('Maximum 3 photos allowed per city', 'warning');
      return;
    }
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploadingCityIndex(cityIndex);
    try {
      const uploadPromises = filesToUpload.map(async (f) => {
        const compressed = await compressImage(f);
        return uploadImage(compressed, 'wandersync/cities');
      });
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.data?.url).filter(Boolean);
      if (newUrls.length > 0) {
        setFormData((prev) => {
          const updatedCities = [...prev.popularCities];
          const existingImgs = updatedCities[cityIndex].images || [];
          updatedCities[cityIndex] = {
            ...updatedCities[cityIndex],
            images: [...existingImgs, ...newUrls].slice(0, 3)
          };
          return { ...prev, popularCities: updatedCities };
        });
        showToast(`${newUrls.length} city photo(s) uploaded`, 'success');
      }
    } catch {
      showToast('Failed to upload city photos', 'error');
    } finally {
      setUploadingCityIndex(null);
    }
  };

  const handleRemoveCityImage = (cityIndex, imgIndexToRemove) => {
    setFormData((prev) => {
      const updatedCities = [...prev.popularCities];
      const existingImgs = updatedCities[cityIndex].images || [];
      updatedCities[cityIndex] = {
        ...updatedCities[cityIndex],
        images: existingImgs.filter((_, idx) => idx !== imgIndexToRemove)
      };
      return { ...prev, popularCities: updatedCities };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Country name is required', 'warning');
      return;
    }
    if (!coverFile && !formData.coverImage) {
      showToast('Please upload a primary cover image for the country', 'warning');
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append('name', formData.name);
      body.append('code', formData.code);
      body.append('continent', formData.continent);
      body.append('currency', formData.currency);
      body.append('language', formData.language);
      body.append('timezone', formData.timezone);
      body.append('description', formData.description);
      body.append('featured', String(formData.featured));
      body.append('popularCities', JSON.stringify(formData.popularCities.filter((c) => c.name.trim())));
      body.append('images', JSON.stringify(formData.images.filter(Boolean)));

      if (coverFile) {
        const compressedCover = await compressImage(coverFile);
        body.append('image', compressedCover);
      } else {
        const fallbackCover = formData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80';
        body.append('coverImage', fallbackCover);
      }

      if (isEditing) {
        await updateCountry(id, body);
        broadcastRealtimeUpdate('countries');
        showToast('Country details updated successfully', 'success');
      } else {
        await createCountry(body);
        broadcastRealtimeUpdate('countries');
        showToast('New country added to global directory', 'success');
      }
      navigate('/admin/countries');
    } catch {
      showToast('Failed to save country record', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAiAutofill = (data) => {
    const aiCover = data.coverImage || formData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80';
    setFormData((prev) => ({
      ...prev,
      name: data.name || prev.name,
      code: data.code || prev.code,
      continent: data.continent || prev.continent,
      currency: data.currency || prev.currency,
      language: data.language || prev.language,
      timezone: data.timezone || prev.timezone,
      description: data.description || prev.description,
      coverImage: aiCover,
      popularCities: data.popularCities?.length
        ? data.popularCities.map((c) => ({
            name: c.name || '',
            description: c.description || '',
            images: c.images || []
          }))
        : prev.popularCities
    }));
    if (aiCover) {
      setCoverPreview(aiCover);
    }
  };

  const filteredCountriesList = WORLD_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes((countryFilter || '').toLowerCase()) ||
    c.code.toLowerCase().includes((countryFilter || '').toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader text="Loading country studio..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-12">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/countries')}
            className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <div>
            <h1 className="text-sm font-bold font-heading text-foreground">
              {isEditing ? 'Edit Country & City Details' : 'Add New Country & Regional Hub'}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Smart auto-populate geography, ISO codes, currencies, and primary cities
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
            <span>{saving ? 'Saving...' : isEditing ? 'Update Country' : 'Save Country'}</span>
          </GlowingButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-orange-400" />
              <h2 className="text-sm font-bold text-foreground">1. Core Country & Geography Telemetry</h2>
            </div>
            <span className="text-[10px] text-orange-400/90 bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
              <Zap className="size-3" />
              <span>Smart Country Auto-Fill Active</span>
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
              <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap mr-1">
                Quick Select:
              </span>
              {popularPresetChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => applyCountryPreset(findCountryPreset(chip))}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    formData.name.toLowerCase() === chip.toLowerCase()
                      ? 'bg-orange-500 text-zinc-950 font-bold border-orange-500 shadow-xs'
                      : 'bg-[#18181b] hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 border-border/80 hover:border-orange-500/40'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative space-y-1" ref={dropdownRef}>
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                    <span>Country Name *</span>
                    <span className="text-[10px] text-orange-400 font-normal">Auto-Fills Form</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleCountryNameChange(e.target.value)}
                      onFocus={() => setCountryDropdownOpen(true)}
                      placeholder="e.g. Pakistan, Japan, UAE"
                      className="w-full px-3 py-1.5 pr-8 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => setCountryDropdownOpen((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>

                  {countryDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 max-h-56 overflow-y-auto custom-scrollbar bg-[#18181b] border border-orange-500/40 rounded-xl shadow-2xl p-1 space-y-0.5">
                      {filteredCountriesList.length > 0 ? (
                        filteredCountriesList.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => applyCountryPreset(c)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between hover:bg-orange-500/15 text-foreground hover:text-orange-400 transition-colors cursor-pointer"
                          >
                            <span className="font-semibold">{c.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded border border-border/60">
                              {c.code} • {c.continent}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-2 text-center text-[11px] text-muted-foreground">
                          Custom Country Name (Type manually or use AI)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <ValidatedInput
                  label="ISO Code"
                  validationType="countryCode"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. PK, JPN, UAE"
                  className="uppercase font-mono"
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Continent</label>
                  <select
                    value={formData.continent}
                    onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-orange-500/60 cursor-pointer"
                  >
                    {continents.map((c) => (
                      <option key={c} value={c} className="bg-[#18181b] text-foreground">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                    <DollarSign className="size-3 text-orange-400" /> Currency
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="currency-presets"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      placeholder="e.g. PKR (Rs) / USD ($)"
                      className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-orange-500/60"
                    />
                    <datalist id="currency-presets">
                      {CURRENCY_SUGGESTIONS.map((curr) => (
                        <option key={curr} value={curr} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                    <Languages className="size-3 text-orange-400" /> Primary Language
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="language-presets"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      placeholder="e.g. Urdu / English"
                      className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-orange-500/60"
                    />
                    <datalist id="language-presets">
                      {LANGUAGE_SUGGESTIONS.map((lang) => (
                        <option key={lang} value={lang} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                    <Clock className="size-3 text-orange-400" /> Timezone
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="timezone-presets"
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      placeholder="e.g. UTC+5 (PKT)"
                      className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-orange-500/60"
                    />
                    <datalist id="timezone-presets">
                      {TIMEZONE_SUGGESTIONS.map((tz) => (
                        <option key={tz} value={tz} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                  <span>Overview Description</span>
                  <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview detailing climate, highlights, and travel appeal (Optional)..."
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-orange-500/60 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Country Cover Photo *</label>
              <div className="relative h-44 w-full rounded-xl border border-dashed border-border hover:border-orange-500/40 bg-secondary/30 flex flex-col items-center justify-center overflow-hidden transition-colors">
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
                    <span className="text-xs font-bold text-foreground">Upload Cover Image</span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Images className="size-3.5 text-orange-400" />
                <span>Scenic Multi-Photo Gallery ({formData.images.length})</span>
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
                  <img src={imgUrl} alt={`Country Scenic ${idx + 1}`} className="size-full object-cover" />
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

        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-orange-400" />
              <h2 className="text-sm font-bold text-foreground">
                2. Key Cities & Regional Hubs ({formData.popularCities.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  popularCities: [...formData.popularCities, { name: '', description: '', images: [] }]
                })
              }
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3" /> Add City Hub
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {formData.popularCities.map((city, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-secondary/30 border border-border space-y-2.5 relative">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={city.name}
                    onChange={(e) => {
                      const updated = [...formData.popularCities];
                      updated[i] = { ...updated[i], name: e.target.value };
                      setFormData({ ...formData, popularCities: updated });
                    }}
                    placeholder="City Name (e.g. Islamabad, Kyoto, Dubai)"
                    className="w-full font-bold bg-transparent text-xs text-foreground focus:outline-none placeholder-muted-foreground/60"
                  />
                  {formData.popularCities.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          popularCities: formData.popularCities.filter((_, idx) => idx !== i)
                        })
                      }
                      className="text-muted-foreground hover:text-rose-400 p-0.5 cursor-pointer ml-1"
                      title="Remove City"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={city.description || ''}
                  onChange={(e) => {
                    const updated = [...formData.popularCities];
                    updated[i] = { ...updated[i], description: e.target.value };
                    setFormData({ ...formData, popularCities: updated });
                  }}
                  placeholder="Short highlight description (Optional)..."
                  className="w-full px-2.5 py-1 rounded bg-secondary/70 border border-border text-[11px] text-foreground focus:outline-none"
                />

                <div className="space-y-1.5 pt-1.5 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                      <Images className="size-3 text-orange-400" />
                      <span>Photos ({city.images?.length || 0}/3)</span>
                    </span>
                    {(city.images?.length || 0) < 3 && (
                      <label className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-0.5 cursor-pointer">
                        <Plus className="size-2.5" />
                        <span>{uploadingCityIndex === i ? 'Uploading...' : 'Add (Max 3)'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploadingCityIndex === i}
                          onChange={(e) => handleAddCityImages(i, e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 min-h-[50px]">
                    {(city.images || []).map((imgUrl, imgIdx) => (
                      <div key={imgIdx} className="relative h-14 rounded-lg overflow-hidden border border-border group bg-secondary/40">
                        <img src={imgUrl} alt={`${city.name || 'City'} ${imgIdx + 1}`} className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveCityImage(i, imgIdx)}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/80 text-rose-400 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                          title="Delete photo"
                        >
                          <X className="size-2.5" />
                        </button>
                      </div>
                    ))}
                    {(city.images?.length || 0) < 3 && (
                      <label className="h-14 rounded-lg border border-dashed border-border hover:border-orange-500/50 bg-secondary/20 flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-orange-400 transition-colors">
                        <UploadCloud className="size-3.5" />
                        <span className="text-[9px] font-semibold mt-0.5">+ Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploadingCityIndex === i}
                          onChange={(e) => handleAddCityImages(i, e.target.files)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
          <button
            type="button"
            onClick={() => navigate('/admin/countries')}
            className="px-4 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground font-semibold cursor-pointer"
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
            <span>{saving ? 'Saving...' : isEditing ? 'Update Country' : 'Publish Country'}</span>
          </GlowingButton>
        </div>
      </form>

      <AiAutofillModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        entityType="country"
        onAutofill={handleAiAutofill}
      />
    </div>
  );
}

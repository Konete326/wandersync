import { useState, useEffect } from 'react';
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
  Sparkles
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

const continents = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];

export default function AdminCountryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useModal();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

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
    popularCities: [{ name: '', description: '' }],
    featured: false
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

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
              popularCities: res.data.popularCities?.length ? res.data.popularCities : [{ name: '', description: '' }],
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

  const handleRemoveGalleryImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Country name is required', 'warning');
      return;
    }
    if (!coverFile && !formData.coverImage) {
      showToast('Please upload a country cover photo', 'warning');
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
      body.append('images', JSON.stringify(formData.images.filter(Boolean)));
      body.append('popularCities', JSON.stringify(formData.popularCities.filter((c) => c.name)));

      if (coverFile) {
        const compressedCover = await compressImage(coverFile);
        body.append('image', compressedCover);
      } else if (formData.coverImage) {
        body.append('coverImage', formData.coverImage);
      }

      if (isEditing) {
        await updateCountry(id, body);
        showToast('Country updated successfully', 'success');
      } else {
        await createCountry(body);
        showToast('New country added to global catalog', 'success');
      }
      navigate('/admin/countries');
    } catch {
      showToast('Failed to save country', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAiAutofill = (data) => {
    setFormData((prev) => ({
      ...prev,
      name: data.name || prev.name,
      code: data.code || prev.code,
      continent: data.continent || prev.continent,
      currency: data.currency || prev.currency,
      language: data.language || prev.language,
      timezone: data.timezone || prev.timezone,
      description: data.description || prev.description,
      popularCities: data.popularCities?.length ? data.popularCities : prev.popularCities
    }));
  };

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
              Set country geography, primary cities, and currency
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
          <div className="flex items-center gap-2 border-b border-border/70 pb-2.5">
            <Globe className="size-4 text-orange-400" />
            <h2 className="text-sm font-bold text-foreground">1. Core Country & Media Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  label="Country Name"
                  required
                  validationType="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Japan"
                />

                <ValidatedInput
                  label="ISO Code"
                  validationType="countryCode"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. JP, IT, FR"
                  className="uppercase font-mono"
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Continent</label>
                  <select
                    value={formData.continent}
                    onChange={(e) => setFormData({ ...formData, continent: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  >
                    {continents.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                    <DollarSign className="size-3 text-orange-400" /> Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="e.g. JPY (¥) / EUR (€)"
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                    <Languages className="size-3 text-orange-400" /> Primary Language
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="e.g. Japanese / English"
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                    <Clock className="size-3 text-orange-400" /> Timezone
                  </label>
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    placeholder="e.g. GMT+9 / UTC+1"
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Overview Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Rich overview detailing climate, highlights, and travel appeal..."
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none resize-none leading-relaxed"
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
                <span>Scenic Photos & Landscapes ({formData.images.length})</span>
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
                  <img src={imgUrl} alt={`Scenic ${idx + 1}`} className="size-full object-cover" />
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
                  popularCities: [...formData.popularCities, { name: '', description: '' }]
                })
              }
              className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="size-3" /> Add City Hub
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {formData.popularCities.map((city, i) => (
              <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border space-y-2 relative">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={city.name}
                    onChange={(e) => {
                      const updated = [...formData.popularCities];
                      updated[i].name = e.target.value;
                      setFormData({ ...formData, popularCities: updated });
                    }}
                    placeholder="City Name (e.g. Kyoto, Tokyo, Osaka)"
                    className="w-full font-bold bg-transparent text-xs text-foreground focus:outline-none"
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
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={city.description}
                  onChange={(e) => {
                    const updated = [...formData.popularCities];
                    updated[i].description = e.target.value;
                    setFormData({ ...formData, popularCities: updated });
                  }}
                  placeholder="Short description..."
                  className="w-full px-2 py-0.5 rounded bg-secondary/70 border border-border text-[11px] text-foreground focus:outline-none"
                />
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

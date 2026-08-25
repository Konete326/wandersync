import { useState, useEffect } from 'react';
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
  Globe
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

const spotCategories = ['Landmark', 'Temple & Shrine', 'Nature & Park', 'Museum', 'Beach', 'Historical Site', 'Viewpoint'];

export default function AdminSpotEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useModal();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [countriesList, setCountriesList] = useState([]);

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
      const uploadPromises = fileList.map((f) => uploadImage(f, 'wandersync/spots'));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.data?.url).filter(Boolean);
      if (newUrls.length > 0) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
        showToast(`${newUrls.length} spot photo(s) compressed & uploaded`, 'success');
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
    if (!formData.name || !formData.country || !formData.city) {
      showToast('Name, country, and city are mandatory fields', 'warning');
      return;
    }
    if (!coverFile && !formData.coverImage) {
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
        const compressedCover = await compressImage(coverFile);
        body.append('image', compressedCover);
      } else if (formData.coverImage) {
        body.append('coverImage', formData.coverImage);
      }

      if (isEditing) {
        await updateSpot(id, body);
        showToast('Attraction updated successfully', 'success');
      } else {
        await createSpot(body);
        showToast('New attraction added to catalog', 'success');
      }
      navigate('/admin/spots');
    } catch {
      showToast('Failed to save attraction', 'error');
    } finally {
      setSaving(false);
    }
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

        <GlowingButton
          onClick={handleSubmit}
          disabled={saving}
          size="sm"
          innerClassName="py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
        >
          <Save className="size-3.5 text-orange-400" />
          <span>{saving ? 'Saving...' : isEditing ? 'Update Spot' : 'Save Spot'}</span>
        </GlowingButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2.5">
            <Navigation className="size-4 text-orange-400" />
            <h2 className="text-sm font-bold text-foreground">1. Landmark Essentials & Geography</h2>
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

                <ValidatedInput
                  label="City / Area"
                  required
                  validationType="name"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Kyoto"
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
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
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Description & Landmark Significance</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="History, iconic torii gates, viewpoints, and best visiting advice..."
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Cover Photo */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Primary Spot Photo *</label>
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
                    <span className="text-xs font-bold text-foreground">Upload Photo</span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Multiple Extra Landmark Photos */}
          <div className="pt-3 border-t border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Images className="size-3.5 text-orange-400" />
                <span>Multiple Attraction Photos ({formData.images.length})</span>
              </label>
              <label className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                <Plus className="size-3" />
                <span>{uploadingGallery ? 'Uploading...' : 'Add Another Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingGallery}
                  onChange={(e) => handleAddGalleryImage(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {formData.images.map((imgUrl, idx) => (
                <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-border group">
                  <img src={imgUrl} alt={`Spot ${idx + 1}`} className="size-full object-cover" />
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
          <button
            type="button"
            onClick={() => navigate('/admin/spots')}
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
            <span>{saving ? 'Saving...' : isEditing ? 'Update Spot' : 'Publish Spot'}</span>
          </GlowingButton>
        </div>
      </form>
    </div>
  );
}

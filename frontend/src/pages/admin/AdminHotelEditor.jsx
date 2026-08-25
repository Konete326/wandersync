import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Building,
  Plus,
  Trash2,
  X,
  Save,
  DollarSign,
  Star,
  Images,
  MapPin,
  Globe,
  Phone,
  Mail,
  Link as LinkIcon
} from 'lucide-react';
import { uploadImage } from '@/services/mediaService';
import { compressImage } from '@/utils/imageCompressor';
import {
  fetchHotelById,
  createHotel,
  updateHotel
} from '@/services/hotelService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import ValidatedInput from '@/components/common/ValidatedInput';

const priceRanges = ['$', '$$', '$$$', '$$$$'];
const defaultAmenitiesList = ['Free High-Speed WiFi', 'Breakfast Included', 'Infinity Pool', 'Spa & Wellness', 'Airport Shuttle', 'Fitness Center', 'Ocean / Skyline View', 'Concierge Service'];

export default function AdminHotelEditor() {
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
    area: '',
    rating: 4.8,
    priceRange: '$$$',
    pricePerNight: '$180/night',
    amenities: ['Free High-Speed WiFi', 'Breakfast Included'],
    coverImage: '',
    images: [],
    address: '',
    bookingUrl: '',
    contactPhone: '',
    contactEmail: '',
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
          const res = await fetchHotelById(id);
          if (res.data) {
            setFormData({
              name: res.data.name || '',
              country: res.data.country || '',
              city: res.data.city || '',
              area: res.data.area || '',
              rating: res.data.rating || 4.8,
              priceRange: res.data.priceRange || '$$$',
              pricePerNight: res.data.pricePerNight || '$180/night',
              amenities: res.data.amenities?.length ? res.data.amenities : ['Free WiFi'],
              coverImage: res.data.coverImage || '',
              images: res.data.images || [],
              address: res.data.address || '',
              bookingUrl: res.data.bookingUrl || '',
              contactPhone: res.data.contactPhone || '',
              contactEmail: res.data.contactEmail || '',
              featured: Boolean(res.data.featured)
            });
            setCoverPreview(res.data.coverImage || '');
          }
        } catch {
          showToast('Failed to load hotel details', 'error');
          navigate('/admin/hotels');
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
      const uploadPromises = fileList.map((f) => uploadImage(f, 'wandersync/hotels'));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.data?.url).filter(Boolean);
      if (newUrls.length > 0) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
        showToast(`${newUrls.length} hotel photo(s) compressed & uploaded`, 'success');
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

  const toggleAmenity = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      setFormData((prev) => ({ ...prev, amenities: prev.amenities.filter((a) => a !== amenity) }));
    } else {
      setFormData((prev) => ({ ...prev, amenities: [...prev.amenities, amenity] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.country || !formData.city) {
      showToast('Name, country, and city are mandatory fields', 'warning');
      return;
    }
    if (!coverFile && !formData.coverImage) {
      showToast('Please upload a hotel cover photo', 'warning');
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append('name', formData.name);
      body.append('country', formData.country);
      body.append('city', formData.city);
      body.append('area', formData.area);
      body.append('rating', String(formData.rating));
      body.append('priceRange', formData.priceRange);
      body.append('pricePerNight', formData.pricePerNight);
      body.append('address', formData.address);
      body.append('bookingUrl', formData.bookingUrl);
      body.append('contactPhone', formData.contactPhone);
      body.append('contactEmail', formData.contactEmail);
      body.append('featured', String(formData.featured));
      body.append('amenities', JSON.stringify(formData.amenities));
      body.append('images', JSON.stringify(formData.images.filter(Boolean)));

      if (coverFile) {
        const compressedCover = await compressImage(coverFile);
        body.append('image', compressedCover);
      } else if (formData.coverImage) {
        body.append('coverImage', formData.coverImage);
      }

      if (isEditing) {
        await updateHotel(id, body);
        showToast('Hotel updated successfully', 'success');
      } else {
        await createHotel(body);
        showToast('New hotel added to verified catalog', 'success');
      }
      navigate('/admin/hotels');
    } catch {
      showToast('Failed to save hotel record', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader text="Loading hotel studio..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-12">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/hotels')}
            className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <div>
            <h1 className="text-sm font-bold font-heading text-foreground">
              {isEditing ? 'Edit Hotel & Accommodation' : 'Add New Hotel & Stay'}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Configure room nightly rates, luxury tiers, and amenities
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
          <span>{saving ? 'Saving...' : isEditing ? 'Update Hotel' : 'Save Hotel'}</span>
        </GlowingButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Hotel Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2.5">
            <Building className="size-4 text-orange-400" />
            <h2 className="text-sm font-bold text-foreground">1. Hotel Details & Pricing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <ValidatedInput
                    label="Country"
                    required
                    validationType="name"
                    list="hotel-country-options"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. Japan"
                  />
                  <datalist id="hotel-country-options">
                    {countriesList.map((c) => (
                      <option key={c._id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <ValidatedInput
                  label="City"
                  required
                  validationType="name"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Kyoto"
                />

                <ValidatedInput
                  label="Area / Neighborhood"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g. Arashiyama Riverfront"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  label="Hotel Name"
                  required
                  validationType="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hoshinoya Kyoto"
                />

                <ValidatedInput
                  label="Nightly Rate"
                  required
                  validationType="price"
                  value={formData.pricePerNight}
                  onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                  placeholder="e.g. $180/night"
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Price Tier</label>
                  <select
                    value={formData.priceRange}
                    onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  >
                    {priceRanges.map((pr) => (
                      <option key={pr} value={pr}>{pr} Tier</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  label="Star Rating (1-5)"
                  validationType="rating"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || '' })}
                />

                <div className="sm:col-span-2">
                  <ValidatedInput
                    label="Booking / Website Link"
                    validationType="url"
                    value={formData.bookingUrl}
                    onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                    placeholder="https://..."
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Physical Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, landmarks nearby..."
                  className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Cover Photo */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Primary Hotel Cover Photo *</label>
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
                    <span className="text-xs font-bold text-foreground">Upload Hotel Photo</span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG, WebP</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Multiple Room / Exterior Photos */}
          <div className="pt-3 border-t border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Images className="size-3.5 text-orange-400" />
                <span>Multiple Room & Facility Photos ({formData.images.length})</span>
              </label>
              <label className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                <Plus className="size-3" />
                <span>{uploadingGallery ? 'Uploading...' : 'Add Room Photos (Multiple)'}</span>
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
                  <img src={imgUrl} alt={`Room ${idx + 1}`} className="size-full object-cover" />
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

        {/* Verified Amenities */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-3 shadow-md">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2.5">
            <Star className="size-4 text-orange-400" />
            <h2 className="text-sm font-bold text-foreground">2. Hotel Amenities & Services</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {defaultAmenitiesList.map((amenity) => {
              const isChecked = formData.amenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-orange-500 text-zinc-950 font-bold shadow-sm shadow-orange-500/20'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground border border-border hover:border-orange-500/30'
                  }`}
                >
                  {isChecked ? '✓ ' : '+ '}
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
          <button
            type="button"
            onClick={() => navigate('/admin/hotels')}
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
            <span>{saving ? 'Saving...' : isEditing ? 'Update Hotel' : 'Publish Hotel'}</span>
          </GlowingButton>
        </div>
      </form>
    </div>
  );
}

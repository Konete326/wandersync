import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Car,
  Plus,
  Trash2,
  X,
  Save,
  DollarSign,
  Users,
  Images,
  MapPin,
  Globe,
  Fuel,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { uploadImage } from '@/services/mediaService';
import { compressImage } from '@/utils/imageCompressor';
import {
  fetchVehicleById,
  createVehicle,
  updateVehicle
} from '@/services/vehicleService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import ValidatedInput from '@/components/common/ValidatedInput';
import AiAutofillModal from '@/components/admin/AiAutofillModal';
import { VEHICLE_PRESETS } from '@/utils/entityPresetsData';
import { broadcastRealtimeUpdate } from '@/utils/realtimeSync';
import { getCitySuggestions } from '@/utils/worldCountriesData';

const vehicleTypes = ['SUV', 'Luxury Sedan', 'Van & Minibus', '4x4 Off-Road', 'Convertible', 'Electric'];
const defaultFeaturesList = ['Air Conditioning', 'GPS Navigation System', 'Luggage Roof Rack', 'Bluetooth & USB Charging', 'Child Safety Seat', 'All-Wheel Drive (AWD)', 'Tinted Windows', 'Comprehensive Insurance'];

export default function AdminVehicleEditor() {
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
    name: '',
    vehicleType: 'SUV',
    capacity: '5 Passengers',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    pricePerDay: '$95/day',
    pricePerHour: '$20/hr',
    driverIncluded: true,
    country: '',
    city: '',
    status: 'Available',
    features: ['Air Conditioning', 'GPS Navigation System', 'Bluetooth & USB Charging'],
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
          const res = await fetchVehicleById(id);
          if (res.data) {
            setFormData({
              name: res.data.name || '',
              vehicleType: res.data.vehicleType || 'SUV',
              capacity: res.data.capacity || '5 Passengers',
              transmission: res.data.transmission || 'Automatic',
              fuelType: res.data.fuelType || 'Petrol',
              pricePerDay: res.data.pricePerDay || '$95/day',
              pricePerHour: res.data.pricePerHour || '$20/hr',
              driverIncluded: Boolean(res.data.driverIncluded),
              country: res.data.country || '',
              city: res.data.city || '',
              status: res.data.status || 'Available',
              features: res.data.features?.length ? res.data.features : ['Air Conditioning'],
              coverImage: res.data.coverImage || '',
              images: res.data.images || [],
              featured: Boolean(res.data.featured)
            });
            setCoverPreview(res.data.coverImage || '');
          }
        } catch {
          showToast('Failed to load vehicle details', 'error');
          navigate('/admin/vehicles');
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
      const uploadPromises = fileList.map((f) => uploadImage(f, 'wandersync/vehicles'));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.data?.url).filter(Boolean);
      if (newUrls.length > 0) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
        showToast(`${newUrls.length} fleet photo(s) compressed & uploaded`, 'success');
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

  const toggleFeature = (feat) => {
    if (formData.features.includes(feat)) {
      setFormData((prev) => ({ ...prev, features: prev.features.filter((f) => f !== feat) }));
    } else {
      setFormData((prev) => ({ ...prev, features: [...prev.features, feat] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.country || !formData.city) {
      showToast('Model name, country, and city are mandatory fields', 'warning');
      return;
    }
    if (!coverFile && !formData.coverImage) {
      showToast('Please upload a primary vehicle photo', 'warning');
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append('name', formData.name);
      body.append('vehicleType', formData.vehicleType);
      body.append('capacity', formData.capacity);
      body.append('transmission', formData.transmission);
      body.append('fuelType', formData.fuelType);
      body.append('pricePerDay', formData.pricePerDay);
      body.append('pricePerHour', formData.pricePerHour);
      body.append('driverIncluded', String(formData.driverIncluded));
      body.append('country', formData.country);
      body.append('city', formData.city);
      body.append('status', formData.status);
      body.append('featured', String(formData.featured));
      body.append('features', JSON.stringify(formData.features));
      body.append('images', JSON.stringify(formData.images.filter(Boolean)));

      if (coverFile) {
        const compressedCover = await compressImage(coverFile);
        body.append('image', compressedCover);
      } else {
        const fallback = formData.coverImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80';
        body.append('coverImage', fallback);
      }

      if (isEditing) {
        await updateVehicle(id, body);
        broadcastRealtimeUpdate('vehicles');
        showToast('Vehicle updated successfully', 'success');
      } else {
        await createVehicle(body);
        broadcastRealtimeUpdate('vehicles');
        showToast('New vehicle added to transport fleet', 'success');
      }
      navigate('/admin/vehicles');
    } catch {
      showToast('Failed to save vehicle', 'error');
    } finally {
      setSaving(false);
    }
  };

  const normalizeVehicleType = (rawType = '', name = '') => {
    const text = `${rawType} ${name}`.toLowerCase();
    if (
      text.includes('sedan') ||
      text.includes('e-class') ||
      text.includes('s-class') ||
      text.includes('c-class') ||
      text.includes('mercedes') ||
      text.includes('bmw 7') ||
      text.includes('bmw 5') ||
      text.includes('audi a6') ||
      text.includes('audi a8') ||
      text.includes('camry') ||
      text.includes('civic') ||
      text.includes('accord') ||
      text.includes('lexus es') ||
      text.includes('lexus ls') ||
      text.includes('rolls royce') ||
      text.includes('bentley')
    ) {
      if (text.includes('g-wagon') || text.includes('g-class') || text.includes('gle') || text.includes('gls')) {
        return 'SUV';
      }
      return 'Luxury Sedan';
    }
    if (text.includes('van') || text.includes('minibus') || text.includes('hiace') || text.includes('sprinter') || text.includes('alphard') || text.includes('vellfire') || text.includes('v-class')) {
      return 'Van & Minibus';
    }
    if (text.includes('4x4') || text.includes('off-road') || text.includes('prado') || text.includes('land cruiser') || text.includes('defender') || text.includes('jeep') || text.includes('fortuner')) {
      return '4x4 Off-Road';
    }
    if (text.includes('electric') || text.includes('tesla') || text.includes('taycan') || text.includes('ev') || text.includes('eqs') || text.includes('lucid')) {
      return 'Electric';
    }
    if (text.includes('convertible') || text.includes('cabriolet') || text.includes('spider')) {
      return 'Convertible';
    }
    if (vehicleTypes.includes(rawType)) {
      return rawType;
    }
    return 'SUV';
  };

  const handleAiAutofill = (data) => {
    const resolvedType = normalizeVehicleType(data.vehicleType || data.type, data.name);
    const resolvedPrice = typeof data.pricePerDay === 'number' ? `$${data.pricePerDay}/day` : (data.pricePerDay || formData.pricePerDay);
    const resolvedCapacity = data.capacity ? (String(data.capacity).includes('Passenger') ? data.capacity : `${data.capacity} Passengers`) : formData.capacity;

    setFormData((prev) => ({
      ...prev,
      name: data.name || prev.name,
      vehicleType: resolvedType,
      capacity: resolvedCapacity,
      transmission: data.transmission || prev.transmission,
      fuelType: data.fuelType || prev.fuelType,
      pricePerDay: resolvedPrice,
      description: data.description || prev.description,
      features: data.features?.length ? data.features : prev.features,
      coverImage: data.coverImage || prev.coverImage,
      images: data.images?.length ? data.images : prev.images
    }));
    if (data.coverImage) {
      setCoverPreview(data.coverImage);
      setCoverFile(null);
    }
  };

  const applyVehiclePreset = (preset) => {
    if (!preset) return;
    setFormData((prev) => ({
      ...prev,
      name: preset.name || prev.name,
      vehicleType: preset.vehicleType || prev.vehicleType,
      capacity: preset.capacity || prev.capacity,
      transmission: preset.transmission || prev.transmission,
      fuelType: preset.fuelType || prev.fuelType,
      pricePerDay: preset.pricePerDay || prev.pricePerDay,
      driverIncluded: preset.driverIncluded !== undefined ? preset.driverIncluded : prev.driverIncluded,
      description: preset.description || prev.description,
      coverImage: preset.coverImage || prev.coverImage,
      features: preset.features?.length ? preset.features : prev.features
    }));
    if (preset.coverImage) {
      setCoverPreview(preset.coverImage);
    }
    showToast(`Auto-filled details for ${preset.name}!`, 'success');
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader text="Loading fleet studio..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-12">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/vehicles')}
            className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
          </button>
          <div>
            <h1 className="text-sm font-bold font-heading text-foreground">
              {isEditing ? 'Edit Vehicle Details' : 'Add Vehicle to Fleet'}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Set vehicle specifications, daily rental rates, chauffeur inclusion, and photo gallery
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
            <span>{saving ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Save Vehicle'}</span>
          </GlowingButton>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
            <div className="flex items-center gap-2">
              <Car className="size-4 text-orange-400" />
              <h2 className="text-sm font-bold text-foreground">1. Vehicle Specifications & Pricing</h2>
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
              {VEHICLE_PRESETS.map((v) => (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => applyVehiclePreset(v)}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                    formData.name.toLowerCase() === v.name.toLowerCase()
                      ? 'bg-orange-500 text-zinc-950 font-bold border-orange-500 shadow-xs'
                      : 'bg-[#18181b] hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 border-border/80 hover:border-orange-500/40'
                  }`}
                >
                  {v.name}
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
                    list="veh-country-options"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. Japan"
                  />
                  <datalist id="veh-country-options">
                    {countriesList.map((c) => (
                      <option key={c._id} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <ValidatedInput
                    label="City"
                    required
                    validationType="name"
                    list="veh-city-options"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Kyoto"
                  />
                  <datalist id="veh-city-options">
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
                  <label className="text-[11px] font-bold text-zinc-300">Vehicle Type</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  >
                    {vehicleTypes.filter((v) => v !== 'All').map((vt) => (
                      <option key={vt} value={vt}>{vt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  label="Model Name"
                  required
                  validationType="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Toyota Land Cruiser Prado"
                />

                <ValidatedInput
                  label="Price Per Day"
                  validationType="price"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                  placeholder="e.g. $95/day"
                />

                <ValidatedInput
                  label="Hourly Rate"
                  validationType="price"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  placeholder="e.g. $20/hr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1">
                    <Users className="size-3 text-orange-400" /> Capacity
                  </label>
                  <input
                    type="text"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g. 5 Passengers"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Fleet Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="driver-checkbox"
                  checked={formData.driverIncluded}
                  onChange={(e) => setFormData({ ...formData, driverIncluded: e.target.checked })}
                  className="rounded border-border text-orange-500 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="driver-checkbox" className="text-xs font-semibold text-zinc-300 cursor-pointer select-none">
                  Professional Chauffeur / Driver Included in Daily Rate
                </label>
              </div>
            </div>

            
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Primary Vehicle Photo *</label>
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
                    <span className="text-xs font-bold text-foreground">Upload Vehicle Photo</span>
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
                <span>Interior & Exterior Multi-Photos ({formData.images.length})</span>
              </label>
              <label className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                <Plus className="size-3" />
                <span>{uploadingGallery ? 'Uploading...' : 'Add Fleet Photos (Multiple)'}</span>
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
                  <img src={imgUrl} alt={`Vehicle ${idx + 1}`} className="size-full object-cover" />
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
          <div className="flex items-center gap-2 border-b border-border/70 pb-2.5">
            <ShieldCheck className="size-4 text-orange-400" />
            <h2 className="text-sm font-bold text-foreground">2. Vehicle Features & Travel Amenities</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {defaultFeaturesList.map((feat) => {
              const isChecked = formData.features.includes(feat);
              return (
                <button
                  type="button"
                  key={feat}
                  onClick={() => toggleFeature(feat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-orange-500 text-zinc-950 font-bold shadow-sm shadow-orange-500/20'
                      : 'bg-secondary/60 text-muted-foreground hover:text-foreground border border-border hover:border-orange-500/30'
                  }`}
                >
                  {isChecked ? '✓ ' : '+ '}
                  {feat}
                </button>
              );
            })}
          </div>
        </div>

        
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
          <button
            type="button"
            onClick={() => navigate('/admin/vehicles')}
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
            <span>{saving ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Add Vehicle to Fleet'}</span>
          </GlowingButton>
        </div>
      </form>

      <AiAutofillModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        entityType="vehicle"
        onAutofill={handleAiAutofill}
      />
    </div>
  );
}

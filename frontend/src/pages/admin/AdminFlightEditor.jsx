import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Plane,
  Plus,
  Trash2,
  X,
  Save,
  DollarSign,
  Clock,
  Images,
  MapPin,
  Globe,
  Luggage,
  ShieldCheck,
  Building
} from 'lucide-react';
import { uploadImage } from '@/services/mediaService';
import { compressImage } from '@/utils/imageCompressor';
import {
  fetchFlightById,
  createFlight,
  updateFlight
} from '@/services/flightService';
import { fetchCountries } from '@/services/countryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';
import ValidatedInput from '@/components/common/ValidatedInput';

const cabinClasses = ['Economy', 'Premium Economy', 'Business Class', 'First Class'];
const flightStatuses = ['Scheduled', 'Available', 'Filling Fast', 'Boarding', 'Delayed'];

export default function AdminFlightEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useModal();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [countriesList, setCountriesList] = useState([]);

  const [formData, setFormData] = useState({
    airline: '',
    flightNumber: '',
    aircraft: 'Boeing 787 Dreamliner',
    originCountry: 'United Arab Emirates',
    originCity: 'Dubai',
    originAirport: 'DXB',
    destinationCountry: '',
    destinationCity: '',
    destinationAirport: 'HND',
    departureTime: '10:30 AM',
    arrivalTime: '06:45 PM',
    duration: '7h 15m (Non-Stop)',
    cabinClass: 'Economy',
    price: '$450/seat',
    baggage: '30 kg Check-in + 7 kg Cabin',
    status: 'Available',
    coverImage: '',
    images: [],
    bookingUrl: '',
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
          const res = await fetchFlightById(id);
          if (res.data) {
            setFormData({
              airline: res.data.airline || '',
              flightNumber: res.data.flightNumber || '',
              aircraft: res.data.aircraft || 'Boeing 787 Dreamliner',
              originCountry: res.data.originCountry || 'United Arab Emirates',
              originCity: res.data.originCity || 'Dubai',
              originAirport: res.data.originAirport || 'DXB',
              destinationCountry: res.data.destinationCountry || '',
              destinationCity: res.data.destinationCity || '',
              destinationAirport: res.data.destinationAirport || 'HND',
              departureTime: res.data.departureTime || '10:30 AM',
              arrivalTime: res.data.arrivalTime || '06:45 PM',
              duration: res.data.duration || '7h 15m',
              cabinClass: res.data.cabinClass || 'Economy',
              price: res.data.price || '$450/seat',
              baggage: res.data.baggage || '30 kg Check-in + 7 kg Cabin',
              status: res.data.status || 'Available',
              coverImage: res.data.coverImage || '',
              images: res.data.images || [],
              bookingUrl: res.data.bookingUrl || '',
              featured: Boolean(res.data.featured)
            });
            setCoverPreview(res.data.coverImage || '');
          }
        } catch {
          showToast('Failed to load flight route details', 'error');
          navigate('/admin/flights');
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
      const uploadPromises = fileList.map((f) => uploadImage(f, 'wandersync/flights'));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.data?.url).filter(Boolean);
      if (newUrls.length > 0) {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...newUrls] }));
        showToast(`${newUrls.length} aircraft/cabin photo(s) compressed & uploaded`, 'success');
      }
    } catch {
      showToast('Failed to upload some cabin images', 'error');
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
    if (!formData.airline || !formData.flightNumber || !formData.destinationCountry || !formData.destinationCity) {
      showToast('Airline, flight code, destination country, and city are mandatory', 'warning');
      return;
    }
    if (!coverFile && !formData.coverImage) {
      showToast('Please upload a primary airplane cover photo', 'warning');
      return;
    }

    setSaving(true);
    try {
      const body = new FormData();
      body.append('airline', formData.airline);
      body.append('flightNumber', formData.flightNumber);
      body.append('aircraft', formData.aircraft);
      body.append('originCountry', formData.originCountry);
      body.append('originCity', formData.originCity);
      body.append('originAirport', formData.originAirport);
      body.append('destinationCountry', formData.destinationCountry);
      body.append('destinationCity', formData.destinationCity);
      body.append('destinationAirport', formData.destinationAirport);
      body.append('departureTime', formData.departureTime);
      body.append('arrivalTime', formData.arrivalTime);
      body.append('duration', formData.duration);
      body.append('cabinClass', formData.cabinClass);
      body.append('price', formData.price);
      body.append('baggage', formData.baggage);
      body.append('status', formData.status);
      body.append('bookingUrl', formData.bookingUrl);
      body.append('featured', String(formData.featured));
      body.append('images', JSON.stringify(formData.images.filter(Boolean)));

      if (coverFile) {
        const compressedCover = await compressImage(coverFile);
        body.append('image', compressedCover);
      } else if (formData.coverImage) {
        body.append('coverImage', formData.coverImage);
      }

      if (isEditing) {
        await updateFlight(id, body);
        showToast('Flight schedule updated successfully', 'success');
      } else {
        await createFlight(body);
        showToast('New flight scheduled to live flight board', 'success');
      }
      navigate('/admin/flights');
    } catch {
      showToast('Failed to save flight route', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader text="Loading flight studio..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans max-w-5xl mx-auto pb-16">
      {/* Top Studio Bar */}
      <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/flights')}
            className="p-2 rounded-xl bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground leading-tight">
              {isEditing ? `Edit Flight: ${formData.airline} (${formData.flightNumber})` : 'Schedule New Flight Route'}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Configure airline specifications, origin & destination airports, cabin tiers, and luggage policies
            </p>
          </div>
        </div>

        <GlowingButton
          onClick={handleSubmit}
          disabled={saving}
          size="sm"
          innerClassName="py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5"
        >
          <Save className="size-3.5 text-orange-400" />
          <span>{saving ? 'Saving...' : isEditing ? 'Update Flight' : 'Publish Flight'}</span>
        </GlowingButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Specs Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121215] border border-border/80 space-y-4 shadow-md">
          <div className="flex items-center gap-2 border-b border-border/70 pb-2.5">
            <Plane className="size-4 text-orange-400" />
            <h2 className="text-sm font-bold text-foreground">1. Airline & Aircraft Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  label="Airline Name"
                  required
                  validationType="name"
                  value={formData.airline}
                  onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                  placeholder="e.g. Emirates / Japan Airlines"
                />

                <ValidatedInput
                  label="Flight Code"
                  required
                  value={formData.flightNumber}
                  onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. EK-318 / JL-006"
                  className="uppercase font-mono"
                />

                <ValidatedInput
                  label="Aircraft Model"
                  value={formData.aircraft}
                  onChange={(e) => setFormData({ ...formData, aircraft: e.target.value })}
                  placeholder="e.g. Boeing 777-300ER"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ValidatedInput
                  label="Seat Ticket Price"
                  required
                  validationType="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. $450/seat"
                />

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Cabin Class Tier</label>
                  <select
                    value={formData.cabinClass}
                    onChange={(e) => setFormData({ ...formData, cabinClass: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    {cabinClasses.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Flight Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-xs text-foreground focus:outline-none cursor-pointer"
                  >
                    {flightStatuses.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ValidatedInput
                  label="Baggage Policy"
                  value={formData.baggage}
                  onChange={(e) => setFormData({ ...formData, baggage: e.target.value })}
                  placeholder="e.g. 30 kg Check-in + 7 kg Cabin"
                />

                <ValidatedInput
                  label="Official Booking / Airline Link"
                  validationType="url"
                  value={formData.bookingUrl}
                  onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                  placeholder="https://emirates.com/..."
                  className="font-mono"
                />
              </div>
            </div>

            {/* Airplane Primary Cover Upload */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Airplane Primary Photo *</label>
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
                    <span className="text-xs font-bold text-foreground">Upload Airplane Photo</span>
                    <span className="text-[10px] text-muted-foreground">Automatic smart compression</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Route Origin & Destination Geographics */}
          <div className="pt-4 border-t border-border/70 space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Globe className="size-3.5 text-orange-400" />
              <span>Route Origin & Arrival Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Origin Departure */}
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border space-y-3">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                  Departure Origin
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <ValidatedInput
                    label="Origin Country"
                    value={formData.originCountry}
                    onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
                    placeholder="e.g. United Arab Emirates"
                  />
                  <ValidatedInput
                    label="Origin City"
                    value={formData.originCity}
                    onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                    placeholder="e.g. Dubai"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ValidatedInput
                    label="Airport IATA Code"
                    value={formData.originAirport}
                    onChange={(e) => setFormData({ ...formData, originAirport: e.target.value.toUpperCase() })}
                    placeholder="DXB"
                    className="uppercase font-mono font-bold"
                  />
                  <ValidatedInput
                    label="Departure Time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    placeholder="10:30 AM"
                  />
                </div>
              </div>

              {/* Destination Arrival */}
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border space-y-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Arrival Destination
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <ValidatedInput
                      label="Destination Country"
                      required
                      validationType="name"
                      list="flight-country-options"
                      value={formData.destinationCountry}
                      onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                      placeholder="e.g. Japan"
                    />
                    <datalist id="flight-country-options">
                      {countriesList.map((c) => (
                        <option key={c._id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                  <ValidatedInput
                    label="Destination City"
                    required
                    validationType="name"
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                    placeholder="e.g. Tokyo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ValidatedInput
                    label="Airport IATA Code"
                    value={formData.destinationAirport}
                    onChange={(e) => setFormData({ ...formData, destinationAirport: e.target.value.toUpperCase() })}
                    placeholder="HND / NRT"
                    className="uppercase font-mono font-bold"
                  />
                  <ValidatedInput
                    label="Arrival Time"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                    placeholder="06:45 PM"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <ValidatedInput
                label="Flight Duration & Stops"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 7h 15m (Non-Stop)"
              />
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="flight-featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-border text-orange-500 focus:ring-orange-500/40 cursor-pointer size-4"
                />
                <label htmlFor="flight-featured" className="text-xs font-semibold text-foreground cursor-pointer">
                  Feature on Global Flight Board
                </label>
              </div>
            </div>
          </div>

          {/* Multiple Cabin & Aircraft Interior Photos */}
          <div className="pt-3 border-t border-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Images className="size-3.5 text-orange-400" />
                <span>Cabin & Interior Photos ({formData.images.length})</span>
              </label>
              <label className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                <Plus className="size-3" />
                <span>{uploadingGallery ? 'Uploading...' : 'Add Cabin Photos (Multiple)'}</span>
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
                  <img src={imgUrl} alt={`Cabin ${idx + 1}`} className="size-full object-cover" />
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
    </div>
  );
}

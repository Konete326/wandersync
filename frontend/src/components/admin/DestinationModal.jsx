import { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Sparkles,
  Plus,
  Trash2,
  Compass,
  Building,
  Star,
  DollarSign,
  Navigation,
  Loader2
} from 'lucide-react';
import { autofillDestinationAi, uploadGalleryItem, updateGalleryItem } from '@/services/galleryService';
import { uploadImage } from '@/services/mediaService';
import { useModal } from '@/context/ModalContext';

export default function DestinationModal({ isOpen, onClose, onSuccess, editItem = null }) {
  const { showModal, showToast } = useModal();

  const [title, setTitle] = useState('');
  const [country, setCountry] = useState('Japan');
  const [city, setCity] = useState('Kyoto');
  const [locationName, setLocationName] = useState('Kansai Region, Honshu');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Landscape');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [touristPlaces, setTouristPlaces] = useState([
    { name: '', imageUrl: '', description: '', uploading: false }
  ]);
  const [hotels, setHotels] = useState([
    { name: '', imageUrl: '', rating: 4.8, priceRange: '$$$', pricePerNight: '$180/night', uploading: false }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title || '');
      setCountry(editItem.country || 'Japan');
      setCity(editItem.city || '');
      setLocationName(editItem.location || '');
      setDescription(editItem.description || '');
      setCategory(editItem.category || 'Landscape');
      setPreviewUrl(editItem.imageUrl || '');
      setSelectedFile(null);
      setTouristPlaces(
        editItem.touristPlaces && editItem.touristPlaces.length > 0
          ? editItem.touristPlaces.map((p) => ({ ...p, uploading: false }))
          : [{ name: '', imageUrl: '', description: '', uploading: false }]
      );
      setHotels(
        editItem.hotels && editItem.hotels.length > 0
          ? editItem.hotels.map((h) => ({
              ...h,
              pricePerNight: h.pricePerNight || '$180/night',
              uploading: false
            }))
          : [{ name: '', imageUrl: '', rating: 4.8, priceRange: '$$$', pricePerNight: '$180/night', uploading: false }]
      );
    } else {
      setTitle('');
      setCountry('Japan');
      setCity('');
      setLocationName('');
      setDescription('');
      setCategory('Landscape');
      setSelectedFile(null);
      setPreviewUrl('');
      setTouristPlaces([{ name: '', imageUrl: '', description: '', uploading: false }]);
      setHotels([{ name: '', imageUrl: '', rating: 4.8, priceRange: '$$$', pricePerNight: '$180/night', uploading: false }]);
    }
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleHeroFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSpotImageUpload = async (index, file) => {
    if (!file) return;
    setTouristPlaces((prev) => {
      const updated = [...prev];
      updated[index].uploading = true;
      return updated;
    });

    try {
      const res = await uploadImage(file, 'wandersync/spots');
      const url = res.data?.url || res.url;
      setTouristPlaces((prev) => {
        const updated = [...prev];
        updated[index].imageUrl = url;
        updated[index].uploading = false;
        return updated;
      });
      showToast('Spot image uploaded successfully', 'success');
    } catch {
      setTouristPlaces((prev) => {
        const updated = [...prev];
        updated[index].uploading = false;
        return updated;
      });
      showToast('Failed to upload spot image', 'error');
    }
  };

  const handleHotelImageUpload = async (index, file) => {
    if (!file) return;
    setHotels((prev) => {
      const updated = [...prev];
      updated[index].uploading = true;
      return updated;
    });

    try {
      const res = await uploadImage(file, 'wandersync/hotels');
      const url = res.data?.url || res.url;
      setHotels((prev) => {
        const updated = [...prev];
        updated[index].imageUrl = url;
        updated[index].uploading = false;
        return updated;
      });
      showToast('Hotel image uploaded successfully', 'success');
    } catch {
      setHotels((prev) => {
        const updated = [...prev];
        updated[index].uploading = false;
        return updated;
      });
      showToast('Failed to upload hotel image', 'error');
    }
  };

  const handleAddTouristPlace = () => {
    setTouristPlaces((prev) => [
      ...prev,
      { name: '', imageUrl: '', description: '', uploading: false }
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
      { name: '', imageUrl: '', rating: 4.8, priceRange: '$$$', pricePerNight: '$180/night', uploading: false }
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
      showToast('Please enter Country and City first', 'warning');
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
          setTouristPlaces(data.touristPlaces.map((p) => ({ ...p, uploading: false })));
        }
        if (data.hotels && data.hotels.length > 0) {
          setHotels(data.hotels.map((h) => ({
            ...h,
            pricePerNight: h.pricePerNight || '$180/night',
            uploading: false
          })));
        }
        showToast(`AI generated spots and hotels for ${city}!`, 'success');
      }
    } catch {
      showToast('AI autofill failed. Please enter details manually.', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !country.trim() || !city.trim()) {
      showModal({
        title: 'Required Details Missing',
        message: 'Please provide Title, Country, and City for this destination.',
        type: 'warning'
      });
      return;
    }

    if (!selectedFile && !previewUrl) {
      showModal({
        title: 'Landmark Image Required',
        message: 'Please upload a primary landmark photo for the destination.',
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
    } else if (previewUrl) {
      formData.append('imageUrl', previewUrl);
    }

    const cleanSpots = touristPlaces
      .filter((p) => p.name.trim())
      .map(({ name, imageUrl, description }) => ({ name, imageUrl, description }));
    formData.append('touristPlaces', JSON.stringify(cleanSpots));

    const cleanHotels = hotels
      .filter((h) => h.name.trim())
      .map(({ name, imageUrl, rating, priceRange, pricePerNight }) => ({
        name,
        imageUrl,
        rating,
        priceRange,
        pricePerNight: pricePerNight || '$180/night'
      }));
    formData.append('hotels', JSON.stringify(cleanHotels));

    try {
      if (editItem) {
        await updateGalleryItem(editItem._id, formData);
        showToast('Destination updated successfully!', 'success');
      } else {
        await uploadGalleryItem(formData);
        showToast('Destination published to Atlas & Cloudinary!', 'success');
      }
      onSuccess();
      onClose();
    } catch (error) {
      showModal({
        title: 'Save Failed',
        message: error.response?.data?.message || 'Failed to save destination media.',
        type: 'danger'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#121215] border border-orange-500/30 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl shadow-orange-950/20 overflow-hidden font-sans my-auto">
        <div className="px-5 py-4 border-b border-border/80 bg-secondary/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Compass className="size-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {editItem ? 'Edit Destination' : 'Add New Destination'}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Upload destination hero photo, tourist spots, and hotel stays with nightly rates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAiAutofill}
              disabled={aiGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-sm shadow-orange-500/10"
              title="Autofill spots and hotels using Gemini AI"
            >
              <Sparkles className="size-3.5 text-orange-400" />
              <span>{aiGenerating ? 'AI Generating...' : 'AI Autofill'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold">Destination Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kyoto Cultural Immersion & Heritage"
              className="w-full px-3.5 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Country *</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Japan"
                className="w-full px-3.5 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kyoto"
                className="w-full px-3.5 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Region / Location</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Kansai Region, Honshu"
                className="w-full px-3.5 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
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

          <div className="space-y-2">
            <label className="text-zinc-300 font-semibold flex items-center justify-between">
              <span>Primary Landmark Hero Image *</span>
              {previewUrl && <span className="text-[10px] text-orange-400 font-bold">Photo selected</span>}
            </label>

            <div className="border-2 border-dashed border-border hover:border-orange-500/50 rounded-2xl p-4 text-center bg-secondary/20 transition-colors">
              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-36 sm:h-44 w-full object-cover rounded-xl border border-border/80 shadow-md"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <label className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold rounded-lg cursor-pointer text-xs transition-colors">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4">
                  <div className="size-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <UploadCloud className="size-5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground text-xs">Click to browse landmark photo</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Supports PNG, JPG, WebP up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeroFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Navigation className="size-3.5 text-orange-400" />
                <span>Tourist Places & Attractions ({touristPlaces.length})</span>
              </span>
              <button
                type="button"
                onClick={handleAddTouristPlace}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="size-3.5" /> Add Place
              </button>
            </div>

            <div className="space-y-3">
              {touristPlaces.map((spot, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-secondary/30 border border-border/70 rounded-xl space-y-2.5 relative"
                >
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Attraction name (e.g. Fushimi Inari Taisha)"
                      value={spot.name}
                      onChange={(e) => handleTouristPlaceChange(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-secondary/70 border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                    />
                    {touristPlaces.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTouristPlace(idx)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Short description of this place..."
                    value={spot.description}
                    onChange={(e) => handleTouristPlaceChange(idx, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 bg-secondary/70 border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                  />

                  <div className="flex items-center gap-3">
                    {spot.imageUrl ? (
                      <div className="relative group">
                        <img
                          src={spot.imageUrl}
                          alt={spot.name || 'Spot'}
                          className="size-14 rounded-lg object-cover border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => handleTouristPlaceChange(idx, 'imageUrl', '')}
                          className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary border border-border text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        {spot.uploading ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin text-orange-400" />
                            <span>Uploading photo...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="size-3.5 text-orange-400" />
                            <span>Upload Spot Photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={spot.uploading}
                          onChange={(e) => handleSpotImageUpload(idx, e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border/70">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Building className="size-3.5 text-orange-400" />
                <span>Hotels & Luxury Stays ({hotels.length})</span>
              </span>
              <button
                type="button"
                onClick={handleAddHotel}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="size-3.5" /> Add Hotel
              </button>
            </div>

            <div className="space-y-3">
              {hotels.map((hotel, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-secondary/30 border border-border/70 rounded-xl space-y-2.5 relative"
                >
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Hotel name (e.g. Hoshinoya Kyoto)"
                      value={hotel.name}
                      onChange={(e) => handleHotelChange(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-secondary/70 border border-border rounded-lg text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                    />
                    {hotels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveHotel(idx)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/70 border border-border rounded-lg">
                      <DollarSign className="size-3 text-orange-400" />
                      <input
                        type="text"
                        placeholder="e.g. $180/night"
                        value={hotel.pricePerNight}
                        onChange={(e) => handleHotelChange(idx, 'pricePerNight', e.target.value)}
                        className="w-full bg-transparent text-xs text-foreground font-semibold placeholder-muted-foreground/50 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/70 border border-border rounded-lg">
                      <Star className="size-3 text-amber-400 fill-amber-400" />
                      <span className="text-[11px] text-muted-foreground">Rating:</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={hotel.rating}
                        onChange={(e) => handleHotelChange(idx, 'rating', parseFloat(e.target.value) || 4.5)}
                        className="w-12 bg-transparent text-xs text-foreground font-bold focus:outline-none"
                      />
                    </div>

                    <select
                      value={hotel.priceRange}
                      onChange={(e) => handleHotelChange(idx, 'priceRange', e.target.value)}
                      className="px-2.5 py-1 bg-secondary/70 border border-border rounded-lg text-xs text-foreground focus:outline-none"
                    >
                      <option value="$">$ (Budget - Under $80)</option>
                      <option value="$$">$$ (Moderate - $80-$150)</option>
                      <option value="$$$">$$$ (Luxury - $150-$300)</option>
                      <option value="$$$$">$$$$ (Ultra Luxury - $300+)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    {hotel.imageUrl ? (
                      <div className="relative group">
                        <img
                          src={hotel.imageUrl}
                          alt={hotel.name || 'Hotel'}
                          className="size-14 rounded-lg object-cover border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => handleHotelChange(idx, 'imageUrl', '')}
                          className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary border border-border text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        {hotel.uploading ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin text-orange-400" />
                            <span>Uploading photo...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="size-3.5 text-orange-400" />
                            <span>Upload Hotel Photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={hotel.uploading}
                          onChange={(e) => handleHotelImageUpload(idx, e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border/70">
            <label className="text-zinc-300 font-semibold">Overview Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the experience, culture, and beauty of this destination..."
              className="w-full px-3.5 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving Destination...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="size-3.5" />
                  <span>{editItem ? 'Update Destination' : 'Publish Destination'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  MapPin,
  UploadCloud,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Compass
} from 'lucide-react';
import { fetchGalleryItems, uploadGalleryItem, deleteGalleryItem } from '../services/galleryService';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Loader from '../components/common/Loader';

const fallbackPhotos = [
  {
    _id: 'sample-1',
    title: 'Fushimi Inari Torii Gates',
    location: 'Kyoto, Japan',
    category: 'Cultural Heritage',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'sample-2',
    title: 'Amalfi Coastal Vista',
    location: 'Positano, Italy',
    category: 'Coastal',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'sample-3',
    title: 'Matterhorn Alpine Peak',
    location: 'Zermatt, Switzerland',
    category: 'Mountains',
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'sample-4',
    title: 'Santorini Sunset Over Caldera',
    location: 'Oia, Greece',
    category: 'Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'sample-5',
    title: 'Moraine Lake Reflections',
    location: 'Banff, Canada',
    category: 'Nature',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'sample-6',
    title: 'Tegallalang Rice Terraces',
    location: 'Ubud, Bali',
    category: 'Tropical',
    imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'sample-7',
    title: 'Eiffel Tower at Twilight',
    location: 'Paris, France',
    category: 'Cityscapes',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'sample-8',
    title: 'Reykjavik Northern Lights',
    location: 'Thingvellir, Iceland',
    category: 'Night Sky',
    imageUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80'
  }
];

export default function Gallery() {
  const { user } = useAuth();
  const { showModal, showToast } = useModal();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [category, setCategory] = useState('Landscape');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadGallery = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchGalleryItems(pageNum, 8);
      if (res.data?.items && res.data.items.length > 0) {
        setItems(res.data.items);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotalItems(res.data.total || res.data.items.length);
      } else {
        setItems(fallbackPhotos);
        setTotalPages(1);
        setTotalItems(fallbackPhotos.length);
      }
    } catch {
      setItems(fallbackPhotos);
      setTotalPages(1);
      setTotalItems(fallbackPhotos.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery(page);
  }, [page]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim() || !selectedFile) {
      showModal({
        title: 'Missing Fields',
        message: 'Please provide a title, location, and select an image file.',
        type: 'warning'
      });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('location', locationName);
    formData.append('category', category);
    formData.append('image', selectedFile);

    try {
      await uploadGalleryItem(formData);
      showToast('Photo published to WanderSync Gallery!', 'success');
      setUploadModalOpen(false);
      setTitle('');
      setLocationName('');
      setSelectedFile(null);
      setPreviewUrl('');
      loadGallery(1);
    } catch (error) {
      showModal({
        title: 'Upload Failed',
        message: error.response?.data?.message || 'Could not upload photo to Cloudinary.',
        type: 'danger'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    showModal({
      title: 'Delete Photo',
      message: 'Are you sure you want to delete this photo from the gallery?',
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteGalleryItem(id);
          showToast('Photo deleted', 'info');
          loadGallery(page);
        } catch {
          showToast('Failed to delete photo', 'error');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 border border-border text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Compass className="size-3.5" />
              Global Visual Archive
            </div>
            <h1 className="text-3xl sm:text-4xl font-normal font-['Instrument_Serif'] tracking-tight">
              WanderSync Travel Gallery
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans mt-1">
              Curated high-resolution perspectives captured across global destinations.
            </p>
          </div>

          {user?.role === 'admin' && (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="size-4" />
              <span>Add Photo</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader text="Loading visual gallery..." />
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedPhoto(item)}
                  className="group relative rounded-2xl overflow-hidden border border-border/80 bg-card hover:border-cyan-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white border border-white/10 font-sans">
                      {item.category}
                    </span>

                    {user?.role === 'admin' && (
                      <button
                        onClick={(e) => handleDelete(item._id, e)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                        title="Delete photo"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-1 bg-card">
                    <h3 className="text-sm font-semibold text-foreground font-heading group-hover:text-cyan-400 transition-colors truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
                      <MapPin className="size-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-border/60 font-sans">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3.5 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="size-4" />
                  <span>Previous</span>
                </button>
                <span className="text-xs text-muted-foreground font-medium px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3.5 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {selectedPhoto && (
          <div
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full rounded-3xl overflow-hidden bg-card border border-border/80 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 hover:bg-black text-white transition-all cursor-pointer"
              >
                <X className="size-5" />
              </button>
              <div className="flex-1 overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  className="max-h-[65vh] w-auto object-contain mx-auto"
                />
              </div>
              <div className="p-6 bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {selectedPhoto.category}
                  </span>
                  <h2 className="text-xl font-bold font-heading text-foreground">
                    {selectedPhoto.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans">
                    <MapPin className="size-3.5 text-cyan-400" />
                    <span>{selectedPhoto.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative max-w-lg w-full rounded-3xl p-6 sm:p-8 bg-card border border-border/80 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-heading text-foreground">Publish to Gallery</h3>
                  <p className="text-xs text-muted-foreground font-sans">Store compressed photo on Cloudinary & sync with database</p>
                </div>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 font-sans text-xs">
                <div className="space-y-1.5">
                  <label className="block font-medium text-muted-foreground">Photo Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Fushimi Inari Shrine Gate"
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-muted-foreground">Location</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Kyoto, Japan"
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-muted-foreground">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  >
                    <option value="Landscape" className="bg-card text-foreground">Landscape</option>
                    <option value="Cultural Heritage" className="bg-card text-foreground">Cultural Heritage</option>
                    <option value="Cityscapes" className="bg-card text-foreground">Cityscapes</option>
                    <option value="Coastal" className="bg-card text-foreground">Coastal & Beach</option>
                    <option value="Mountains" className="bg-card text-foreground">Mountains</option>
                    <option value="Nature" className="bg-card text-foreground">Nature & Wildlife</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-muted-foreground">Select Image (Compressed Cloudinary Upload)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-foreground hover:file:bg-secondary/80 cursor-pointer"
                  />
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mt-2 h-28 w-full object-cover rounded-xl border border-border"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  <UploadCloud className="size-4" />
                  <span>{submitting ? 'Uploading to Cloudinary...' : 'Publish to Gallery'}</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

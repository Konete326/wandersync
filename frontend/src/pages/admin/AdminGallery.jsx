import { useState, useEffect } from 'react';
import {
  MapPin,
  UploadCloud,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { fetchGalleryItems, uploadGalleryItem, deleteGalleryItem } from '@/services/galleryService';
import { useModal } from '@/context/ModalContext';
import Loader from '@/components/common/Loader';
import GlowingButton from '@/components/common/GlowingButton';

export default function AdminGallery() {
  const { showModal, showToast } = useModal();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [category, setCategory] = useState('Landscape');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadItems = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetchGalleryItems(pageNum, 8);
      if (res.data?.items) {
        setItems(res.data.items);
        setPage(res.data.page || pageNum);
        setTotalPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      }
    } catch {
      showToast('Could not load gallery items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems(page);
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
        title: 'Missing Details',
        message: 'Please provide a title, location, and choose a photo to upload.',
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
      showToast('Photo uploaded to Cloudinary & saved to Atlas!', 'success');
      setUploadModalOpen(false);
      setTitle('');
      setLocationName('');
      setSelectedFile(null);
      setPreviewUrl('');
      loadItems(1);
    } catch (error) {
      showModal({
        title: 'Upload Failed',
        message: error.response?.data?.message || 'Failed to upload photo.',
        type: 'danger'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    showModal({
      title: 'Delete Photo',
      message: 'Are you sure you want to permanently delete this photo from Cloudinary & Database?',
      type: 'danger',
      isConfirm: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteGalleryItem(id);
          showToast('Photo deleted from database and Cloudinary', 'info');
          loadItems(page);
        } catch {
          showToast('Failed to delete photo', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Media & Gallery Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage compressed destination photos synced with Cloudinary & MongoDB Atlas ({total} Total)
          </p>
        </div>
        <GlowingButton
          onClick={() => setUploadModalOpen(true)}
          size="sm"
          innerClassName="font-bold flex items-center gap-2"
        >
          <Plus className="size-4" />
          <span>Upload New Photo</span>
        </GlowingButton>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader text="Loading visual media..." />
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border text-center space-y-3 bg-card/40">
          <ImageIcon className="size-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-semibold text-foreground">No Gallery Items Published</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Upload high-resolution compressed destination imagery to display in the public WanderSync gallery.
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-xl border border-border cursor-pointer inline-flex items-center gap-2 mt-2"
          >
            <Plus className="size-3.5" />
            <span>Add First Photo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item) => (
              <div
                key={item._id}
                className="group relative rounded-2xl overflow-hidden border border-border bg-card flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="p-3.5 space-y-1 bg-card">
                  <h4 className="text-xs font-semibold text-foreground truncate">{item.title}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="size-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-border">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="size-3.5" />
                <span>Prev</span>
              </button>
              <span className="text-xs text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs text-foreground disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl p-6 bg-card border border-border shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-foreground">Upload to Cloudinary</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Oia Sunset View"
                  className="w-full px-3 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Location</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Santorini, Greece"
                  className="w-full px-3 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                >
                  <option value="Landscape">Landscape</option>
                  <option value="Cultural Heritage">Cultural Heritage</option>
                  <option value="Cityscapes">Cityscapes</option>
                  <option value="Coastal">Coastal & Beach</option>
                  <option value="Mountains">Mountains</option>
                  <option value="Nature">Nature & Wildlife</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium">Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-secondary file:text-foreground cursor-pointer"
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mt-2 h-24 w-full object-cover rounded-xl border border-border"
                  />
                )}
              </div>

              <GlowingButton
                type="submit"
                disabled={submitting}
                className="w-full mt-2"
                innerClassName="py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <UploadCloud className="size-4" />
                <span>{submitting ? 'Uploading to Cloudinary...' : 'Upload & Sync'}</span>
              </GlowingButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

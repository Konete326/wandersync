import { useState } from 'react';
import { User as UserIcon, Camera, Sparkles, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { updateUserProfile } from '../services/authService';
import { uploadImage } from '../services/mediaService';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { showToast, showModal } = useModal();

  const [name, setName] = useState(user?.name || '');
  const [travelStyle, setTravelStyle] = useState(user?.preferences?.travelStyle || 'moderate');
  const [currency, setCurrency] = useState(user?.preferences?.currency || 'USD');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadImage(file, 'wandersync/avatars');
      const updated = await updateUserProfile({ avatar: { url: res.data.url, publicId: res.data.publicId } });
      setUser(updated.data);
      showToast('Avatar updated successfully!', 'success');
    } catch (err) {
      showModal({
        title: 'Upload Failed',
        message: 'Could not upload profile photo. Please try another image.',
        type: 'danger'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateUserProfile({ name, travelStyle, currency });
      setUser(updated.data);
      showToast('Profile preferences saved!', 'success');
    } catch (err) {
      showToast('Failed to update preferences', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Traveler Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account credentials and travel preferences</p>
      </div>

      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-slate-800 pb-8">
          <div className="relative group">
            <img
              src={user.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400/60 shadow-xl"
            />
            <label className="absolute inset-0 bg-slate-950/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-xs text-slate-400">{user.email}</p>
            {uploading && <p className="text-xs text-cyan-400 italic">Uploading new avatar...</p>}
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Default Travel Style</label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="backpacker">Backpacker</option>
                <option value="budget">Budget</option>
                <option value="moderate">Moderate</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-white bg-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="PKR">PKR (₨)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Update Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

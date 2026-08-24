import { useState } from 'react';
import { Camera, Save, Shield, Check } from 'lucide-react';
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

  const isNameValid = !name || name.trim().length >= 2;

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
    if (!name.trim() || name.trim().length < 2) {
      showModal({
        title: 'Invalid Name',
        message: 'Name must be at least 2 characters long.',
        type: 'warning'
      });
      return;
    }

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
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-normal font-['Instrument_Serif'] text-foreground">Traveler Profile</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your account credentials and travel preferences</p>
      </div>

      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-border space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-border pb-8">
          <div className="relative group">
            <img
              src={user.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user.name}
              className="size-20 rounded-full object-cover border-2 border-cyan-400/60 shadow-xl"
            />
            <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="size-5 text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-lg font-bold text-foreground font-heading">{user.name}</h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            {uploading && <p className="text-xs text-cyan-400 italic">Uploading new avatar...</p>}
          </div>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-muted-foreground">Display Name</label>
              {!isNameValid && name ? (
                <span className="text-[10px] text-rose-400">Min 2 characters</span>
              ) : isNameValid && name ? (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Check className="size-3" /> Valid
                </span>
              ) : null}
            </div>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3.5 pr-9 py-2.5 rounded-xl bg-secondary/50 border text-xs text-foreground focus:outline-none transition-colors ${
                  !isNameValid && name
                    ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 bg-rose-950/10'
                    : isNameValid && name
                    ? 'border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 bg-emerald-950/10'
                    : 'border-border focus:ring-1 focus:ring-cyan-500/50'
                }`}
              />
              {isNameValid && name && (
                <Check className="size-3.5 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground">Default Travel Style</label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                <option value="budget" className="bg-card text-foreground">Budget Explorer</option>
                <option value="moderate" className="bg-card text-foreground">Moderate / Balanced</option>
                <option value="luxury" className="bg-card text-foreground">Luxury & Comfort</option>
                <option value="backpacker" className="bg-card text-foreground">Solo Backpacker</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground">Preferred Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/50 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              >
                <option value="USD" className="bg-card text-foreground">USD ($)</option>
                <option value="EUR" className="bg-card text-foreground">EUR (€)</option>
                <option value="GBP" className="bg-card text-foreground">GBP (£)</option>
                <option value="JPY" className="bg-card text-foreground">JPY (¥)</option>
                <option value="PKR" className="bg-card text-foreground">PKR (Rs)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="size-3.5" />
            <span>{saving ? 'Saving Changes...' : 'Save Preferences'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

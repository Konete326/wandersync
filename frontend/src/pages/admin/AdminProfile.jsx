import { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Key,
  Camera,
  CheckCircle2,
  Save,
  Globe,
  MapPin,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';

export default function AdminProfile() {
  const { user } = useAuth();
  const { showToast } = useModal();

  const [formData, setFormData] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@wandersync.com',
    role: user?.role || 'admin',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    bio: 'Lead Administrator & Travel Maestro Architect managing global itineraries, AI intelligence, and cloud services.',
    travelStyle: user?.preferences?.travelStyle || 'moderate',
    currency: user?.preferences?.currency || 'USD'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const [saving, setSaving] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Admin profile updated successfully', 'success');
    }, 600);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass) {
      showToast('Please fill all password fields', 'error');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    showToast('Admin password changed successfully', 'success');
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className="w-full space-y-4 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/80 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            Admin Profile
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage your credentials, root privileges, and system preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Shield className="size-3" />
            {formData.role.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <CheckCircle2 className="size-3 text-orange-400" />
            Active Session
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-start">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-2">
                <div className="size-16 sm:size-20 rounded-2xl overflow-hidden border-2 border-orange-500/40 bg-secondary">
                  <img
                    src={user?.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={formData.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="size-5 text-white" />
                </div>
              </div>

              <h2 className="text-base font-bold text-foreground">{formData.name}</h2>
              <p className="text-xs text-muted-foreground">{formData.email}</p>

              <div className="w-full grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/70">
                <div className="p-2 bg-secondary/40 border border-border/60 rounded-xl text-center">
                  <span className="block text-[9px] font-medium text-muted-foreground uppercase">Access</span>
                  <span className="text-[11px] font-bold text-foreground mt-0.5 block">Root Admin</span>
                </div>
                <div className="p-2 bg-secondary/40 border border-border/60 rounded-xl text-center">
                  <span className="block text-[9px] font-medium text-muted-foreground uppercase">Joined</span>
                  <span className="text-[11px] font-bold text-foreground mt-0.5 block">Jan 2026</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-orange-400 shrink-0" />
                <span>{formData.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="size-3.5 text-orange-400 shrink-0" />
                <span>Default Currency: {formData.currency}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-orange-400 shrink-0" />
                <span>Timezone: UTC-8 (Pacific)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <form onSubmit={handleSaveProfile} className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <User className="size-3.5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">General Information</h3>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-orange-500/20"
              >
                <Save className="size-3" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Full Name</label>
                <div className="relative">
                  <User className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 bg-secondary/50 border border-border/80 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 bg-secondary/50 border border-border/80 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-1.5 bg-secondary/50 border border-border/80 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Default Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-1.5 bg-secondary/50 border border-border/80 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="PKR">PKR (₨)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Bio / Notes</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-2 bg-secondary/50 border border-border/80 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50 resize-none"
                />
              </div>
            </div>
          </form>

          <form onSubmit={handlePasswordUpdate} className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Key className="size-3.5" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Security & Password</h3>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-xl border border-border transition-all cursor-pointer"
              >
                <span>Update Password</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Current Password</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 bg-secondary/50 border border-border/80 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">New Password</label>
                <input
                  type="password"
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 bg-secondary/50 border border-border/80 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Confirm Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 bg-secondary/50 border border-border/80 rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

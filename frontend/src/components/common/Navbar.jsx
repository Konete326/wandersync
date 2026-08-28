import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Sparkles, Shield, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import GlowingButton from './GlowingButton';
import NotificationBell from './NotificationBell';
import logoImg from '../../assets/logo.png';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { showModal, showToast } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    showModal({
      title: 'Sign Out',
      message: 'Are you sure you want to log out of WanderSync?',
      type: 'warning',
      isConfirm: true,
      confirmText: 'Sign Out',
      onConfirm: () => {
        logout();
        showToast('You have been logged out', 'info');
        navigate('/login');
      }
    });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logoImg} alt="WanderSync Logo" className="size-7 object-contain rounded-md shadow-sm" />
          <span className="text-2xl italic tracking-tight font-['Instrument_Serif'] text-foreground group-hover:opacity-90 transition-opacity">
            WanderSync
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 font-sans">

          <Link
            to="/gallery"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              isActive('/gallery')
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40 font-bold shadow-sm shadow-orange-500/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            <ImageIcon className="size-3.5" />
            <span>Gallery</span>
          </Link>
          <Link
            to="/pricing"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive('/pricing')
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40 font-bold shadow-sm shadow-orange-500/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            Pricing
          </Link>
          <Link
            to="/community"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              isActive('/community')
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40 font-bold shadow-sm shadow-orange-500/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            Community
          </Link>
          <Link
            to="/create"
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all ${
              isActive('/create')
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40 font-bold shadow-sm shadow-orange-500/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            <Sparkles className="size-3.5 text-orange-400" />
            <span>Create</span>
          </Link>
          {user && (
            <Link
              to="/my-trips"
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive('/my-trips')
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40 font-bold shadow-sm shadow-orange-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              My Journeys
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30"
            >
              <Shield className="size-3.5 text-orange-400" />
              <span>Admin Hub</span>
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <NotificationBell />

              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/40 hover:bg-secondary transition-colors"
              >
                <img
                  src={user.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="size-5 rounded-full object-cover border border-orange-400/40"
                />
                <span className="text-xs font-medium text-foreground">{user.name?.split(' ')[0]}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 text-muted-foreground hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <GlowingButton
                onClick={() => navigate('/register')}
                size="sm"
                innerClassName="py-1 px-3.5 text-xs font-bold font-sans"
              >
                <span>Get Started</span>
              </GlowingButton>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationBell />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 border-t border-border bg-background/95 backdrop-blur-md space-y-2 font-sans">

          <Link
            to="/gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            Gallery
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            Pricing
          </Link>
          <Link
            to="/community"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            Community
          </Link>
          <Link
            to="/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            Create Journey
          </Link>
          {user && (
            <Link
              to="/my-trips"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              My Journeys
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20"
            >
              Admin Command Center
            </Link>
          )}

          {user ? (
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <img
                  src={user.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="size-8 rounded-full object-cover border border-orange-400"
                />
                <div>
                  <p className="text-xs font-semibold text-foreground">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground">{user.email}</p>
                </div>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
              <GlowingButton
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/register');
                }}
                className="w-full"
                innerClassName="py-2.5 text-xs font-bold"
              >
                <span>Get Started</span>
              </GlowingButton>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

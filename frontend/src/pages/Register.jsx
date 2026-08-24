import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, MapPin, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import GlowingButton from '../components/common/GlowingButton';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showModal, showToast } = useModal();
  const navigate = useNavigate();

  const isNameValid = !name || name.trim().length >= 2;
  const isEmailValid = !email || emailRegex.test(email);
  const isPasswordValid = !password || password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });

    if (!name.trim() || !email.trim() || !password) {
      showModal({
        title: 'Missing Information',
        message: 'Please provide your full name, email address, and password.',
        type: 'warning'
      });
      return;
    }

    if (!emailRegex.test(email)) {
      showModal({
        title: 'Invalid Email',
        message: 'Please provide a valid email address (e.g. name@domain.com).',
        type: 'warning'
      });
      return;
    }

    if (password.length < 6) {
      showModal({
        title: 'Weak Password',
        message: 'Password must be at least 6 characters long.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      showToast('Account created successfully! Welcome to WanderSync.', 'success');
      navigate('/my-trips');
    } catch (error) {
      showModal({
        title: 'Registration Failed',
        message: error.response?.data?.message || 'Could not register account. Please check your credentials.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#09090b] text-[#fafafa] flex items-center justify-center p-3 sm:p-6 select-none overflow-hidden">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl">
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-card order-2 lg:order-1">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="lg:hidden mb-1">
                <Link
                  to="/"
                  className="text-white italic text-2xl font-['Instrument_Serif'] tracking-tight"
                >
                  WanderSync
                </Link>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
                Create Account
              </h1>
              <p className="text-xs text-muted-foreground font-sans">
                Sign up to start planning and saving your personalized journeys
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 font-sans">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-muted-foreground">Full Name</label>
                  {!isNameValid && name && (
                    <span className="text-[10px] text-rose-400 font-medium">Min 2 characters</span>
                  )}
                </div>
                <div className="relative">
                  <User className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg bg-secondary/50 border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none transition-colors ${
                      !isNameValid && name
                        ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 bg-rose-950/10'
                        : 'border-border focus:ring-1 focus:ring-cyan-500/50'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-muted-foreground">Email Address</label>
                  {!isEmailValid && email && (
                    <span className="text-[10px] text-rose-400 font-medium">Invalid email format</span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@example.com"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg bg-secondary/50 border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none transition-colors ${
                      !isEmailValid && email
                        ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 bg-rose-950/10'
                        : 'border-border focus:ring-1 focus:ring-cyan-500/50'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-medium text-muted-foreground">Password</label>
                  {!isPasswordValid && password && (
                    <span className="text-[10px] text-rose-400 font-medium">Min 6 characters</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-9 py-2 rounded-lg bg-secondary/50 border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none transition-colors ${
                      !isPasswordValid && password
                        ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 bg-rose-950/10'
                        : 'border-border focus:ring-1 focus:ring-cyan-500/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </button>
                </div>
              </div>

              <GlowingButton
                type="submit"
                disabled={loading}
                className="w-full mt-2"
                innerClassName="py-2.5 text-xs font-bold"
              >
                <span>{loading ? 'Creating...' : 'Create Account'}</span>
                <ArrowRight className="size-3.5" />
              </GlowingButton>
            </form>
          </div>

          <p className="text-center text-[11px] text-muted-foreground font-sans pt-2 border-t border-border/60">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-cyan-400 font-semibold hover:underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>

        <div className="hidden lg:flex flex-col justify-between p-8 bg-gradient-to-bl from-secondary/80 via-card to-background border-l border-border/60 relative overflow-hidden order-1 lg:order-2">
          <div className="space-y-6 relative z-10">
            <Link
              to="/"
              className="text-white italic text-2xl font-['Instrument_Serif'] tracking-tight hover:opacity-90 transition-opacity"
            >
              WanderSync
            </Link>

            <div className="space-y-2">
              <h2 className="text-2xl font-normal font-['Instrument_Serif'] leading-tight">
                Designed for seamless global expeditions
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                Organize hour-by-hour itineraries, track budgets in real-time, and download print-ready dossiers.
              </p>
            </div>

            <div className="space-y-3 font-sans">
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                  <Globe className="size-3.5 text-cyan-400" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Worldwide Destination Support</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                  <MapPin className="size-3.5 text-emerald-400" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Live Geolocation & Weather Mapping</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-3.5 text-blue-400" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">100% Offline PWA & PDF Exports</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 relative z-10">
            <p className="text-[11px] text-muted-foreground/80 font-sans">
              © 2026 WanderSync
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

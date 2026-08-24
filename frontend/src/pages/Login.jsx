import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, MapPin, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showModal, showToast } = useModal();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showModal({
        title: 'Missing Fields',
        message: 'Please enter both your email address and password.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email, password });
      showToast('Welcome back to WanderSync!', 'success');
      if (res.data?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/my-trips');
      }
    } catch (error) {
      showModal({
        title: 'Sign In Failed',
        message: error.response?.data?.message || 'Invalid email or password. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@gmail.com');
    setPassword('admin123');
    showToast('Admin test credentials populated', 'info');
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#09090b] text-[#fafafa] flex items-center justify-center p-3 sm:p-6 select-none overflow-hidden">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-border/80 bg-card shadow-2xl">
        <div className="hidden lg:flex flex-col justify-between p-8 bg-gradient-to-br from-secondary/80 via-card to-background border-r border-border/60 relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <Link
              to="/"
              className="text-white italic text-2xl font-['Instrument_Serif'] tracking-tight hover:opacity-90 transition-opacity"
            >
              WanderSync
            </Link>

            <div className="space-y-2">
              <h2 className="text-2xl font-normal font-['Instrument_Serif'] leading-tight">
                Welcome back to your travel command center
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                Access your personalized itineraries, live weather telemetry, and saved destinations.
              </p>
            </div>

            <div className="space-y-3 font-sans">
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                  <Globe className="size-3.5 text-cyan-400" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Intelligent Journey Synthesis</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                  <MapPin className="size-3.5 text-emerald-400" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Interactive Landmark Route Pointers</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-3.5 text-blue-400" />
                </div>
                <span className="text-xs text-foreground/90 font-medium">Offline Access & Instant PDF Dossiers</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 relative z-10">
            <p className="text-[11px] text-muted-foreground/80 font-sans">
              © 2026 WanderSync
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-4 bg-card">
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
                Sign In
              </h1>
              <p className="text-xs text-muted-foreground font-sans">
                Enter your credentials to access your trips
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 font-sans">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@example.com"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary/50 border border-border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary/50 border border-border text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs rounded-lg shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="size-3.5" />
              </button>

              <button
                type="button"
                onClick={fillAdminCredentials}
                className="w-full py-1.5 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-[11px] font-medium rounded-lg border border-border transition-colors cursor-pointer"
              >
                Demo Admin (admin@gmail.com)
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] text-muted-foreground font-sans pt-2 border-t border-border/60">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-cyan-400 font-semibold hover:underline underline-offset-4"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

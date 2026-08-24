import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, Compass, ShieldCheck, MapPin } from 'lucide-react';
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#09090b] text-[#fafafa] flex items-center justify-center p-4 sm:p-8 select-none">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-border/80 bg-card shadow-2xl">
        <div className="hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-secondary/80 via-card to-background border-r border-border/60 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 size-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
          <div className="space-y-8 relative z-10">
            <Link
              to="/"
              className="text-white italic text-3xl font-['Instrument_Serif'] tracking-tight hover:opacity-90 transition-opacity"
            >
              WanderSync
            </Link>

            <div className="space-y-3">
              <h2 className="text-3xl xl:text-4xl font-normal font-['Instrument_Serif'] leading-tight">
                Welcome back to your travel command center
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                Access your personalized itineraries, live weather telemetry, and saved destinations in one place.
              </p>
            </div>

            <div className="space-y-4 pt-2 font-sans">
              <div className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                  <Sparkles className="size-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Gemini 3.7 AI Engine</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">Instant day-by-day scheduling with morning, afternoon, and evening timelines.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                  <MapPin className="size-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Interactive Route Maps</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">Geographically pinned landmarks with direct commute estimates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Offline PWA & PDF Exports</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">Keep complete travel dossiers accessible even without cellular signal.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/40 relative z-10">
            <p className="text-[11px] text-muted-foreground/80 font-sans">
              © 2026 WanderSync • Created by Sameer
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10 xl:p-12 flex flex-col justify-between space-y-6 bg-card">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="lg:hidden mb-2">
                <Link
                  to="/"
                  className="text-white italic text-3xl font-['Instrument_Serif'] tracking-tight"
                >
                  WanderSync
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
                Sign In
              </h1>
              <p className="text-xs text-muted-foreground font-sans">
                Enter your account credentials to access your journeys
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
                <ArrowRight className="size-4" />
              </button>

              <button
                type="button"
                onClick={fillAdminCredentials}
                className="w-full py-2 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs font-medium rounded-xl border border-border transition-colors cursor-pointer"
              >
                Demo Admin Auto-Fill (admin@gmail.com)
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground font-sans pt-4 border-t border-border/60">
            Don't have an account yet?{' '}
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

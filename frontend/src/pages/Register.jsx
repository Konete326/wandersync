import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Compass, ArrowRight, Sparkles, CheckCircle2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [travelStyle, setTravelStyle] = useState('moderate');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showModal, showToast } = useModal();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      showModal({
        title: 'Missing Information',
        message: 'Please complete all required fields to register.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password, travelStyle });
      showToast('Account created successfully! Welcome to WanderSync.', 'success');
      navigate('/my-trips');
    } catch (error) {
      showModal({
        title: 'Registration Failed',
        message: error.response?.data?.message || 'Could not register account. Please check your details and try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#09090b] text-[#fafafa] flex items-center justify-center p-4 sm:p-8 select-none">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-border/80 bg-card shadow-2xl">
        <div className="p-6 sm:p-10 xl:p-12 flex flex-col justify-between space-y-6 bg-card order-2 lg:order-1">
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
                Create Account
              </h1>
              <p className="text-xs text-muted-foreground font-sans">
                Join WanderSync and begin creating bespoke itineraries with AI
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">Full Name</label>
                <div className="relative">
                  <User className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

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

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">Preferred Travel Style</label>
                <div className="relative">
                  <Compass className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  >
                    <option value="moderate" className="bg-card text-foreground">Moderate / Balanced</option>
                    <option value="budget" className="bg-card text-foreground">Budget Explorer</option>
                    <option value="luxury" className="bg-card text-foreground">Luxury & Comfort</option>
                    <option value="backpacker" className="bg-card text-foreground">Solo Backpacker</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account & Start'}</span>
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground font-sans pt-4 border-t border-border/60">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-cyan-400 font-semibold hover:underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>

        <div className="hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-gradient-to-bl from-secondary/80 via-card to-background border-l border-border/60 relative overflow-hidden order-1 lg:order-2">
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
          <div className="space-y-8 relative z-10">
            <Link
              to="/"
              className="text-white italic text-3xl font-['Instrument_Serif'] tracking-tight hover:opacity-90 transition-opacity"
            >
              WanderSync
            </Link>

            <div className="space-y-3">
              <h2 className="text-3xl xl:text-4xl font-normal font-['Instrument_Serif'] leading-tight">
                Begin your bespoke journey with Gemini AI
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                Experience tailored day-by-day travel architecture built specifically around your preferences.
              </p>
            </div>

            <div className="space-y-4 pt-2 font-sans">
              <div className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Unlimited Free Generations</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">Generate and refine itineraries for any city worldwide.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                  <Globe className="size-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Real-Time Currency & Budget Sync</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">Track actual expenses against automated travel budget estimates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center shrink-0">
                  <Sparkles className="size-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Collaborative Sharing & PDF Export</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">Share links with travel companions or download offline PDF dossiers.</p>
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
      </div>
    </div>
  );
};

export default Register;

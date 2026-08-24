import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Compass, ArrowRight } from 'lucide-react';
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
      showToast('Account created successfully!', 'success');
      navigate('/my-trips');
    } catch (error) {
      showModal({
        title: 'Registration Failed',
        message: error.response?.data?.message || 'Could not register account. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 select-none overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="size-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="size-80 rounded-full bg-blue-600/10 blur-[100px] -translate-y-20" />
      </div>

      <div className="w-full max-w-md liquid-glass-card rounded-3xl p-8 sm:p-10 border border-border/80 shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-block text-white italic text-3xl sm:text-4xl tracking-tight font-['Instrument_Serif'] hover:opacity-90 transition-opacity"
          >
            Lumora
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans">
            Start crafting bespoke travel itineraries with AI
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-secondary/60 border border-border text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-secondary/60 border border-border text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-secondary/60 border border-border text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">Travel Style</label>
            <div className="relative">
              <Compass className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-secondary/60 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
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
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm rounded-full shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-3 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
            <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground font-sans">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-cyan-400 font-semibold hover:underline underline-offset-4"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

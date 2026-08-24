import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
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
            Enter your credentials to access your journey space
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
                placeholder="admin@gmail.com"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm rounded-full shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-3 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground font-sans">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-cyan-400 font-semibold hover:underline underline-offset-4"
          >
            Create Free Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

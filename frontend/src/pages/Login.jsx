import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import logoImg from '../assets/logo.png';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card/90 rounded-2xl p-6 sm:p-8 border border-border shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <img src={logoImg} alt="WanderSync" className="h-10 w-auto mx-auto object-contain" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Sign In to WanderSync</h1>
          <p className="text-xs text-muted-foreground">Enter your credentials to access your travel command center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input border border-border text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input border border-border text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-foreground underline underline-offset-4 font-medium hover:text-primary">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

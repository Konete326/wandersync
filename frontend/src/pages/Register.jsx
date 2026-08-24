import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import logoImg from '../assets/logo.png';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card/90 rounded-2xl p-6 sm:p-8 border border-border shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <img src={logoImg} alt="WanderSync" className="h-10 w-auto mx-auto object-contain" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Join WanderSync</h1>
          <p className="text-xs text-muted-foreground">Start crafting intelligent travel itineraries</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input border border-border text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
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

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Travel Style</label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="moderate" className="bg-card text-foreground">Moderate / Balanced</option>
              <option value="budget" className="bg-card text-foreground">Budget Explorer</option>
              <option value="luxury" className="bg-card text-foreground">Luxury & Comfort</option>
              <option value="backpacker" className="bg-card text-foreground">Solo Backpacker</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-foreground underline underline-offset-4 font-medium hover:text-primary">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

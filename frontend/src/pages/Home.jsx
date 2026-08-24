import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Compass, MapPin, Calendar, ArrowRight, Shield, CloudSun, DollarSign, Share2 } from 'lucide-react';

const quickPrompts = [
  { label: '5-Day Cultural Kyoto', prompt: '5-day cultural immersion in Kyoto with historic temples, matcha cafes, and serene bamboo groves' },
  { label: '3-Day Romantic Paris', prompt: '3-day romantic getaway in Paris with boutique cafes, art galleries, and evening river cruises' },
  { label: '7-Day Bali Backpacking', prompt: '7-day budget backpacking trip in Bali with surfing spots, waterfalls, and local street food' },
  { label: '4-Day Swiss Alpine Adventure', prompt: '4-day scenic adventure in the Swiss Alps with cable car rides, alpine hikes, and fondue dining' }
];

const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
    title: 'Gemini AI Maestro',
    description: 'Instant, hyper-personalized multi-day schedules with morning, afternoon, and evening timelines.'
  },
  {
    icon: <MapPin className="w-6 h-6 text-emerald-400" />,
    title: 'Interactive Maps & Weather',
    description: 'Pinpointed geographical coordinates, route lines, and real-time 7-day destination forecasts.'
  },
  {
    icon: <DollarSign className="w-6 h-6 text-amber-400" />,
    title: 'Smart Expense Tracker',
    description: 'Log actual trip expenses against AI budget estimates with visual category breakdowns.'
  },
  {
    icon: <Share2 className="w-6 h-6 text-indigo-400" />,
    title: 'PDF Export & Sharing',
    description: 'Download offline travel PDFs or share unique read-only links with your travel companions.'
  }
];

const Home = () => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    navigate('/create', { state: { initialPrompt: prompt } });
  };

  const handleQuickPrompt = (quickText) => {
    navigate('/create', { state: { initialPrompt: quickText } });
  };

  return (
    <div className="flex flex-col gap-20 py-8 sm:py-16">
      <section className="relative max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles className="w-4 h-4" />
          Next-Gen AI Travel Companion
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.1]">
          Where will your curiosity <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">take you next?</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
          Transform your travel ideas into tailored, day-by-day itineraries complete with interactive maps, live weather, and budget tracking in seconds.
        </p>

        <form onSubmit={handleGenerate} className="mt-10 w-full max-w-2xl relative">
          <div className="p-2 sm:p-3 rounded-2xl liquid-glass border border-cyan-500/40 shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-3">
              <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. 5 days in Tokyo for anime, ramen and photography..."
                className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all group shrink-0"
            >
              <span>Build Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl">
          <span className="text-xs text-slate-400 mr-2 font-medium">Quick Ideas:</span>
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(item.prompt)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/40 hover:text-cyan-300 transition-all cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Engineered for Seamless Exploration</h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">Everything you need to orchestrate the ultimate adventure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl liquid-glass-card border border-slate-800 hover:border-slate-700 transition-all group hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

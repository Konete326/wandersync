import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  CloudSun,
  DollarSign,
  Share2,
  FileDown,
  Shield,
  Smartphone,
  ArrowRight
} from 'lucide-react';

const featureList = [
  {
    icon: <Sparkles className="size-6 text-cyan-400" />,
    title: 'Gemini AI Maestro',
    badge: 'Core Engine',
    description: 'Instant multi-model pipeline utilizing Gemini 3.7 & 3.6 Flash for intelligent itineraries with zero hallucinated routes.'
  },
  {
    icon: <MapPin className="size-6 text-emerald-400" />,
    title: 'Interactive Leaflet Maps',
    badge: 'Geo-Spatial',
    description: 'Live pinned coordinates, geographic markers, and direct visual routes for daily activities across the globe.'
  },
  {
    icon: <CloudSun className="size-6 text-amber-400" />,
    title: 'Live Weather Telemetry',
    badge: 'Real-Time',
    description: 'Accurate 7-day temperature, humidity, and condition forecasts synced with your travel departure dates.'
  },
  {
    icon: <DollarSign className="size-6 text-blue-400" />,
    title: 'Multi-Currency Budgeting',
    badge: 'Finance',
    description: 'Log and track real-time trip expenses against initial estimates with categorized spending breakdowns.'
  },
  {
    icon: <FileDown className="size-6 text-indigo-400" />,
    title: 'Print-Ready PDF Export',
    badge: 'Offline',
    description: 'One-click generation of beautifully formatted travel itineraries with maps, emergency contacts, and daily schedules.'
  },
  {
    icon: <Smartphone className="size-6 text-teal-400" />,
    title: 'Progressive Web App (PWA)',
    badge: 'Native Feel',
    description: 'Install as a desktop or mobile application with offline asset caching and zero battery drain.'
  },
  {
    icon: <Share2 className="size-6 text-rose-400" />,
    title: 'Collaborative Sharing',
    badge: 'Social',
    description: 'Generate clean read-only share slugs to send your travel dossiers to friends, family, or travel clients.'
  },
  {
    icon: <Shield className="size-6 text-cyan-300" />,
    title: 'Enterprise-Grade Security',
    badge: 'Protection',
    description: 'JWT-authenticated token storage, encrypted MongoDB Atlas clustering, and strict role permissions.'
  }
];

export default function Features() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            Cutting-Edge Travel Capabilities
          </div>
          <h1 className="text-4xl sm:text-6xl font-normal font-['Instrument_Serif'] tracking-tight">
            Engineered for Modern Explorers
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            Every tool and intelligence layer you need to turn dream destinations into frictionless realities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureList.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl liquid-glass-card border border-border/80 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 hover:-translate-y-1 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-secondary border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
                    {f.icon}
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-secondary/80 text-muted-foreground border border-border">
                    {f.badge}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground font-heading">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                    {f.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 sm:p-12 rounded-3xl liquid-glass border border-cyan-500/30 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-['Instrument_Serif']">
            Experience the Future of Travel Planning
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto font-sans">
            Join thousands of travelers who plan smarter, faster, and with complete clarity.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm rounded-full transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <span>Create Your First Trip</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

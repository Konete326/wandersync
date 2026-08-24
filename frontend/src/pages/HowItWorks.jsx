import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Compass, Share2, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: <Compass className="size-6 text-cyan-400" />,
    title: 'Define Your Travel Vision',
    description: 'Select your dream destination, travel style, companion group, and custom vibes — from culinary explorations to high-altitude adventures.'
  },
  {
    step: '02',
    icon: <Sparkles className="size-6 text-emerald-400" />,
    title: 'Gemini Maestro Synthesis',
    description: 'Our next-generation AI orchestrates hour-by-hour itineraries with morning, afternoon, and evening curated activities, hidden gems, and travel tips.'
  },
  {
    step: '03',
    icon: <MapPin className="size-6 text-blue-400" />,
    title: 'Live Maps & Weather Alignment',
    description: 'Every point of interest is geographically pinned on interactive Leaflet maps with live weather forecasts and automated commute estimations.'
  },
  {
    step: '04',
    icon: <Share2 className="size-6 text-purple-400" />,
    title: 'Offline Sync & Real-Time Sharing',
    description: 'Download print-ready PDF travel dossiers, install as a standalone PWA, or collaborate with co-travelers via real-time shareable links.'
  }
];

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            Seamless Journey Architecture
          </div>
          <h1 className="text-4xl sm:text-6xl font-normal font-['Instrument_Serif'] tracking-tight">
            How WanderSync Works
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            From raw inspiration to an orchestrated master itinerary in under 10 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="p-8 rounded-2xl liquid-glass-card border border-border/80 space-y-5 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="size-12 rounded-xl bg-secondary/80 border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>
                <span className="font-['Instrument_Serif'] italic text-3xl text-muted-foreground/40 font-bold">
                  {item.step}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 sm:p-12 rounded-3xl liquid-glass border border-cyan-500/30 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-['Instrument_Serif']">
            Ready to craft your next unforgettable expedition?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto font-sans">
            Start free without credit card requirements and experience AI-driven travel design.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm rounded-full transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <span>Start Building Now</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import GlowingButton from '../components/common/GlowingButton';

const plans = [
  {
    name: 'Explorer',
    badge: 'Free Forever',
    price: '$0',
    frequency: '/month',
    description: 'Perfect for weekend getaways and solo wanderers looking for quick inspiration.',
    features: [
      '3 AI Generated Itineraries per month',
      'Interactive Leaflet Maps & Routes',
      '7-Day Live Weather Telemetry',
      'Basic Expense Tracker',
      'Standard Community Sharing'
    ],
    cta: 'Start Free',
    highlighted: false
  },
  {
    name: 'Maestro Pro',
    badge: 'Most Popular',
    price: '$12',
    frequency: '/month',
    description: 'For passionate globetrotters who demand limitless generation and offline freedom.',
    features: [
      'Unlimited Gemini 3.7 Flash Generations',
      'Full Offline PDF Dossier Downloads',
      'Multi-Currency Live Budget Sync',
      'Real-Time Collaboration Links',
      'Priority Cloudinary Image Caching',
      'Custom Itinerary AI Chat Refinements'
    ],
    cta: 'Get Maestro Pro',
    highlighted: true
  },
  {
    name: 'Concierge Elite',
    badge: 'Tailored Luxury',
    price: '$29',
    frequency: '/month',
    description: 'Designed for luxury travelers, agencies, and curated group expeditions.',
    features: [
      'Everything in Maestro Pro',
      'Custom Branding on PDF Exports',
      'Dedicated Travel Concierge AI Prompts',
      'High-Resolution Route Exporting',
      'VIP 24/7 Priority Support',
      'Multi-User Group Admin Controls'
    ],
    cta: 'Join Concierge Elite',
    highlighted: false
  }
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            Transparent Investment
          </div>
          <h1 className="text-4xl sm:text-6xl font-normal font-['Instrument_Serif'] tracking-tight">
            Simple, Honest Pricing
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto font-sans leading-relaxed">
            Choose the plan that fits your travel style. Upgrade or cancel anytime with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`p-8 rounded-3xl flex flex-col justify-between space-y-6 transition-all duration-200 ${
                p.highlighted
                  ? 'liquid-glass border-2 border-cyan-500/60 shadow-2xl shadow-cyan-950/40 relative scale-100 lg:-translate-y-2'
                  : 'liquid-glass-card border border-border/80'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono px-2.5 py-1 rounded-full bg-secondary text-cyan-400 border border-border">
                    {p.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-normal font-['Instrument_Serif']">{p.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-bold font-heading text-foreground">
                    {p.price}
                  </span>
                  <span className="text-xs text-muted-foreground font-sans font-medium">
                    {p.frequency}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  {p.description}
                </p>
                <div className="pt-4 border-t border-border/60 space-y-2.5">
                  {p.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-xs text-foreground/90 font-sans">
                      <Check className="size-3.5 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <GlowingButton
                onClick={() => navigate('/create')}
                className="w-full"
                innerClassName="py-3 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>{p.cta}</span>
                <ArrowRight className="size-3.5" />
              </GlowingButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

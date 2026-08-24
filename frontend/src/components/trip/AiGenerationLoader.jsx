import { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  CloudSun,
  Sparkles,
  Plane,
  Clock,
  ShieldCheck
} from 'lucide-react';

const phases = [
  {
    step: 1,
    title: 'Scanning Destination & Top Attractions',
    detail: 'Retrieving landmark coordinates, regional highlights, and cultural heritage spots...',
    icon: MapPin
  },
  {
    step: 2,
    title: 'Structuring Morning, Afternoon & Evening Routes',
    detail: 'Organizing day-by-day activities to minimize commute time and maximize enjoyment...',
    icon: Calendar
  },
  {
    step: 3,
    title: 'Querying Weather & Seasonal Telemetry',
    detail: 'Analyzing forecast trends to pair optimal indoor and outdoor experiences...',
    icon: CloudSun
  },
  {
    step: 4,
    title: 'Calibrating Budget, Dining & Stays',
    detail: 'Estimating expense distributions, local delicacies, and neighborhood stays...',
    icon: Compass
  },
  {
    step: 5,
    title: 'Polishing Your Bespoke Travel Itinerary',
    detail: 'Finalizing JSON data structures, packing checklists, and emergency safety guidelines...',
    icon: Sparkles
  }
];

const travelTips = [
  'Pro Tip: Morning activities are structured for golden-hour lighting and low crowd volume.',
  'AI Intelligence: Schedules automatically adjust pacing based on your companion and travel style.',
  'Weather Telemetry: Activities match historical weather patterns for the smoothest experience.',
  'Smart Budgeting: Daily cost estimates breakdown transit, food, and sightseeing expenses.',
  'Local Immersion: Hand-picked hidden gems are embedded directly into your daily timeline.'
];

export default function AiGenerationLoader({ destination = 'your destination', durationDays = 5 }) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    const phaseInterval = setInterval(() => {
      setCurrentPhaseIndex((prev) => {
        const next = prev < phases.length - 1 ? prev + 1 : prev;
        setProgress(Math.min(20 + next * 18, 95));
        return next;
      });
    }, 3200);

    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % travelTips.length);
    }, 4000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(phaseInterval);
      clearInterval(tipInterval);
    };
  }, []);

  const activePhase = phases[currentPhaseIndex];
  const ActiveIcon = activePhase.icon;

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4 font-sans text-center space-y-8 animate-in fade-in duration-300">
      <div className="relative size-28 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-ping opacity-30" />
        <div className="absolute -inset-3 rounded-full border border-orange-500/30 animate-spin" style={{ animationDuration: '12s' }} />
        <div className="size-20 rounded-2xl bg-gradient-to-br from-orange-500/20 via-[#18181b] to-[#121215] border border-orange-500/40 flex items-center justify-center shadow-xl shadow-orange-950/40 text-orange-400">
          <Plane className="size-9 animate-bounce text-orange-400" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="size-3.5" />
          <span>Gemini 3.7 AI Maestro Active</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
          Designing Your {durationDays}-Day {destination} Experience
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Our generative AI engine is crafting a bespoke, day-by-day travel plan with verified spots, weather, and budget tips.
        </p>
      </div>

      <div className="bg-[#121215] border border-orange-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl text-left space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/80 pb-3">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <ActiveIcon className="size-4 text-orange-400 animate-pulse" />
            <span>{activePhase.title}</span>
          </span>
          <span className="font-mono text-[11px] text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/50 flex items-center gap-1">
            <Clock className="size-3" />
            <span>{secondsElapsed}s elapsed</span>
          </span>
        </div>

        <div className="w-full bg-secondary/80 h-2 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 rounded-full transition-all duration-700 ease-out shadow-sm shadow-orange-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-zinc-300 min-h-[32px] transition-all duration-300">
          {activePhase.detail}
        </p>

        <div className="grid grid-cols-5 gap-1.5 pt-2">
          {phases.map((p, idx) => (
            <div
              key={p.step}
              className={`h-1.5 rounded-full transition-colors ${
                idx <= currentPhaseIndex ? 'bg-orange-500' : 'bg-secondary'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-secondary/40 border border-border/70 rounded-xl p-4 flex items-center gap-3 text-left">
        <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
          <ShieldCheck className="size-4" />
        </div>
        <p className="text-xs text-zinc-300 italic min-h-[20px] transition-all duration-300">
          "{travelTips[currentTipIndex]}"
        </p>
      </div>
    </div>
  );
}

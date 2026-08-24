import {
  Sparkles,
  CheckCircle2,
  GitBranch,
  History
} from 'lucide-react';

const releaseLog = {
  version: 'v1.0.0',
  date: 'February 2026',
  status: 'Production Release',
  badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  title: 'WanderSync AI Maestro Official Launch',
  description: 'Initial production rollout of the full-stack MERN travel planner with Google Gemini Generative AI, Cloudinary media CDN, Leaflet mapping, and Dark Black modern minimal UI.',
  highlights: [
    'Gemini AI Itinerary Maestro with structured day-by-day JSON generation',
    'Interactive Activity Reordering & Drag Timeline management',
    'Cloudinary image uploading for user profiles and trip cover galleries',
    'Real-time 7-day weather forecasts powered by Open-Meteo REST API',
    'Client-side high-fidelity PDF export with jsPDF',
    'Protected JWT authentication and role-based admin routing',
    'Full compliance with <=120 line backend files and zero comments rule'
  ]
};

export default function AdminChangelog() {
  return (
    <div className="w-full space-y-3.5 max-w-5xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <History className="size-3.5" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-heading">
              Product Changelog
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
              Current: v1.0.0
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Production release notes, platform capabilities, and architectural milestones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-secondary/70 text-zinc-300 border border-border">
            <GitBranch className="size-3 text-orange-400" />
            <span>Branch: main</span>
          </span>
        </div>
      </div>

      <div className="bg-[#121215] border border-border rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Sparkles className="size-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-foreground">{releaseLog.version}</h2>
                <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold border ${releaseLog.badgeColor}`}>
                  {releaseLog.status}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">{releaseLog.date}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-bold text-foreground">
            {releaseLog.title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {releaseLog.description}
          </p>
        </div>

        <div className="space-y-2 pt-1 border-t border-border/60">
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
            Delivered Capabilities & Features
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {releaseLog.highlights.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border/60 text-xs text-zinc-300"
              >
                <CheckCircle2 className="size-3.5 text-orange-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  History,
  Sparkles,
  Shield,
  Zap,
  CheckCircle2,
  GitBranch,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const releaseLogs = [
  {
    version: 'v1.0.0',
    date: 'February 2026',
    status: 'Latest Stable',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
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
  },
  {
    version: 'v1.1.0-preview',
    date: 'March 2026 (Planned)',
    status: 'In Development',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    title: 'Multi-Turn Conversational Refinements & Voice Prompts',
    description: 'Expanding Gemini AI integration with live speech-to-text input, intelligent budget re-balancer, and real-time collaborative sharing.',
    highlights: [
      'Web Speech API integration for natural language voice prompt creation',
      'Real-time multi-currency converter with live exchange rates',
      'Collaborative itinerary sharing with live WebSockets sync',
      'Offline PWA caching for travel plans with IndexedDB'
    ]
  }
];

export default function AdminChangelog() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            Product Changelog & Updates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track version releases, feature additions, architecture upgrades, and system milestones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <GitBranch className="size-3.5" />
            Branch: main (v1.0.0)
          </span>
        </div>
      </div>

      <div className="space-y-6 w-full">
        {releaseLogs.map((log, index) => (
          <div
            key={log.version}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-secondary border border-border flex items-center justify-center text-cyan-400 font-bold font-mono text-sm">
                  {index === 0 ? <Sparkles className="size-4" /> : <Layers className="size-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-foreground">{log.version}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${log.badgeColor}`}>
                      {log.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{log.date}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                {log.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {log.description}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Key Deliverables & Capabilities
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {log.highlights.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border/70 text-xs text-foreground/90"
                  >
                    <CheckCircle2 className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

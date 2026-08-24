import { useLocation, Link } from 'react-router-dom';
import {
  Compass,
  Users,
  Sparkles,
  Receipt,
  Image,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const routeConfigs = {
  '/admin/trips': {
    title: 'Trips Maestro Management',
    subtitle: 'Comprehensive control center for moderating, inspecting, and managing all AI-generated travel itineraries across the globe.',
    icon: Compass,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    plannedFeatures: [
      'Global Itinerary Search & Advanced Filter Engine',
      'Real-time Destination Popularity Heatmaps',
      'Batch PDF Export & Sharing Moderation',
      'User Itinerary Revision History Inspection'
    ],
    eta: 'Sprint 2 (Q1 2026)'
  },
  '/admin/users': {
    title: 'Travelers & Member Directory',
    subtitle: 'Manage traveler accounts, permissions, authentication security, and personalized travel profile preferences.',
    icon: Users,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    plannedFeatures: [
      'Role-based access control (Admin / Traveler)',
      'Account suspension & activity logs',
      'Travel preference & dietary requirement metrics',
      'Direct user password reset & token invalidation'
    ],
    eta: 'Sprint 2 (Q1 2026)'
  },
  '/admin/ai-analytics': {
    title: 'Gemini AI Telemetry & Analytics',
    subtitle: 'Deep performance metrics, prompt token usage, response times, and model accuracy logs for Google Gemini Generative AI.',
    icon: Sparkles,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    plannedFeatures: [
      'Live Gemini API Token Consumption Graphs',
      'Prompt Success vs. Error Rate Tracking',
      'Destination Keyword & Persona Distribution',
      'Model Switcher & Performance Benchmarking'
    ],
    eta: 'Sprint 3 (Q1 2026)'
  },
  '/admin/expenses': {
    title: 'Platform Expenses & Monetary Logs',
    subtitle: 'Track aggregate traveler budgets, estimated vs. actual expenses, and platform subscription/tier analytics.',
    icon: Receipt,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    plannedFeatures: [
      'Multi-currency expense aggregation dashboard',
      'Category spend distribution charts (Stay, Food, Transit)',
      'Receipt attachment validation',
      'Budget deviation anomaly alerts'
    ],
    eta: 'Sprint 3 (Q2 2026)'
  },
  '/admin/media': {
    title: 'Cloudinary CDN Asset Manager',
    subtitle: 'Manage trip cover photos, user avatars, CDN bandwidth usage, and automated media optimization pipelines.',
    icon: Image,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    plannedFeatures: [
      'Cloudinary storage quota & bandwidth tracker',
      'Orphaned image detection & clean-up',
      'Automatic WebP conversion & edge caching',
      'Batch gallery uploader and image tagging'
    ],
    eta: 'Sprint 3 (Q2 2026)'
  }
};

export default function AdminComingSoon() {
  const location = useLocation();
  const current = routeConfigs[location.pathname] || {
    title: 'Module Under Construction',
    subtitle: 'This section of the WanderSync Admin Command Center is currently in active development.',
    icon: Clock,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    plannedFeatures: [
      'High-performance asynchronous API endpoints',
      'Modern dark black glassmorphism UI',
      '100% Mobile Responsive design'
    ],
    eta: 'Coming Soon'
  };

  const IconComponent = current.icon;

  return (
    <div className="w-full space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-border/80 pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-heading">
            {current.title}
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {current.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${current.bg} ${current.color}`}>
            <Clock className="size-3" />
            {current.eta}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className={`size-14 rounded-2xl border flex items-center justify-center ${current.bg} ${current.color}`}>
              <IconComponent className="size-7" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-semibold">
                Feature Roadmap
              </span>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Architectural Blueprint
              </h2>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            This module is being built to provide super admins with end-to-end visibility and real-time management capabilities across WanderSync. Full data persistence and interactive tables are scheduled for the next development release.
          </p>

          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Planned Capabilities in this Module
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.plannedFeatures.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3.5 rounded-xl bg-secondary/50 border border-border text-xs text-foreground/90 font-medium"
                >
                  <CheckCircle2 className="size-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-foreground">Active Admin Controls</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              While this specific module is being finalized, you can access full system metrics, customize your administrator profile, review changelogs, and modify engine configurations.
            </p>

            <div className="space-y-2 pt-2">
              <Link
                to="/admin"
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs font-semibold text-foreground transition-colors group"
              >
                <span>Go to Main Dashboard</span>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs font-semibold text-foreground transition-colors group"
              >
                <span>Configure AI Engine</span>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                to="/admin/profile"
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-xs font-semibold text-foreground transition-colors group"
              >
                <span>Edit Admin Profile</span>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

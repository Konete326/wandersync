import { useState } from 'react';
import {
  Sparkles,
  Database,
  Save,
  CheckCircle2,
  Sliders,
  Code2
} from 'lucide-react';
import { useModal } from '@/context/ModalContext';

export default function AdminSettings() {
  const { showToast } = useModal();

  const [aiSettings, setAiSettings] = useState({
    model: 'gemini-1.5-flash',
    temperature: '0.7',
    maxTokens: '4096',
    rateLimitPerMin: '60',
    strictJsonSchema: true
  });

  const [generalSettings, setGeneralSettings] = useState({
    appName: 'WanderSync',
    tagline: 'AI Powered Itinerary Maestro',
    defaultCurrency: 'USD',
    defaultDays: 5,
    pdfWatermark: true,
    publicSharingEnabled: true
  });

  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Settings saved successfully', 'success');
    }, 600);
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-3 font-sans select-none pb-8">
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#121215] border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Sliders className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">System Settings</h1>
            <p className="text-[11px] text-muted-foreground">
              Configure AI parameters, cloud services, and variables
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md shadow-orange-500/20 disabled:opacity-50"
        >
          <Save className="size-3.5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border pb-4">
            <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Gemini AI Engine Parameters</h3>
              <p className="text-xs text-muted-foreground">Manage Google Gemini model routing and response rules.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Default Generative Model</label>
              <select
                value={aiSettings.model}
                onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              >
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra Fast / Low Latency)</option>
                <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Advanced Reasoning)</option>
                <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Multimodal Analysis)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Creativity Temperature (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.0"
                  max="1.0"
                  value={aiSettings.temperature}
                  onChange={(e) => setAiSettings({ ...aiSettings, temperature: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Max Output Tokens</label>
                <input
                  type="number"
                  value={aiSettings.maxTokens}
                  onChange={(e) => setAiSettings({ ...aiSettings, maxTokens: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
              </div>
            </div>

            <div className="p-3.5 bg-secondary/50 rounded-xl border border-border flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-foreground block">Strict JSON Output Schema</span>
                <span className="text-[11px] text-muted-foreground">Enforce valid day-by-day JSON format on API generation</span>
              </div>
              <input
                type="checkbox"
                checked={aiSettings.strictJsonSchema}
                onChange={(e) => setAiSettings({ ...aiSettings, strictJsonSchema: e.target.checked })}
                className="size-4 rounded accent-orange-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-border pb-4">
            <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Sliders className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Application Preferences</h3>
              <p className="text-xs text-muted-foreground">General platform defaults and export settings.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Application Title</label>
              <input
                type="text"
                value={generalSettings.appName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, appName: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Platform Tagline</label>
              <input
                type="text"
                value={generalSettings.tagline}
                onChange={(e) => setGeneralSettings({ ...generalSettings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Default Currency</label>
                <select
                  value={generalSettings.defaultCurrency}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, defaultCurrency: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="PKR">PKR (₨)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Default Trip Duration</label>
                <input
                  type="number"
                  value={generalSettings.defaultDays}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, defaultDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-border pb-4">
            <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Database className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Connected Cloud Services</h3>
              <p className="text-xs text-muted-foreground">Live infrastructure & API status monitors.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-secondary/50 rounded-xl border border-border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">MongoDB Atlas M0</span>
                <span className="text-[10px] text-muted-foreground">Cloud Database Cluster</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                <CheckCircle2 className="size-3 text-orange-400" /> Online
              </span>
            </div>

            <div className="p-3.5 bg-secondary/50 rounded-xl border border-border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">Google Gemini API</span>
                <span className="text-[10px] text-muted-foreground">AI Intelligence Studio</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                <CheckCircle2 className="size-3 text-orange-400" /> Active
              </span>
            </div>

            <div className="p-3.5 bg-secondary/50 rounded-xl border border-border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">Cloudinary CDN</span>
                <span className="text-[10px] text-muted-foreground">Media & Avatar Storage</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                <CheckCircle2 className="size-3 text-orange-400" /> Active
              </span>
            </div>

            <div className="p-3.5 bg-secondary/50 rounded-xl border border-border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">Open-Meteo REST</span>
                <span className="text-[10px] text-muted-foreground">Live 7-Day Weather API</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
                <CheckCircle2 className="size-3 text-orange-400" /> Active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 border-b border-border pb-4">
              <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Code2 className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Project & Engineering Credits</h3>
                <p className="text-xs text-muted-foreground">Architectural authorship & system release notes.</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="p-4 rounded-xl bg-secondary/60 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">System Framework</span>
                  <span className="text-xs font-bold text-foreground">WanderSync Maestro Engine</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Release Version</span>
                  <span className="text-xs font-mono text-orange-400 font-semibold">v1.0.0 (Production)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Engineering Lead</span>
                  <span className="text-xs font-semibold text-foreground">Created by Sameer</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Organization / Brand</span>
                  <span className="text-xs font-semibold text-foreground">Elite Dev</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>© 2026 Elite Dev</span>
            <span className="font-semibold text-foreground">Created by Sameer</span>
          </div>
        </div>
      </div>
    </div>
  );
}

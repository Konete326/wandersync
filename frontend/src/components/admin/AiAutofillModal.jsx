import { useState } from 'react';
import { Sparkles, X, Wand2, Loader2, ArrowRight } from 'lucide-react';
import { generateEntityWithAi } from '@/services/aiService';
import { useModal } from '@/context/ModalContext';
import GlowingButton from '@/components/common/GlowingButton';

const QUICK_SUGGESTIONS = {
  country: ['Japan', 'Switzerland', 'Pakistan', 'Italy', 'Iceland', 'United Arab Emirates'],
  spot: ['Mount Fuji, Japan', 'Eiffel Tower, Paris', 'Hunza Valley, Pakistan', 'Burj Khalifa, Dubai', 'Colosseum, Rome'],
  hotel: ['Burj Al Arab, Dubai', 'Marina Bay Sands, Singapore', 'Serena Hotel, Hunza', 'The Plaza, New York'],
  vehicle: ['Toyota Land Cruiser 4x4', 'Mercedes-Benz S-Class', 'Toyota Hiace Grand Cabin 14-Seat', 'Range Rover Sport'],
  flight: ['Emirates DXB to HND', 'Qatar Airways DOH to JFK', 'Turkish Airlines IST to LHR', 'PIA ISB to DXB'],
  destination: ['Tokyo, Japan', 'Hunza Valley, Pakistan', 'Zermatt, Switzerland', 'Santorini, Greece', 'Dubai, UAE'],
  groupTour: ['Hunza & Skardu 7-Day Expedition', 'Swiss Alps & Lakes Tour', 'Classic Italy 8-Day Odyssey', 'Japan Cherry Blossom Tour']
};

export default function AiAutofillModal({ isOpen, onClose, entityType = 'country', onAutofill }) {
  const { showToast } = useModal();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const suggestions = QUICK_SUGGESTIONS[entityType] || QUICK_SUGGESTIONS.country;

  const handleGenerate = async (searchQuery = query) => {
    const finalQuery = searchQuery.trim();
    if (!finalQuery) {
      showToast('Please enter a destination, country, or title to generate', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await generateEntityWithAi(entityType, finalQuery);
      if (res.data) {
        onAutofill(res.data);
        showToast(`AI successfully populated ${entityType} form fields!`, 'success');
        onClose();
      } else {
        showToast('AI could not generate data for this query', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate data with AI', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#121215] border border-orange-500/30 p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Sparkles className="size-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">AI Smart Auto-Fill</h3>
              <p className="text-[11px] text-muted-foreground">
                Enter name or location — Gemini AI will populate the complete form.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Target Entity / Location / Title *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={loading}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Japan, Hunza Valley, Burj Al Arab, Toyota Land Cruiser..."
                className="w-full pl-3.5 pr-10 h-[38px] rounded-xl bg-[#18181b] border border-border/80 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40"
              />
              <Wand2 className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-orange-400/80" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-muted-foreground">Quick Suggestions:</span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug) => (
                <button
                  type="button"
                  key={sug}
                  disabled={loading}
                  onClick={() => {
                    setQuery(sug);
                    handleGenerate(sug);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#18181b] hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400 border border-border/80 hover:border-orange-500/40 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-3.5 h-[34px] rounded-xl bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <GlowingButton
              type="submit"
              disabled={loading || !query.trim()}
              size="sm"
              innerClassName="h-[34px] px-4 text-xs font-bold flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Generating Telemetry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3.5" />
                  <span>Auto-Fill Form</span>
                </>
              )}
            </GlowingButton>
          </div>
        </form>
      </div>
    </div>
  );
}

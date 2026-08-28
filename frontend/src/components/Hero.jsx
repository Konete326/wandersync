import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Upload, Sparkles, MapPin, Calendar, Compass, ArrowRight, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { generateItineraryWithAi, saveTrip } from '../services/tripService';
import AiGenerationLoader from './trip/AiGenerationLoader';

const DEFAULT_PROMPT = "I'm planning a 7-day trip to Japan in October. I love food, hidden cafes, scenic hikes, and want to avoid crowds....";

const QUICK_CHIPS = [
  { label: '🇯🇵 Kyoto & Tokyo 7 Days', prompt: 'Plan a 7-day trip to Tokyo & Kyoto in October. I love matcha cafes, historic temples, and scenic autumn foliage.' },
  { label: '🇨🇭 Swiss Alps 5 Days', prompt: '5 days in Swiss Alps (Interlaken & Zermatt). Scenic mountain trains, alpine hikes, and fondue tasting with $2500 budget.' },
  { label: '🇮🇹 Rome & Florence 6 Days', prompt: '6 days in Rome and Florence for a couple. Food tours, art museums, and authentic trattorias.' },
  { label: '🏝️ Bali Retreat 8 Days', prompt: '8 days in Bali for solo traveler. Surfing, waterfall hikes, yoga retreats, and hidden beach cafes.' },
];



export default function Hero() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useModal();
  const [promptText, setPromptText] = useState(DEFAULT_PROMPT);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef(null);

  // If navigated with destination / initialPrompt from Gallery or catalog
  useEffect(() => {
    const st = location.state;
    if (st) {
      if (st.initialPrompt) {
        setPromptText(st.initialPrompt);
      } else if (st.destination || st.galleryTitle) {
        const dest = st.destination || st.galleryTitle;
        const cat = st.galleryCategory ? ` focused on ${st.galleryCategory}` : '';
        setPromptText(`I'm planning a 5-day journey to ${dest}${cat}. Recommend scenic spots, culinary highlights, and curated hidden gems.`);
      }
    }
  }, [location.state]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(`Inspiration "${file.name}" uploaded! AI will factor this into your journey.`, 'success');
  };

  const handlePlanMyTrip = async () => {
    const textToPlan = promptText.trim() || DEFAULT_PROMPT;

    // Parse days
    let days = 5;
    const daysMatch = textToPlan.match(/(\d+)\s*(?:days?|day)/i);
    if (daysMatch && daysMatch[1]) {
      days = Math.min(Math.max(parseInt(daysMatch[1], 10), 1), 14);
    }

    // Parse destination
    let dest = 'Tokyo, Japan';
    if (/japan|tokyo|kyoto/i.test(textToPlan)) dest = 'Tokyo & Kyoto, Japan';
    else if (/swiss|switzerland|alps/i.test(textToPlan)) dest = 'Interlaken & Zermatt, Switzerland';
    else if (/italy|rome|florence|venice/i.test(textToPlan)) dest = 'Rome & Florence, Italy';
    else if (/paris|france/i.test(textToPlan)) dest = 'Paris, France';
    else if (/bali|indonesia/i.test(textToPlan)) dest = 'Bali, Indonesia';
    else if (/dubai|uae/i.test(textToPlan)) dest = 'Dubai, UAE';
    else if (/london|uk|britain/i.test(textToPlan)) dest = 'London, United Kingdom';
    else {
      const words = textToPlan.split(' ');
      dest = words.slice(0, 3).join(' ');
    }

    setGenerating(true);
    try {
      const today = new Date();
      const startStr = today.toISOString().split('T')[0];
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + days);
      const endStr = endDate.toISOString().split('T')[0];

      const res = await generateItineraryWithAi({
        destination: dest,
        startDate: startStr,
        endDate: endStr,
        durationDays: days,
        budgetLevel: /luxury/i.test(textToPlan) ? 'Luxury' : /budget|cheap/i.test(textToPlan) ? 'Budget' : 'Moderate',
        travelStyle: 'cultural',
        companions: /couple/i.test(textToPlan) ? 'Couple' : /family/i.test(textToPlan) ? 'Family' : /friend/i.test(textToPlan) ? 'Friends' : 'Solo',
        interests: textToPlan.slice(0, 120),
        currency: user?.preferences?.currency || 'USD'
      });

      if (res.data) {
        if (user) {
          try {
            const savedRes = await saveTrip(res.data);
            showToast('Trip itinerary crafted with Google Gemini AI!', 'success');
            navigate(`/trips/${savedRes.data._id}`);
            return;
          } catch {
            navigate('/itinerary/preview', { state: { itinerary: res.data } });
            return;
          }
        }
        navigate('/itinerary/preview', { state: { itinerary: res.data } });
      }
    } catch {
      showToast('Creating your journey itinerary...', 'info');
      navigate('/gallery');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="relative min-h-svh w-full overflow-hidden bg-[#09090b] text-foreground font-sans select-none">
      {generating && <AiGenerationLoader destination="Japan" days={7} />}

      {/* Background cinematic video (z-0) with dark grading */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-55 filter brightness-[0.65] contrast-[1.15]"
        src="https://pollen-batch-41236914.figma.site/_components/v2/f0ee2dae7671c170c34f12e31c4cb41418976c98/769c564298c132f7919405cd9f17c1b1231f341d.769c5642.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Dark gradient overlays (z-1) */}
      <div
        className="absolute inset-x-0 top-0 h-[687px] pointer-events-none z-[1]"
        style={{ background: 'linear-gradient(180deg, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.6) 45%, rgba(9,9,11,0) 100%)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none z-[1]"
        style={{ background: 'linear-gradient(0deg, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0) 100%)' }}
      />

      {/* Content wrapper (z-2) */}
      <div className="relative z-[2] max-w-[1360px] mx-auto min-h-[calc(100vh-3.5rem)] flex flex-col justify-center py-10">

        {/* Hero body */}
        <div className="flex flex-col items-center px-4 sm:px-6 pt-10 sm:pt-14 pb-16 text-center">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="size-3.5 text-orange-400 animate-pulse" />
            <span>AI Travel Maestro & Next-Gen Trip Planner</span>
          </div>

          <h1 className="font-sans text-[36px] sm:text-[clamp(44px,6vw,68px)] font-extrabold text-white leading-[1.05] tracking-[-0.04em] max-w-[840px] mb-4 drop-shadow-xl">
            Where will you go next?
          </h1>
          <p className="font-sans text-base sm:text-xl font-medium text-zinc-400 leading-relaxed max-w-[540px] mb-8">
            Tell our AI where you're going and what you love. We'll create a personalized day-by-day itinerary for you in seconds.
          </p>

          {/* Liquid Dark Glass Prompt Card */}
          <div className="relative w-full max-w-[720px] min-h-[220px] bg-[#121215]/85 border-[2px] border-white/15 hover:border-orange-500/40 rounded-[32px] sm:rounded-[44px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-[24px] text-left p-6 sm:p-7 transition-all">
            {/* Ambient Corner Glow */}
            <div className="absolute -top-12 -right-12 size-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 size-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Prompt Textarea */}
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="I'm planning a 7-day trip to Japan in October. I love food, hidden cafes, scenic hikes, and want to avoid crowds...."
              className="w-full h-24 font-sans text-base sm:text-lg font-medium text-zinc-100 placeholder:text-zinc-500 leading-relaxed bg-transparent border-none outline-none resize-none focus:outline-none custom-scrollbar"
              rows={3}
            />

            {/* Quick Inspiration Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-2 pt-1">
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPromptText(chip.prompt)}
                  className="px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-[#222228] text-zinc-300 hover:text-white border border-border/80 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Card Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60 mt-2">
              {/* Upload Inspiration button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="size-10 sm:size-11 bg-[#18181b] hover:bg-[#24242c] border border-white/20 hover:border-orange-500/50 rounded-full cursor-pointer flex items-center justify-center backdrop-blur-[14px] transition-transform hover:scale-105"
                aria-label="Upload inspiration"
                title="Upload travel inspiration (image/PDF)"
              >
                <Upload className="size-4 text-zinc-300" />
              </button>

              {/* Plan My Trip CTA inside card */}
              <button
                type="button"
                onClick={handlePlanMyTrip}
                disabled={generating}
                className="px-6 h-11 sm:h-12 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white border-none rounded-full shadow-lg shadow-orange-500/25 cursor-pointer flex items-center justify-center font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.04em] transition-all disabled:opacity-75"
              >
                <Wand2 className="size-4 mr-2" />
                <span>{generating ? 'Crafting Itinerary...' : 'Plan My Trip'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom spacing anchor */}
        <div className="h-6" />
      </div>
    </section>
  );
}

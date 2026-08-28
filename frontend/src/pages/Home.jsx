import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import GlowingButton from '../components/common/GlowingButton';
import logoImg from '../assets/logo.png';

const videos = [
  {
    label: 'Golden Hour',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4'
  },
  {
    label: 'Still Water',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4'
  },
  {
    label: 'Deep Woods',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4'
  },
  {
    label: 'Quiet Dawn',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4'
  }
];

const stats = [
  '60,000+ AI Itineraries',
  '12,000+ Global Explorers',
  '4.9 Satisfaction Score',
  'Live Weather & Map Telemetry'
];

const navLinks = [
  { label: 'Gallery', path: '/gallery' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Community', path: '/community' }
];

const Home = () => {
  const [activeVideo, setActiveVideo] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const videoRefs = useRef([]);
  const navigate = useNavigate();
  const { showToast } = useModal();

  // Auto-switch slider every 1.5 seconds (1500ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVideo((prev) => (prev + 1) % videos.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [activeVideo]);

  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === activeVideo) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, [activeVideo]);

  const handleVideoSwitch = (index) => {
    if (index === activeVideo) return;
    setActiveVideo(index);
  };

  const handleStartPlanning = (e) => {
    e.preventDefault();
    if (!promptText.trim()) {
      navigate('/create');
      return;
    }
    navigate('/create', { state: { initialPrompt: promptText } });
  };

  const isDarkContent = activeVideo === 2;
  const contentColorClass = isDarkContent ? 'text-[#182C41]' : 'text-white';
  const subtextColorClass = isDarkContent ? 'text-[#182C41]/85' : 'text-white/85';
  const badgeBorderClass = isDarkContent ? 'border-[#182C41]/30' : 'border-white/20';

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden bg-black select-none">
      <div className="absolute inset-0 z-0">
        {videos.map((video, idx) => (
          <video
            key={video.url}
            ref={(el) => (videoRefs.current[idx] = el)}
            src={video.url}
            muted
            loop
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            preload="auto"
            className={`absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform will-change-opacity transition-opacity duration-1000 ease-in-out ${
              activeVideo === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          />
        ))}
      </div>

      <img
        src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png"
        alt="Atmospheric overlay"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover z-20 animate-train-bob"
      />

      <div className="relative z-30 flex flex-col justify-between w-full h-[calc(100dvh-3.5rem)] px-4 sm:px-8 md:px-12 py-4 sm:py-6">

        <main className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-auto px-2">
          <div
            className={`liquid-glass rounded-full px-4 py-1.5 text-[11px] sm:text-xs font-sans font-medium mb-4 sm:mb-6 transition-colors duration-700 border ${badgeBorderClass} ${contentColorClass}`}
          >
            Next-Gen AI Travel Maestro & Journey Architecture
          </div>

          <h1
            className={`font-['Instrument_Serif'] text-3xl sm:text-5xl md:text-7xl lg:text-[5.2rem] leading-[1.08] tracking-tight max-w-4xl transition-colors duration-700 ${contentColorClass}`}
          >
            Transform Inspiration Into
            <br className="hidden sm:inline" /> Flawless Journeys
          </h1>

          <p
            className={`font-sans text-xs sm:text-base md:text-lg max-w-xl leading-relaxed mt-3 sm:mt-5 transition-colors duration-700 ${subtextColorClass}`}
          >
            Rise above chaotic travel planning. Discover bespoke day-by-day itineraries,
            interactive maps, live weather forecasts, and real-time budgeting orchestrated by Gemini AI.
          </p>

          <form
            onSubmit={handleStartPlanning}
            className="liquid-glass rounded-full p-1 sm:p-1.5 flex items-center max-w-[320px] sm:max-w-lg w-full mt-5 sm:mt-8 shadow-2xl gap-1"
          >
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. 5 days in Kyoto for peace & culture"
              className={`w-full bg-transparent px-3 sm:px-4 py-2 font-sans text-xs sm:text-sm focus:outline-none placeholder:transition-colors placeholder:duration-700 ${
                isDarkContent
                  ? 'text-[#182C41] placeholder-[#182C41]/60'
                  : 'text-white placeholder-white/60'
              }`}
            />
            <GlowingButton
              type="submit"
              size="sm"
              className="shrink-0"
              innerClassName="py-2 px-4 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Build Journey</span>
              <ArrowRight className="size-3.5" />
            </GlowingButton>
          </form>

          <div
            className={`flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 sm:mt-10 font-sans text-xs sm:text-sm transition-colors duration-700 ${contentColorClass}`}
          >
            {videos.map((vid, idx) => {
              const isActive = activeVideo === idx;
              return (
                <button
                  key={vid.label}
                  type="button"
                  onClick={() => handleVideoSwitch(idx)}
                  className={`pb-1 border-b-2 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? isDarkContent
                        ? 'border-[#182C41] opacity-100 font-semibold'
                        : 'border-white opacity-100 font-semibold'
                      : 'border-transparent opacity-50 hover:opacity-80 font-normal'
                  }`}
                >
                  {vid.label}
                </button>
              );
            })}
          </div>
        </main>

        <footer className="w-full max-w-7xl mx-auto flex items-center justify-center pt-2">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-white/70 text-[11px] sm:text-xs font-sans tracking-wide">
            {stats.map((stat, idx) => (
              <div key={stat} className="flex items-center gap-2 sm:gap-6">
                <span>{stat}</span>
                {idx < stats.length - 1 && (
                  <span className="hidden sm:inline text-white/30">|</span>
                )}
              </div>
            ))}
          </div>
        </footer>
      </div>
    </section>
  );
};

export default Home;

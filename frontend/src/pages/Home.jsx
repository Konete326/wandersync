import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { useModal } from '../context/ModalContext';

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
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Features', path: '/features' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Community', path: '/community' }
];

const Home = () => {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const videoRefs = useRef([]);
  const navigate = useNavigate();
  const { showToast } = useModal();
  const transitionTimeout = useRef(null);

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
    if (index === activeVideo || isTransitioning) return;
    setIsTransitioning(true);

    const targetVid = videoRefs.current[index];
    if (targetVid) {
      targetVid.play().catch(() => {});
    }

    setActiveVideo(index);
    if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
    transitionTimeout.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
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
            preload={idx === 0 ? 'auto' : 'metadata'}
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

      <div className="relative z-30 flex flex-col justify-between w-full h-full px-4 sm:px-8 md:px-12 py-5 sm:py-8">
        <header className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div
            onClick={() => navigate('/')}
            className="text-white italic text-2xl sm:text-3xl tracking-tight cursor-pointer font-['Instrument_Serif']"
          >
            WanderSync
          </div>

          <nav className="hidden md:flex items-center gap-6 liquid-glass rounded-full px-5 py-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className="text-white/90 text-sm font-sans hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => navigate('/create')}
              className="bg-white text-zinc-950 font-sans font-bold text-xs px-4 py-2 rounded-full hover:bg-white/90 transition-all cursor-pointer shadow-sm"
            >
              Get Started
            </button>
          </nav>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="liquid-glass rounded-full p-2.5 text-white cursor-pointer relative size-10 flex items-center justify-center"
              aria-label="Toggle Navigation"
            >
              <Menu
                className={`size-5 absolute transition-all duration-300 ${
                  mobileMenuOpen
                    ? 'opacity-0 rotate-90 scale-75'
                    : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <X
                className={`size-5 absolute transition-all duration-300 ${
                  mobileMenuOpen
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-90 scale-75'
                }`}
              />
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex flex-col items-center justify-center gap-6 p-6 animate-in fade-in duration-300 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2.5 text-white/80 hover:text-white rounded-full liquid-glass"
            >
              <X className="size-6" />
            </button>
            <div className="text-white italic text-4xl font-['Instrument_Serif'] mb-3">
              WanderSync
            </div>
            {navLinks.map((link, i) => (
              <button
                key={link.label}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(link.path);
                }}
                style={{
                  transitionDelay: `${80 + i * 40}ms`
                }}
                className="text-white text-2xl font-['Instrument_Serif'] hover:text-cyan-400 transition-all cursor-pointer animate-in slide-in-from-bottom-3 duration-300"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/create');
              }}
              className="mt-4 w-full max-w-xs py-3.5 bg-white text-zinc-950 font-sans font-bold text-sm rounded-full hover:bg-zinc-100 transition-all cursor-pointer shadow-lg"
            >
              Get Started
            </button>
          </div>
        )}

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
            className="liquid-glass rounded-full p-1 sm:p-1.5 flex items-center max-w-[300px] sm:max-w-md w-full mt-5 sm:mt-8 shadow-2xl"
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
            <button
              type="submit"
              className="bg-white text-zinc-950 font-sans font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full hover:bg-zinc-100 transition-all shrink-0 cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <span>Build Journey</span>
              <ArrowRight className="size-3.5" />
            </button>
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

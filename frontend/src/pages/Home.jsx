import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
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
  '60+ Deep Sessions',
  '12,000+ Creators',
  '4.8 User Satisfaction',
  'Intentional-First Design'
];

const navLinks = ['How It Works', 'Features', 'Pricing', 'Community'];

const Home = () => {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { showToast } = useModal();
  const transitionTimeout = useRef(null);

  const handleVideoSwitch = (index) => {
    if (index === activeVideo || isTransitioning) return;
    setIsTransitioning(true);
    setActiveVideo(index);
    if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
    transitionTimeout.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const handleGetAccess = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      navigate('/create');
      return;
    }
    showToast(`Welcome! Invitation sent to ${email}`, 'success');
    setEmail('');
    navigate('/create');
  };

  const isDarkContent = activeVideo === 2;
  const contentColorClass = isDarkContent ? 'text-[#182C41]' : 'text-white';
  const subtextColorClass = isDarkContent ? 'text-[#182C41]/85' : 'text-white/85';
  const badgeBorderClass = isDarkContent ? 'border-[#182C41]/30' : 'border-white/20';

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black select-none">
      <div className="absolute inset-0 z-0">
        {videos.map((video, idx) => (
          <video
            key={video.url}
            src={video.url}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              activeVideo === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        ))}
      </div>

      <img
        src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png"
        alt="Atmospheric overlay"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover z-[1] animate-train-bob"
      />

      <div className="relative z-[2] flex flex-col justify-between w-full h-full px-4 sm:px-8 md:px-12 py-6 sm:py-8">
        <header className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div
            onClick={() => navigate('/')}
            className="text-white italic text-2xl sm:text-3xl tracking-tight cursor-pointer font-['Instrument_Serif']"
          >
            Lumora
          </div>

          <nav className="hidden md:flex items-center gap-6 liquid-glass rounded-full px-5 py-2">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/create');
                }}
                className="text-white/90 text-sm font-sans hover:text-white transition-colors cursor-pointer"
              >
                {link}
              </a>
            ))}
            <button
              onClick={() => navigate('/create')}
              className="bg-white text-zinc-950 font-sans font-semibold text-xs px-4 py-2 rounded-full hover:bg-white/90 transition-all cursor-pointer shadow-sm"
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
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center gap-6 p-6 animate-in fade-in duration-300 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/80 hover:text-white rounded-full liquid-glass"
            >
              <X className="size-6" />
            </button>
            <div className="text-white italic text-3xl font-['Instrument_Serif'] mb-4">
              Lumora
            </div>
            {navLinks.map((link, i) => (
              <button
                key={link}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/create');
                }}
                style={{
                  transitionDelay: `${100 + i * 50}ms`
                }}
                className="text-white text-2xl font-['Instrument_Serif'] hover:text-cyan-400 transition-all cursor-pointer animate-in slide-in-from-bottom-4 duration-300"
              >
                {link}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/create');
              }}
              className="mt-4 w-full max-w-xs py-3 bg-white text-zinc-950 font-sans font-bold text-sm rounded-full hover:bg-zinc-100 transition-all cursor-pointer shadow-lg"
            >
              Get Started
            </button>
          </div>
        )}

        <main className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto my-auto px-2">
          <div
            className={`liquid-glass rounded-full px-4 py-1.5 text-xs font-sans font-medium mb-5 sm:mb-6 transition-colors duration-700 border ${badgeBorderClass} ${contentColorClass}`}
          >
            Over 10,000 minds already finding their clarity
          </div>

          <h1
            className={`font-['Instrument_Serif'] text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.08] tracking-tight max-w-4xl transition-colors duration-700 ${contentColorClass}`}
          >
            Clarity in an Endlessly
            <br className="hidden sm:inline" /> Noisy Universe
          </h1>

          <p
            className={`font-sans text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mt-4 sm:mt-5 transition-colors duration-700 ${subtextColorClass}`}
          >
            Rise above the chaos of pings, infinite scrolling, and relentless demands.
            Discover how to protect your presence and create with intention.
          </p>

          <form
            onSubmit={handleGetAccess}
            className="liquid-glass rounded-full p-1.5 flex items-center max-w-[320px] sm:max-w-md w-full mt-6 sm:mt-8 shadow-2xl"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Best Email"
              className={`w-full bg-transparent px-4 py-2 font-sans text-xs sm:text-sm focus:outline-none placeholder:transition-colors placeholder:duration-700 ${
                isDarkContent
                  ? 'text-[#182C41] placeholder-[#182C41]/60'
                  : 'text-white placeholder-white/60'
              }`}
            />
            <button
              type="submit"
              className="bg-white text-zinc-950 font-sans font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full hover:bg-zinc-100 transition-all shrink-0 cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <span>Get Early Access</span>
              <ArrowRight className="size-3.5" />
            </button>
          </form>

          <div
            className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 font-sans text-xs sm:text-sm transition-colors duration-700 ${contentColorClass}`}
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
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-white/70 text-xs sm:text-sm font-sans tracking-wide">
            {stats.map((stat, idx) => (
              <div key={stat} className="flex items-center gap-3 sm:gap-6">
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

import { Compass, Heart, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-white tracking-tight">WanderSync</span>
          <span className="text-xs text-slate-400 ml-2">AI Powered Itinerary Maestro</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>and</span>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Gemini AI</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

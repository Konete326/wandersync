import { Compass, Heart, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-card/80 backdrop-blur-md mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Compass className="size-4 text-cyan-400" />
          <span className="font-semibold text-foreground tracking-tight font-heading">WanderSync</span>
          <span className="text-xs text-muted-foreground ml-1 font-sans">• AI Itinerary Maestro</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground font-sans">
          <span>© 2026 Elite Dev</span>
          <span className="flex items-center gap-1">
            <span>Powered by</span>
            <Sparkles className="size-3.5 text-cyan-400" />
            <span>Gemini AI</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

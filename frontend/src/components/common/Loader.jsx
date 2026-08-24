import { Compass } from 'lucide-react';

const Loader = ({ text = 'Crafting your perfect journey...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <Compass className="w-8 h-8 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
      </div>
      <p className="text-sm font-medium text-slate-300 animate-pulse">{text}</p>
    </div>
  );
};

export default Loader;

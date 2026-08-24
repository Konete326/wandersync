import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
          <Compass className="w-8 h-8 rotate-45" />
        </div>
        <h1 className="text-4xl font-extrabold text-white">404</h1>
        <p className="text-sm text-slate-400">Looks like you ventured off the map! The requested destination does not exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold rounded-xl transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80';

export default function LazyImage({
  src,
  alt = 'Image',
  className = '',
  containerClassName = '',
  fallbackSrc = DEFAULT_FALLBACK,
  priority = false,
  onClick,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    } else {
      setIsLoaded(true);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-zinc-900/80 ${containerClassName}`}
      onClick={onClick}
    >
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 animate-pulse">
          <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground/40">
            <ImageIcon className="size-5 animate-bounce opacity-40" />
            <div className="w-12 h-1 rounded-full bg-orange-500/20 overflow-hidden">
              <div className="w-full h-full bg-orange-500/60 -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
        </div>
      )}

      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          isLoaded
            ? 'opacity-100 scale-100 blur-0'
            : 'opacity-0 scale-105 blur-sm'
        } ${className}`}
        {...props}
      />
    </div>
  );
}

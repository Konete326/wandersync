import { useState, useEffect, useRef } from 'react';
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
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const cleanSrc = src && typeof src === 'string' && src.trim() ? src.trim() : fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(cleanSrc);

  useEffect(() => {
    const validSrc = src && typeof src === 'string' && src.trim() ? src.trim() : fallbackSrc;
    setCurrentSrc(validSrc);
    setHasError(false);

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(false);
    }
  }, [src, fallbackSrc]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [currentSrc]);

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
      className={`relative overflow-hidden bg-zinc-900 ${containerClassName}`}
      onClick={onClick}
    >
      {!isLoaded && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-zinc-800/80 animate-pulse pointer-events-none">
          <ImageIcon className="size-5 text-muted-foreground/30" />
        </div>
      )}

      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 relative z-1 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />
    </div>
  );
}

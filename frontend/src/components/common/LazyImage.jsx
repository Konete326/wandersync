import { useState, useEffect } from 'react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80';

export default function LazyImage({
  src,
  alt = 'Image',
  className = '',
  containerClassName = '',
  fallbackSrc = FALLBACK_IMAGE,
  priority = false,
  onClick,
  ...props
}) {
  const cleanSrc = src && typeof src === 'string' && src.trim() ? src.trim() : fallbackSrc;
  const [imgSrc, setImgSrc] = useState(cleanSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const valid = src && typeof src === 'string' && src.trim() ? src.trim() : fallbackSrc;
    setImgSrc(valid);
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-zinc-900 ${containerClassName}`}
      onClick={onClick}
    >
      <img
        src={imgSrc || fallbackSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={handleError}
        className={`w-full h-full object-cover transition-transform duration-300 ${className}`}
        {...props}
      />
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LazyImage from './LazyImage';

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80';

export default function CardGallerySlider({
  images = [],
  coverImage = '',
  alt = 'Image',
  className = '',
  containerClassName = '',
  overlayChildren = null,
  autoPlayInterval = 1400,
  enableHoverSlideshow = true,
  onClick
}) {
  const allImages = Array.from(
    new Set([coverImage, ...(Array.isArray(images) ? images : [])].filter(Boolean))
  );
  const validImages = allImages.length > 0 ? allImages : [DEFAULT_FALLBACK];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isHovered && enableHoverSlideshow && validImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
      }, autoPlayInterval);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentIndex(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, enableHoverSlideshow, validImages.length, autoPlayInterval]);

  const handlePrev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handleDotClick = (e, idx) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentIndex(idx);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden group select-none bg-zinc-900 ${containerClassName}`}
    >
      <LazyImage
        src={validImages[currentIndex]}
        alt={`${alt} photo ${currentIndex + 1}`}
        className={`size-full object-cover transition-all duration-500 ease-out group-hover:scale-105 ${className}`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-black/20 to-transparent pointer-events-none" />

      {overlayChildren}

      {validImages.length > 1 && (
        <>
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
            <button
              type="button"
              onClick={handlePrev}
              className="size-6 rounded-full bg-black/75 hover:bg-orange-500 hover:text-zinc-950 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all pointer-events-auto cursor-pointer shadow-md"
              title="Previous photo"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="size-6 rounded-full bg-black/75 hover:bg-orange-500 hover:text-zinc-950 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all pointer-events-auto cursor-pointer shadow-md"
              title="Next photo"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1 z-20 pointer-events-auto">
            <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1">
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(e, idx)}
                  className={`rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-3 h-1.5 bg-orange-400 shadow-xs'
                      : 'size-1.5 bg-white/40 hover:bg-white/80'
                  }`}
                  title={`Photo ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

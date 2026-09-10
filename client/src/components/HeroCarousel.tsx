import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Slide {
  image: string;
  caption?: string;
  href: string;
}

interface HeroCarouselProps {
  slides: Slide[];
  autoPlayInterval?: number;
}

export default function HeroCarousel({ slides, autoPlayInterval = 5000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Toggled on every slide change to restart the active slide's zoom
  // animation — without this, a slide revisited on a later autoplay cycle
  // would stay frozen at the animation's final (most zoomed-in) frame, since
  // re-applying the same animation-name doesn't restart it. Alternating
  // between two identical keyframe rules (see index.css) does restart it,
  // without remounting the <img> itself — remounting would force the browser
  // to re-decode an already-cached image on every activation, producing a
  // visible flash of the slide behind it before the image reappears.
  const [zoomVariant, setZoomVariant] = useState<'a' | 'b'>('a');

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setZoomVariant((prev) => (prev === 'a' ? 'b' : 'a'));
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPaused, slides.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setZoomVariant((prev) => (prev === 'a' ? 'b' : 'a'));
    console.log('Previous slide');
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setZoomVariant((prev) => (prev === 'a' ? 'b' : 'a'));
    console.log('Next slide');
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setZoomVariant((prev) => (prev === 'a' ? 'b' : 'a'));
    console.log('Go to slide:', index);
  };

  if (slides.length === 0) return null;

  return (
    <div
      className="relative w-full aspect-[16/9] min-h-[180px] overflow-hidden rounded-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="hero-carousel"
    >
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            data-testid={`carousel-slide-${index}`}
          >
            <Link href={slide.href} className="absolute inset-0 block overflow-hidden" data-testid={`carousel-slide-link-${index}`}>
              <img
                src={slide.image}
                alt={slide.caption || `Slide ${index + 1}`}
                className="w-full h-full object-cover"
                style={
                  isActive
                    ? {
                        animation: `hero-carousel-zoom-${zoomVariant} ${autoPlayInterval * 1.4}ms ease-out forwards`,
                        animationPlayState: isPaused ? 'paused' : 'running',
                      }
                    : undefined
                }
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {slide.caption && (
                <div className="absolute bottom-8 md:bottom-10 left-0 right-0 text-center px-6">
                  <p className="text-white text-base md:text-lg font-medium drop-shadow-lg" data-testid="carousel-caption">
                    {slide.caption}
                  </p>
                </div>
              )}
            </Link>
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="!absolute left-2 md:left-4 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
            onClick={goToPrevious}
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="!absolute right-2 md:right-4 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
            onClick={goToNext}
            data-testid="button-carousel-next"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2" data-testid="carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-1.5'
                }`}
                data-testid={`carousel-indicator-${index}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

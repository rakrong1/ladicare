// components/ui/carousel/Carousel.tsx
import React, { useCallback, useEffect, useState, useRef, useId } from "react";
import useEmblaCarousel, { EmblaCarouselType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import classNames from "classnames";

type CarouselProps = {
  children: React.ReactNode[];
  options?: Parameters<typeof useEmblaCarousel>[0];
  loop?: boolean;
  vertical?: boolean;
  autoplay?: boolean;
  showDots?: boolean;
  className?: string;
};

const Carousel: React.FC<CarouselProps> = ({
  children,
  options = {},
  loop = true,
  vertical = false,
  autoplay = false,
  showDots = true,
  className
}) => {
  const carouselId = useId();
  const autoplayInterval = 5000;
  const [emblaRef, emblaApi] = useEmblaCarousel({ ...options, loop, axis: vertical ? "y" : "x" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  // Track current slide index
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect(); // Initial set
    setScrollSnaps(emblaApi.scrollSnapList());

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  // Autoplay logic
  useEffect(() => {
    if (!autoplay || !emblaApi) return;

    autoplayRef.current = setInterval(() => {
      if (!emblaApi) return;
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, autoplayInterval);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [autoplay, emblaApi]);

  return (
    <div
      className={classNames(
        "relative w-full overflow-hidden group",
        vertical ? "h-[400px]" : "h-auto",
        className
      )}
      aria-label="Carousel"
      id={carouselId}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div
          className={classNames(
            "flex",
            vertical ? "flex-col" : "flex-row",
            "transition-transform"
          )}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="relative min-w-full flex-shrink-0 snap-start"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Prev/Next Buttons */}
      <button
        onClick={scrollPrev}
        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-opacity opacity-0 group-hover:opacity-100 z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition-opacity opacity-0 group-hover:opacity-100 z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      {showDots && scrollSnaps.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={classNames(
                "w-3 h-3 rounded-full",
                index === selectedIndex
                  ? "bg-purple-600 scale-125"
                  : "bg-white/40 hover:bg-white/70",
                "transition-all duration-300"
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={selectedIndex === index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;

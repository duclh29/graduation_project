import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export interface CarouselSlide {
  image: string;
  title: string;
  subtitle: string;
}

interface ShoeCarouselProps {
  slides: CarouselSlide[];
}

const ShoeCarousel = ({ slides }: ShoeCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAuto = () => {
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((c) => (c + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    startAuto();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slides.length]);

  const goTo = (idx: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveIndex((idx + slides.length) % slides.length);
    startAuto();
  };

  if (!slides.length) return null;

  return (
    <section className="relative mb-12 overflow-hidden rounded-3xl shadow-2xl" style={{ minHeight: "680px" }}>
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            activeIndex === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
            style={{ minHeight: "680px" }}
          />
          {/* Layered gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex min-h-[680px] flex-col justify-end p-8 text-white lg:p-14">
        {/* Badge */}
        <div className="mb-4 flex items-center gap-2">
          <span className="h-px w-8 bg-[#E32A15]" />
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#E32A15]">
            Bộ sưu tập mới nhất
          </span>
        </div>

        {/* Title */}
        <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight drop-shadow-2xl lg:text-6xl">
          {slides[activeIndex].title}
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75 lg:text-lg">
          {slides[activeIndex].subtitle}
        </p>

        {/* CTA + Controls row */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            to="/danh-muc"
            className="inline-flex items-center gap-2 rounded-full bg-[#E32A15] px-8 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-[#E32A15]/40 transition duration-200 hover:bg-[#b31f0e] hover:-translate-y-0.5 active:scale-95"
          >
            Khám phá ngay
          </Link>
          <Link
            to="/danh-muc"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-bold tracking-wide text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Xem tất cả
          </Link>

          <div className="ml-auto flex items-center gap-3">
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goTo(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    activeIndex === idx
                      ? "w-7 h-2 bg-[#E32A15] shadow-[0_0_8px_rgba(227,42,21,0.6)]"
                      : "w-2 h-2 bg-white/35 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            {/* Arrow controls */}
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition hover:bg-white/25"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition hover:bg-white/25"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShoeCarousel;

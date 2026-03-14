'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroIntroProps {
  scrollProgress: number;
}

export default function HeroIntro({ scrollProgress }: HeroIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const line = lineRef.current;

    if (!container || !title || !subtitle || !line) return;

    // Initial state
    gsap.set([title, subtitle, line], { opacity: 1, y: 0 });

    // Fade out animation - all text hides at 20% scroll
    const ctx = gsap.context(() => {
      // All elements fade out together between 15-20% scroll
      gsap.to([title, subtitle, line], {
        opacity: 0,
        y: -30,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: container,
          start: '15% top',
          end: '20% top',
          scrub: 0.3,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 pointer-events-none"
    >
      {/* Minimal top fade - just enough for text readability */}
      <div 
        className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent z-30"
      />

      {/* Main Content - positioned much higher */}
      <div 
        className="absolute left-0 right-0 flex flex-col items-center z-40"
        style={{ top: '12%' }}
      >
        {/* Text container */}
        <div className="relative px-8">
          {/* Main Title - with gradient mask on text */}
          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase mb-6"
            style={{
              background: 'linear-gradient(to bottom, #c41e3a 0%, #c41e3a 50%, transparent 85%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Ferrari
          </h1>

          {/* Decorative Line */}
          <div
            ref={lineRef}
            className="w-24 h-px bg-[#c41e3a]/60 mb-6 mx-auto origin-center"
          />

          {/* Subtitle - with gradient mask */}
          <p
            ref={subtitleRef}
            className="text-xs md:text-sm font-light tracking-[0.4em] uppercase text-center"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) 40%, transparent 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Scuderia
          </p>
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-40">
        <span className="text-[10px] font-light text-white/30 tracking-[0.3em] uppercase">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </div>
  );
}

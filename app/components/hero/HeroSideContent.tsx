'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroSideContentProps {
  scrollProgress: number;
}

// Premium content phases that change based on scroll
const leftContentPhases = [
  { 
    label: 'Output', 
    value: '800', 
    unit: 'cv',
    subtext: '@ 8,500 rpm'
  },
  { 
    label: 'Engine', 
    value: '6.5L', 
    unit: 'V12',
    subtext: 'Naturally Aspirated'
  },
  { 
    label: 'Acceleration', 
    value: '2.9', 
    unit: 's',
    subtext: '0-100 km/h'
  },
];

const rightContentPhases = [
  {
    title: '812 Superfast',
    subtitle: 'Grand Tourer',
    description: 'The most powerful naturally aspirated production car Ferrari has ever created.',
  },
  {
    title: 'Aerodynamics',
    subtitle: 'By Design',
    description: 'Active flaps and carefully sculpted curves deliver unprecedented downforce.',
  },
  {
    title: 'Performance',
    subtitle: 'Without Compromise',
    description: 'Where racing heritage meets road-legal perfection. Pure driving emotion.',
  },
];

export default function HeroSideContent({ scrollProgress }: HeroSideContentProps) {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [contentIndex, setContentIndex] = useState(0);

  // Update content based on scroll progress
  useEffect(() => {
    // 20-40%: Phase 0, 40-60%: Phase 1, 60%+: Phase 2
    if (scrollProgress < 0.4) {
      setContentIndex(0);
    } else if (scrollProgress < 0.6) {
      setContentIndex(1);
    } else {
      setContentIndex(2);
    }
  }, [scrollProgress]);

  useEffect(() => {
    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;

    if (!leftPanel || !rightPanel) return;

    const ctx = gsap.context(() => {
      // Left panel slides in from left
      gsap.fromTo(
        leftPanel,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: leftPanel,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          },
        }
      );

      // Right panel slides in from right
      gsap.fromTo(
        rightPanel,
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: rightPanel,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const leftContent = leftContentPhases[contentIndex];
  const rightContent = rightContentPhases[contentIndex];

  return (
    <>
      {/* Left Side - Premium Dynamic Specs */}
      <div
        ref={leftPanelRef}
        className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 z-20 hidden md:block"
      >
        <div className="space-y-2">
          <div className="text-left transition-all duration-700 ease-out">
            <p className="text-[9px] font-light text-white/40 tracking-[0.4em] uppercase mb-3">
              {leftContent.label}
            </p>
            <p className="text-4xl font-light text-white/90 tracking-tight" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              {leftContent.value}
              <span className="text-lg text-white/50 ml-2 font-light">{leftContent.unit}</span>
            </p>
            <p className="text-[10px] font-light text-white/30 tracking-wider mt-2">
              {leftContent.subtext}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Premium Dynamic Description */}
      <div
        ref={rightPanelRef}
        className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2 z-20 hidden md:block max-w-[280px]"
      >
        <div className="text-right transition-all duration-700 ease-out">
          <div className="flex items-center justify-end gap-3 mb-3">
            <div className="h-px w-8 bg-white/20" />
            <p className="text-[9px] font-light text-white/40 tracking-[0.4em] uppercase">
              {rightContent.subtitle}
            </p>
          </div>
          <p className="text-xl font-normal text-white/80 tracking-wide mb-3" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            {rightContent.title}
          </p>
          <p className="text-xs font-light text-white/40 leading-relaxed">
            {rightContent.description}
          </p>
        </div>
      </div>

      {/* Mobile Content - Bottom */}
      <div className="absolute bottom-24 left-0 right-0 z-20 md:hidden px-8">
        <div className="flex justify-between items-end">
          <div className="transition-all duration-500">
            <p className="text-[9px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">
              {leftContent.label}
            </p>
            <p className="text-2xl font-light text-white/80">{leftContent.value}<span className="text-sm text-white/50 ml-1">{leftContent.unit}</span></p>
          </div>
          <div className="text-right transition-all duration-500">
            <p className="text-[9px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">
              {rightContent.subtitle}
            </p>
            <p className="text-sm text-white/60">{rightContent.title}</p>
          </div>
        </div>
      </div>
    </>
  );
}

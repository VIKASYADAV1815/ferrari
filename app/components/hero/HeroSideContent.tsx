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
      {/* Left Side - Premium Dynamic Specs - Scene Style */}
      <div
        ref={leftPanelRef}
        className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden md:block max-w-[140px]"
      >
        <div className="space-y-4">
          <div className="border-l-2 border-[#c41e3a] pl-3 transition-all duration-700 ease-out">
            <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">
              {leftContent.label}
            </p>
            <p className="text-[18px] font-bold text-white/90">
              {leftContent.value}
            </p>
            <p className="text-[9px] font-light text-white/50">{leftContent.unit}</p>
          </div>
          <div className="border-l-2 border-white/20 pl-3">
            <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">Detail</p>
            <p className="text-[9px] font-light text-white/50">{leftContent.subtext}</p>
          </div>
        </div>
      </div>

      {/* Right Side - Premium Dynamic Description - Scene Style */}
      <div
        ref={rightPanelRef}
        className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:block max-w-[140px] text-right"
      >
        <div className="space-y-4">
          <div className="border-r-2 border-[#c41e3a] pr-3 transition-all duration-700 ease-out">
            <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">
              {rightContent.subtitle}
            </p>
            <p className="text-[16px] font-bold text-white/90">
              {rightContent.title}
            </p>
          </div>
          <div className="border-r-2 border-white/20 pr-3">
            <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">Info</p>
            <p className="text-[9px] font-light text-white/50 leading-relaxed">
              {rightContent.description}
            </p>
          </div>
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

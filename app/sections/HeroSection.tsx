'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import HeroIntro from '../components/hero/HeroIntro';
import HeroVideoPlayer from '../components/hero/HeroVideoPlayer';
import HeroSideContent from '../components/hero/HeroSideContent';
import HeroAudio from '../components/hero/HeroAudio';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSideContent, setShowSideContent] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Show side content after intro fades (20%+ scroll)
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setShowSideContent(self.progress > 0.2);
      },
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach(st => {
        if (st.vars.trigger === section) {
          st.kill();
        }
      });
    };
  }, []);

  const handleVideoProgress = (progress: number) => {
    setScrollProgress(progress);
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-[400vh] bg-black"
    >
      {/* Sticky Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Video Layer - Full screen no masking */}
        <HeroVideoPlayer onProgressUpdate={handleVideoProgress} sectionRef={sectionRef} />

        {/* Audio Layer - Ferrari engine sound */}
        <HeroAudio sectionRef={sectionRef} />

        {/* Intro Text Layer - Fades out on scroll */}
        <HeroIntro scrollProgress={scrollProgress} />

        {/* Side Content Layer - Appears after intro */}
        {showSideContent && <HeroSideContent scrollProgress={scrollProgress} />}

        {/* Corner Accents */}
        <div className="absolute top-8 left-8 w-12 h-px bg-white/10 z-30" />
        <div className="absolute top-8 left-8 w-px h-12 bg-white/10 z-30" />
        <div className="absolute top-8 right-8 w-12 h-px bg-white/10 z-30" />
        <div className="absolute top-8 right-8 w-px h-12 bg-white/10 z-30" />
        <div className="absolute bottom-8 left-8 w-12 h-px bg-white/10 z-30" />
        <div className="absolute bottom-8 left-8 w-px h-12 bg-white/10 z-30" />
        <div className="absolute bottom-8 right-8 w-12 h-px bg-white/10 z-30" />
        <div className="absolute bottom-8 right-8 w-px h-12 bg-white/10 z-30" />

        {/* Progress Dot */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
          <div className="w-1 h-1 bg-[#c41e3a]" />
        </div>
      </div>
    </section>
  );
}

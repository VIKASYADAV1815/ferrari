'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Scene2SectionProps {
  frameCount?: number;
  framePath?: (index: number) => string;
}

export default function Scene2Section({
  frameCount = 600,
  framePath = (i) => `/scene2/frame_${i.toString().padStart(6, '0')}.webp`,
}: Scene2SectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [displayFrame, setDisplayFrame] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetFrameRef = useRef(0);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());

  // Smooth lerp function for Lenis-like effect
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  // Preload images around current frame
  const preloadImages = useCallback(async (centerFrame: number) => {
    const range = 25; // Load 25 frames around current for smoother scrubbing
    const start = Math.max(0, centerFrame - range);
    const end = Math.min(frameCount - 1, centerFrame + range);

    const loadPromises = [];
    for (let i = start; i <= end; i++) {
      if (!imagesRef.current.has(i)) {
        loadPromises.push(
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              imagesRef.current.set(i, img);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = framePath(i);
          })
        );
      }
    }

    await Promise.all(loadPromises);

    // Cleanup old images (keep 150 in memory for 600 frames)
    if (imagesRef.current.size > 150) {
      const entries = Array.from(imagesRef.current.entries());
      const toDelete = entries.filter(([key]) => key < start - 40 || key > end + 40);
      toDelete.forEach(([key]) => imagesRef.current.delete(key));
    }
  }, [frameCount, framePath]);

  // Animation loop with smooth lerp
  const animateFrame = useCallback(() => {
    const diff = targetFrameRef.current - currentFrame;
    
    if (Math.abs(diff) > 0.1) {
      // Use lerp for smooth Lenis-like effect (0.08 = very smooth)
      const newFrame = lerp(currentFrame, targetFrameRef.current, 0.08);
      setCurrentFrame(newFrame);
      setDisplayFrame(Math.round(newFrame));
      
      // Preload around new frame
      preloadImages(Math.round(newFrame));
      
      rafRef.current = requestAnimationFrame(animateFrame);
    } else {
      setCurrentFrame(targetFrameRef.current);
      setDisplayFrame(Math.round(targetFrameRef.current));
      rafRef.current = null;
    }
  }, [currentFrame, preloadImages]);

  // Initialize - load first batch only
  useEffect(() => {
    const init = async () => {
      // Load first 30 frames only for faster startup
      const initialBatch = [];
      for (let i = 0; i < Math.min(30, frameCount); i++) {
        initialBatch.push(
          new Promise<void>((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => {
              imagesRef.current.set(i, img);
              setLoadProgress(Math.round(((i + 1) / 30) * 100));
              resolve();
            };
            img.onerror = () => {
              setLoadProgress(Math.round(((i + 1) / 30) * 100));
              resolve();
            };
            img.src = framePath(i);
          })
        );
      }
      
      await Promise.all(initialBatch);
      setIsReady(true);
      
      // Lazy load rest in smaller chunks
      let currentIndex = 30;
      const loadChunk = () => {
        if (currentIndex >= frameCount) return;
        
        const batch = [];
        for (let j = currentIndex; j < Math.min(currentIndex + 20, frameCount); j++) {
          batch.push(
            new Promise<void>((resolve) => {
              const img = new Image();
              img.decoding = 'async';
              img.onload = () => {
                imagesRef.current.set(j, img);
                resolve();
              };
              img.onerror = () => resolve();
              img.src = framePath(j);
            })
          );
        }
        Promise.all(batch).then(() => {
          currentIndex += 20;
          setTimeout(loadChunk, 150);
        });
      };
      
      setTimeout(loadChunk, 800);
    };

    init();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [frameCount, framePath]);

  // Setup ScrollTrigger
  useEffect(() => {
    if (!isReady) return;

    const section = sectionRef.current;
    if (!section) return;

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5, // Very smooth scrub for 600 frames
      onUpdate: (self) => {
        const frame = Math.min(
          Math.floor(self.progress * (frameCount - 1)),
          frameCount - 1
        );
        targetFrameRef.current = frame;
        
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(animateFrame);
        }
      },
    });

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isReady, frameCount, animateFrame]);

  const currentImageSrc = framePath(displayFrame);
  const progress = ((displayFrame + 1) / frameCount) * 100;

  return (
    <section
      ref={sectionRef}
      className="relative h-[800vh] bg-black"
    >
      {/* Sticky Container */}
      <div ref={containerRef} className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Loading Screen */}
        {!isReady && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
            <div className="text-center">
              <p className="text-[10px] font-light text-white/40 tracking-[0.3em] uppercase mb-6">
                Scene 02
              </p>
              <div className="w-40 h-px bg-white/10 mb-4 mx-auto overflow-hidden">
                <div 
                  className="h-full bg-[#c41e3a] transition-all duration-300"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <p className="text-[10px] font-light text-white/40 tracking-wider">
                Initializing {loadProgress}%
              </p>
            </div>
          </div>
        )}

        {/* Image Frame - Using img tag with object-cover */}
        <img
          src={currentImageSrc}
          alt={`Frame ${displayFrame}`}
          className="w-full h-full object-cover will-change-transform"
          style={{ 
            opacity: isReady ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />

        {/* CENTERED PREMIUM CONTENT - Scene 2 */}
        {isReady && (
          <>
            {/* Main Title - Center Top */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 text-center">
              <p className="text-[10px] font-light text-white/40 tracking-[0.5em] uppercase mb-2">Dynamic</p>
              <h2 className="text-3xl font-bold text-white/90 tracking-tight">Motion Study</h2>
            </div>

            {/* Left Side - Fixed Position */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 max-w-[140px]">
              <div className="space-y-4">
                <div className="border-l-2 border-[#c41e3a] pl-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Aerodynamics</p>
                  <p className="text-[16px] font-bold text-white/90">Active</p>
                  <p className="text-[9px] font-light text-white/50">Rear Spoiler</p>
                </div>
                <div className="border-l-2 border-white/20 pl-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Drag</p>
                  <p className="text-[18px] font-bold text-white/90">0.32</p>
                  <p className="text-[9px] font-light text-white/50">Cd Coefficient</p>
                </div>
              </div>
            </div>

            {/* Right Side - Fixed Position */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 max-w-[140px] text-right">
              <div className="space-y-4">
                <div className="border-r-2 border-[#c41e3a] pr-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Cooling</p>
                  <p className="text-[16px] font-bold text-white/90">Advanced</p>
                  <p className="text-[9px] font-light text-white/50">Thermal Mgmt</p>
                </div>
                <div className="border-r-2 border-white/20 pr-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Airflow</p>
                  <p className="text-[18px] font-bold text-white/90">Optimized</p>
                </div>
              </div>
            </div>

            {/* Center Bottom Stats */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-8">
              <div className="text-center">
                <p className="text-[11px] font-light text-white/40 tracking-wider uppercase">Front Lift</p>
                <p className="text-[16px] font-bold text-white/90">-140kg</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] font-light text-white/40 tracking-wider uppercase">Rear Down</p>
                <p className="text-[16px] font-bold text-white/90">+530kg</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] font-light text-white/40 tracking-wider uppercase">Efficiency</p>
                <p className="text-[16px] font-bold text-white/90">98%</p>
              </div>
            </div>
          </>
        )}

        {/* Scene Label */}
        <div className="absolute top-8 left-8 z-20">
          <p className="text-[10px] font-light text-white/40 tracking-[0.4em] uppercase">
            Scene 02
          </p>
        </div>

        {/* Frame Counter */}
        <div className="absolute bottom-8 right-8 z-20">
          <p className="text-[10px] font-light text-white/40 tracking-wider">
            {String(displayFrame + 1).padStart(3, '0')} / {String(frameCount).padStart(3, '0')}
          </p>
        </div>

        {/* Progress Line */}
        <div className="absolute bottom-8 left-8 right-8 h-px bg-white/10 z-20">
          <div
            className="h-full bg-[#c41e3a]/60 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Corner Accents */}
        <div className="absolute top-8 left-8 w-12 h-px bg-white/10" />
        <div className="absolute top-8 left-8 w-px h-12 bg-white/10" />
        <div className="absolute top-8 right-8 w-12 h-px bg-white/10" />
        <div className="absolute top-8 right-8 w-px h-12 bg-white/10" />

        {/* Dynamic hotspots based on scroll progress */}
        {isReady && displayFrame < 100 && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 text-center">
            <p className="text-xs font-light text-white/30 tracking-[0.5em] uppercase mb-2">Dynamic Sequence</p>
            <h2 className="text-3xl font-bold text-white/90 tracking-tight">Motion Study</h2>
          </div>
        )}

        {isReady && displayFrame > 200 && displayFrame < 300 && (
          <div className="absolute z-30" style={{ top: '50%', left: '30%' }}>
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-[#c41e3a] animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#c41e3a] animate-ping opacity-50" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap">
                <p className="text-[10px] font-light text-white/80 tracking-wider uppercase">Aerodynamics</p>
                <p className="text-[9px] font-light text-white/40">Active Spoiler</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

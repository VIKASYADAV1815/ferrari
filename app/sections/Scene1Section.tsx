'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Scene1SectionProps {
  frameCount?: number;
  framePath?: (index: number) => string;
}

export default function Scene1Section({
  frameCount = 302,
  framePath = (i) => `/scene1/frame_${i.toString().padStart(6, '0')}.webp`,
}: Scene1SectionProps) {
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
    const range = 20; // Load 20 frames around current
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

    // Cleanup old images (keep 100 in memory)
    if (imagesRef.current.size > 100) {
      const entries = Array.from(imagesRef.current.entries());
      const toDelete = entries.filter(([key]) => key < start - 30 || key > end + 30);
      toDelete.forEach(([key]) => imagesRef.current.delete(key));
    }
  }, [frameCount, framePath]);

  // Animation loop with smooth lerp - matching Scene2 smoothness
  const animateFrame = useCallback(() => {
    const diff = targetFrameRef.current - currentFrame;
    
    if (Math.abs(diff) > 0.05) {
      // Smoother lerp like Scene2 (0.08 = very smooth)
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

  // Initialize - load first batch only (lazy load rest)
  useEffect(() => {
    const init = async () => {
      // Load first 25 frames only for faster startup
      const initialBatch = [];
      for (let i = 0; i < Math.min(25, frameCount); i++) {
        initialBatch.push(
          new Promise<void>((resolve) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => {
              imagesRef.current.set(i, img);
              setLoadProgress(Math.round(((i + 1) / 25) * 100));
              resolve();
            };
            img.onerror = () => {
              setLoadProgress(Math.round(((i + 1) / 25) * 100));
              resolve();
            };
            img.src = framePath(i);
          })
        );
      }
      
      await Promise.all(initialBatch);
      setIsReady(true);
      
      // Lazy load rest in smaller chunks with delay
      let currentIndex = 25;
      const loadChunk = () => {
        if (currentIndex >= frameCount) return;
        
        const batch = [];
        for (let j = currentIndex; j < Math.min(currentIndex + 15, frameCount); j++) {
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
          currentIndex += 15;
          setTimeout(loadChunk, 100); // Delay between chunks
        });
      };
      
      // Start lazy loading after a delay
      setTimeout(loadChunk, 500);
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
      scrub: 1.5, // Match Scene2 smoothness
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
      className="relative h-[400vh] bg-black"
    >
      {/* Sticky Container */}
      <div ref={containerRef} className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Loading Indicator */}
        {!isReady && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-32 h-px bg-white/10 mb-4 mx-auto overflow-hidden">
                <div 
                  className="h-full bg-[#c41e3a] transition-all duration-300"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <p className="text-[10px] font-light text-white/40 tracking-[0.3em] uppercase">
                Loading Scene {loadProgress}%
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

        {/* Scene Label */}
        <div className="absolute top-8 left-8 z-20">
          <p className="text-[10px] font-light text-white/40 tracking-[0.4em] uppercase">
            Scene 01
          </p>
        </div>

        {/* CENTERED PREMIUM CONTENT - Scene 1 */}
        {isReady && (
          <>
            {/* Main Title - Center Top */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 text-center">
              <p className="text-[10px] font-light text-white/40 tracking-[0.5em] uppercase mb-2">Ferrari</p>
              <h2 className="text-3xl font-bold text-white/90 tracking-tight">SF90 Stradale</h2>
            </div>

            {/* Left Side - Fixed Position */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 max-w-[140px]">
              <div className="space-y-4">
                <div className="border-l-2 border-[#c41e3a] pl-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Power</p>
                  <p className="text-[18px] font-bold text-white/90">1,000</p>
                  <p className="text-[9px] font-light text-white/50">HP Combined</p>
                </div>
                <div className="border-l-2 border-white/20 pl-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">0-100</p>
                  <p className="text-[18px] font-bold text-white/90">2.5s</p>
                </div>
              </div>
            </div>

            {/* Right Side - Fixed Position */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 max-w-[140px] text-right">
              <div className="space-y-4">
                <div className="border-r-2 border-[#c41e3a] pr-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Top Speed</p>
                  <p className="text-[18px] font-bold text-white/90">340</p>
                  <p className="text-[9px] font-light text-white/50">km/h</p>
                </div>
                <div className="border-r-2 border-white/20 pr-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Engine</p>
                  <p className="text-[14px] font-bold text-white/90">V8 Hybrid</p>
                </div>
              </div>
            </div>

            {/* Center Bottom Stats */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-8">
              <div className="text-center">
                <p className="text-[11px] font-light text-white/40 tracking-wider uppercase">Downforce</p>
                <p className="text-[16px] font-bold text-white/90">390kg</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] font-light text-white/40 tracking-wider uppercase">Weight</p>
                <p className="text-[16px] font-bold text-white/90">1,570kg</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] font-light text-white/40 tracking-wider uppercase">Drive</p>
                <p className="text-[16px] font-bold text-white/90">AWD</p>
              </div>
            </div>
          </>
        )}

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

        {/* Hotspot Annotations - Frame 1 specific details */}
        {isReady && displayFrame === 0 && (
          <>
            {/* Headlight hotspot */}
            <div className="absolute z-30" style={{ top: '45%', left: '35%' }}>
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-[#c41e3a] animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#c41e3a] animate-ping opacity-50" />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap">
                  <p className="text-[10px] font-light text-white/80 tracking-wider uppercase">LED Matrix</p>
                  <p className="text-[9px] font-light text-white/40">Adaptive Lighting</p>
                </div>
              </div>
            </div>

            {/* Ferrari Badge hotspot */}
            <div className="absolute z-30" style={{ top: '48%', left: '50%' }}>
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-[#c41e3a] animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#c41e3a] animate-ping opacity-50" />
                <div className="absolute left-1/2 -translate-x-1/2 top-6 whitespace-nowrap">
                  <p className="text-[10px] font-light text-white/80 tracking-wider uppercase text-center">Prancing Horse</p>
                  <p className="text-[9px] font-light text-white/40 text-center">Since 1947</p>
                </div>
              </div>
            </div>

            {/* Grille hotspot */}
            <div className="absolute z-30" style={{ top: '52%', left: '42%' }}>
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-[#c41e3a] animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#c41e3a] animate-ping opacity-50" />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-right">
                  <p className="text-[10px] font-light text-white/80 tracking-wider uppercase">Air Intake</p>
                  <p className="text-[9px] font-light text-white/40">Optimized Flow</p>
                </div>
              </div>
            </div>

            {/* Frame 1 Title */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-30 text-center">
              <p className="text-xs font-light text-white/30 tracking-[0.5em] uppercase mb-2">Front Profile</p>
              <h2 className="text-3xl font-bold text-white/90 tracking-tight">SF90 Stradale</h2>
            </div>
          </>
        )}

        {/* Frame 10-15 - Side profile details */}
        {isReady && displayFrame >= 10 && displayFrame <= 15 && (
          <>
            <div className="absolute z-30" style={{ top: '40%', left: '60%' }}>
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-[#c41e3a] animate-pulse" />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap">
                  <p className="text-[10px] font-light text-white/80 tracking-wider uppercase">V8 Twin-Turbo</p>
                  <p className="text-[9px] font-light text-white/40">769 HP</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Frame 25-30 - Rear details */}
        {isReady && displayFrame >= 25 && displayFrame <= 30 && (
          <>
            <div className="absolute z-30" style={{ top: '42%', right: '40%' }}>
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-[#c41e3a] animate-pulse" />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-right">
                  <p className="text-[10px] font-light text-white/80 tracking-wider uppercase">Quad Exhaust</p>
                  <p className="text-[9px] font-light text-white/40">Titanium</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

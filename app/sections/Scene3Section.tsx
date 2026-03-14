'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Scene3SectionProps {
  frameCount?: number;
  framePath?: (index: number) => string;
}

export default function Scene3Section({
  frameCount = 250,
  framePath = (i) => `/scene3/frame_${i.toString().padStart(6, '0')}.webp`,
}: Scene3SectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [displayFrame, setDisplayFrame] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const frameRef = useRef(0);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetFrameRef = useRef(0);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());

  // Smooth lerp function
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  // Preload images
  const preloadImages = useCallback(async (centerFrame: number) => {
    const range = 20;
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

    if (imagesRef.current.size > 100) {
      const entries = Array.from(imagesRef.current.entries());
      const toDelete = entries.filter(([key]) => key < start - 30 || key > end + 30);
      toDelete.forEach(([key]) => imagesRef.current.delete(key));
    }
  }, [frameCount, framePath]);

  // Animation loop - optimized
  const animateFrame = useCallback(() => {
    const diff = targetFrameRef.current - frameRef.current;
    
    if (Math.abs(diff) > 0.5) {
      const newFrame = lerp(frameRef.current, targetFrameRef.current, 0.12);
      frameRef.current = newFrame;
      setCurrentFrame(newFrame);
      setDisplayFrame(Math.round(newFrame));
      
      // Preload less frequently
      if (Math.round(newFrame) % 5 === 0) {
        preloadImages(Math.round(newFrame));
      }
      
      rafRef.current = requestAnimationFrame(animateFrame);
    } else {
      frameRef.current = targetFrameRef.current;
      setCurrentFrame(targetFrameRef.current);
      setDisplayFrame(Math.round(targetFrameRef.current));
      rafRef.current = null;
    }
  }, [preloadImages]);

  // Initialize - optimized
  useEffect(() => {
    const init = async () => {
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
      
      // Lazy load rest
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
          setTimeout(loadChunk, 120);
        });
      };
      
      setTimeout(loadChunk, 600);
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
      scrub: 1.2,
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
      if (scrollTriggerRef.current) scrollTriggerRef.current.kill();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isReady, frameCount, animateFrame]);

  const currentImageSrc = framePath(displayFrame);
  const progress = ((displayFrame + 1) / frameCount) * 100;

  // Content visibility for first 80 frames
  const showContent = displayFrame < 80;

  return (
    <section
      ref={sectionRef}
      className="relative h-[400vh] bg-black"
    >
      {/* Sticky Container */}
      <div ref={containerRef} className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        {/* Loading Screen */}
        {!isReady && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
            <div className="text-center">
              <p className="text-[10px] font-light text-white/40 tracking-[0.3em] uppercase mb-6">
                Scene 03
              </p>
              <div className="w-40 h-px bg-white/10 mb-4 mx-auto overflow-hidden">
                <div className="h-full bg-[#c41e3a] transition-all duration-300" style={{ width: `${loadProgress}%` }} />
              </div>
              <p className="text-[10px] font-light text-white/40 tracking-wider">
                Initializing {loadProgress}%
              </p>
            </div>
          </div>
        )}

        {/* Image Frame */}
        <img
          src={currentImageSrc}
          alt={`Frame ${displayFrame}`}
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />

        {/* Very Subtle Grain Overlay */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Lighter Vignette Effect */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.7) 100%)',
          }}
        />

        {/* Side Vignette - Lighter */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/60 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/60 to-transparent z-10 pointer-events-none" />

        {/* Scene Label */}
        <div className="absolute top-8 left-8 z-30">
          <p className="text-[10px] font-light text-white/50 tracking-[0.4em] uppercase">
            Scene 03
          </p>
        </div>

        {/* CENTERED PREMIUM CONTENT - Scene 3 */}
        {isReady && (
          <>
            {/* Main Title - Center Top */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 text-center">
              <p className="text-[10px] font-light text-white/40 tracking-[0.5em] uppercase mb-2">Gordon Murray</p>
              <h2 className="text-3xl font-bold text-white/90 tracking-tight">T.50</h2>
            </div>

            {/* Left Side - Fixed Position */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 max-w-[140px]">
              <div className="space-y-4">
                <div className="border-l-2 border-[#c41e3a] pl-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Engine</p>
                  <p className="text-[16px] font-bold text-white/90">V12</p>
                  <p className="text-[9px] font-light text-white/50">11,500 RPM</p>
                </div>
                <div className="border-l-2 border-white/20 pl-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Power</p>
                  <p className="text-[18px] font-bold text-white/90">654</p>
                  <p className="text-[9px] font-light text-white/50">HP Natural</p>
                </div>
              </div>
            </div>

            {/* Right Side - Fixed Position */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 max-w-[140px] text-right">
              <div className="space-y-4">
                <div className="border-r-2 border-[#c41e3a] pr-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Weight</p>
                  <p className="text-[18px] font-bold text-white/90">986</p>
                  <p className="text-[9px] font-light text-white/50">kg Lightest</p>
                </div>
                <div className="border-r-2 border-white/20 pr-3">
                  <p className="text-[8px] font-light text-white/40 tracking-[0.3em] uppercase">Fan</p>
                  <p className="text-[16px] font-bold text-white/90">16k</p>
                  <p className="text-[9px] font-light text-white/50">RPM Active</p>
                </div>
              </div>
            </div>

            {/* Center Bottom Stats */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-8">
              <div className="text-center">
                <p className="text-[11px] font-light text-white/40 tracking-wider uppercase">0-100</p>
                <p className="text-[16px] font-bold text-white/90">2.8s</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] font-light text-white/40 tracking-wider uppercase">Top Speed</p>
                <p className="text-[16px] font-bold text-white/90">350+</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-[11px] font-light text-white/40 tracking-wider uppercase">Downforce</p>
                <p className="text-[16px] font-bold text-white/90">1,500</p>
              </div>
            </div>
          </>
        )}

        {/* Frame Counter */}
        <div className="absolute bottom-8 right-8 z-30">
          <p className="text-[10px] font-light text-white/50 tracking-wider">
            {String(displayFrame + 1).padStart(3, '0')} / {String(frameCount).padStart(3, '0')}
          </p>
        </div>

        {/* Progress Line */}
        <div className="absolute bottom-8 left-8 right-8 h-px bg-white/10 z-30">
          <div className="h-full bg-[#c41e3a]/60 transition-all duration-75" style={{ width: `${progress}%` }} />
        </div>

        {/* Corner Accents */}
        <div className="absolute top-8 left-8 w-12 h-px bg-white/20 z-30" />
        <div className="absolute top-8 left-8 w-px h-12 bg-white/20 z-30" />
        <div className="absolute top-8 right-8 w-12 h-px bg-white/20 z-30" />
        <div className="absolute top-8 right-8 w-px h-12 bg-white/20 z-30" />
      </div>
    </section>
  );
}

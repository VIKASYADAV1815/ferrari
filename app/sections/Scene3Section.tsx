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

  // Animation loop
  const animateFrame = useCallback(() => {
    const diff = targetFrameRef.current - currentFrame;
    
    if (Math.abs(diff) > 0.1) {
      const newFrame = lerp(currentFrame, targetFrameRef.current, 0.1);
      setCurrentFrame(newFrame);
      setDisplayFrame(Math.round(newFrame));
      preloadImages(Math.round(newFrame));
      rafRef.current = requestAnimationFrame(animateFrame);
    } else {
      setCurrentFrame(targetFrameRef.current);
      setDisplayFrame(Math.round(targetFrameRef.current));
      rafRef.current = null;
    }
  }, [currentFrame, preloadImages]);

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
      className="relative h-[500vh] bg-black"
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

        {/* Subtle Grain Overlay */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Strong Vignette Effect */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.95) 100%)',
          }}
        />

        {/* Side Vignette Darkening */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />

        {/* Scene Label */}
        <div className="absolute top-8 left-8 z-30">
          <p className="text-[10px] font-light text-white/50 tracking-[0.4em] uppercase">
            Scene 03
          </p>
        </div>

        {/* Top Left - Model Info */}
        <div className="absolute top-8 left-24 z-30">
          <p className="text-[12px] font-semibold text-white/80 tracking-[0.15em] uppercase">
            T.50
          </p>
          <p className="text-[9px] font-light text-white/40 tracking-wider mt-1">
            Gordon Murray Automotive
          </p>
        </div>

        {/* Top Right - Specs */}
        <div className="absolute top-8 right-24 z-30 text-right">
          <p className="text-[12px] font-semibold text-white/80 tracking-[0.15em] uppercase">
            V12 NA
          </p>
          <p className="text-[9px] font-light text-white/40 tracking-wider mt-1">
            11,500 RPM Redline
          </p>
        </div>

        {/* LEFT SIDE CONTENT - First 80 frames */}
        {isReady && showContent && (
          <>
            {/* Left Side - Technical Details */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 max-w-[200px]">
              <div className="space-y-6">
                {/* Engine Spec */}
                <div className="border-l-2 border-[#c41e3a]/60 pl-4">
                  <p className="text-[9px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">
                    Powertrain
                  </p>
                  <p className="text-[13px] font-medium text-white/90 tracking-wide">
                    3.9L V12
                  </p>
                  <p className="text-[10px] font-light text-white/50 mt-1">
                    Naturally Aspirated
                  </p>
                  <p className="text-[10px] font-light text-white/50">
                    654 HP @ 11,500 RPM
                  </p>
                </div>

                {/* Fan System */}
                <div className="border-l-2 border-white/20 pl-4">
                  <p className="text-[9px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">
                    Aerodynamics
                  </p>
                  <p className="text-[13px] font-medium text-white/90 tracking-wide">
                    Rear Fan
                  </p>
                  <p className="text-[10px] font-light text-white/50 mt-1">
                    Ground Effect System
                  </p>
                  <p className="text-[10px] font-light text-white/50">
                    16,000 RPM Fan Speed
                  </p>
                </div>

                {/* Weight */}
                <div className="border-l-2 border-white/20 pl-4">
                  <p className="text-[9px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">
                    Weight
                  </p>
                  <p className="text-[13px] font-medium text-white/90 tracking-wide">
                    986 KG
                  </p>
                  <p className="text-[10px] font-light text-white/50 mt-1">
                    Lightest V12 Hypercar
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE CONTENT - Design Philosophy */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-30 max-w-[200px] text-right">
              <div className="space-y-6">
                {/* Design Philosophy */}
                <div className="border-r-2 border-[#c41e3a]/60 pr-4">
                  <p className="text-[9px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">
                    Philosophy
                  </p>
                  <p className="text-[13px] font-medium text-white/90 tracking-wide">
                    Form Follows Function
                  </p>
                  <p className="text-[10px] font-light text-white/50 mt-1 leading-relaxed">
                    Every curve engineered for maximum downforce and minimal drag
                  </p>
                </div>

                {/* Materials */}
                <div className="border-r-2 border-white/20 pr-4">
                  <p className="text-[9px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">
                    Construction
                  </p>
                  <p className="text-[13px] font-medium text-white/90 tracking-wide">
                    Carbon Fiber
                  </p>
                  <p className="text-[10px] font-light text-white/50 mt-1">
                    Titanium Exhaust
                  </p>
                  <p className="text-[10px] font-light text-white/50">
                    Aluminum Suspension
                  </p>
                </div>

                {/* Production */}
                <div className="border-r-2 border-white/20 pr-4">
                  <p className="text-[9px] font-light text-white/40 tracking-[0.3em] uppercase mb-1">
                    Exclusivity
                  </p>
                  <p className="text-[13px] font-medium text-white/90 tracking-wide">
                    100 Units
                  </p>
                  <p className="text-[10px] font-light text-white/50 mt-1">
                    Hand-built in Surrey
                  </p>
                </div>
              </div>
            </div>

            {/* Center Bottom - Key Stats */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex gap-12">
              <div className="text-center">
                <p className="text-[24px] font-bold text-white/90 tracking-tight">2.8s</p>
                <p className="text-[9px] font-light text-white/40 tracking-wider uppercase mt-1">0-100 km/h</p>
              </div>
              <div className="text-center">
                <p className="text-[24px] font-bold text-white/90 tracking-tight">350+</p>
                <p className="text-[9px] font-light text-white/40 tracking-wider uppercase mt-1">Top Speed</p>
              </div>
              <div className="text-center">
                <p className="text-[24px] font-bold text-white/90 tracking-tight">1,500KG</p>
                <p className="text-[9px] font-light text-white/40 tracking-wider uppercase mt-1">Downforce</p>
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

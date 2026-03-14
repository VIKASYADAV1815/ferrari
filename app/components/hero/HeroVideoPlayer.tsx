'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroVideoPlayerProps {
  onProgressUpdate?: (progress: number) => void;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}

export default function HeroVideoPlayer({ onProgressUpdate, sectionRef }: HeroVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const hasStartedRef = useRef(false);
  const hasEndedRef = useRef(false);
  const userInteractedRef = useRef(false);

  // Handle user interaction to enable video
  const handleUserInteraction = useCallback(() => {
    if (!userInteractedRef.current) {
      userInteractedRef.current = true;
      const video = videoRef.current;
      if (video && hasStartedRef.current && video.paused) {
        video.play().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;

    if (!video || !section) return;

    // Wait for video metadata to load
    const handleLoadedMetadata = () => {
      setIsLoaded(true);

      // Kill existing ScrollTrigger if any
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }

      // Create ScrollTrigger for video playback trigger
      scrollTriggerRef.current = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const scrollProgress = self.progress;

          // Notify parent of progress
          onProgressUpdate?.(scrollProgress);

          // 0-20%: Video stays paused at frame 0 (black/intro)
          if (scrollProgress < 0.2) {
            video.currentTime = 0;
            if (!video.paused) {
              video.pause();
            }
            hasStartedRef.current = false;
          }
          // 20%+: Start video playback (only once, smooth transition)
          else if (scrollProgress >= 0.2 && !hasStartedRef.current && !hasEndedRef.current) {
            hasStartedRef.current = true;
            // Try to play with user interaction workaround
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // If autoplay blocked, try muted play
                video.muted = true;
                video.play().catch(() => {
                  console.log('Video play failed');
                });
              });
            }
          }
        },
      });
    };

    // Handle video ended
    const handleEnded = () => {
      hasEndedRef.current = true;
      video.pause();
      // Keep at end frame
      video.currentTime = video.duration;
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    // Force load if already loaded
    if (video.readyState >= 2) {
      handleLoadedMetadata();
    }

    // Add interaction listeners
    const handleInteraction = () => handleUserInteraction();
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('scroll', handleInteraction, { once: true });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [onProgressUpdate, sectionRef, handleUserInteraction]);

  return (
    <div className="absolute inset-0 z-0">
      {/* Black overlay for intro phase */}
      <div
        className="absolute inset-0 bg-black z-10 pointer-events-none"
        style={{ 
          opacity: isLoaded ? 0 : 1,
          transition: 'opacity 0.5s ease'
        }}
      />

      {/* Video Element - Fill entire screen */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full"
        src="/hero.mp4"
        muted
        playsInline
        preload="auto"
        style={{
          objectFit: 'cover',
          objectPosition: 'center center',
          width: '100vw',
          height: '100vh',
        }}
      />

      {/* Very subtle vignette - minimal masking for car visibility */}
      <div
        className="absolute inset-0 z-5 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.1) 100%)',
        }}
      />
    </div>
  );
}

'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroAudioProps {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  audioSrc?: string;
}

export default function HeroAudio({ sectionRef, audioSrc = '/ferrari-engine.mp3' }: HeroAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const hasStartedRef = useRef(false);
  const shouldPlayRef = useRef(false);

  // Handle user interaction to enable audio
  const handleUserInteraction = useCallback(() => {
    if (!userInteracted) {
      setUserInteracted(true);
      // Try to play if we should be playing
      if (shouldPlayRef.current && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [userInteracted]);

  useEffect(() => {
    // Add interaction listeners
    const events = ['click', 'touchstart', 'scroll', 'keydown'];
    events.forEach(event => {
      window.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [handleUserInteraction]);

  useEffect(() => {
    const audio = audioRef.current;
    const section = sectionRef.current;

    if (!audio || !section) return;

    // Handle audio loaded
    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.load();

    // Create ScrollTrigger for audio playback
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const scrollProgress = self.progress;

        // 0-20%: Audio stays paused at 0
        if (scrollProgress < 0.2) {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
          hasStartedRef.current = false;
          shouldPlayRef.current = false;
        }
        // 20%+: Start audio playback (only once)
        else if (scrollProgress >= 0.2 && !hasStartedRef.current) {
          hasStartedRef.current = true;
          shouldPlayRef.current = true;
          
          // Only play if user has interacted
          if (userInteracted) {
            audio.volume = 0.4;
            audio.play().catch(() => {
              console.log('Audio play failed');
            });
          }
        }
      },
    });

    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [sectionRef, audioSrc, userInteracted]);

  return (
    <audio
      ref={audioRef}
      src={audioSrc}
      preload="auto"
      loop
      style={{ display: 'none' }}
    />
  );
}

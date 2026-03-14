'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 300);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsComplete(true);
            onComplete?.();
          }, 600);
          return 100;
        }
        return prev + Math.random() * 12 + 3;
      });
    }, 180);

    return () => {
      clearInterval(interval);
      clearTimeout(contentTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Subtle Noise Texture */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Very Subtle Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,40,0,0.03)_0%,_transparent_60%)]" />

          {/* Main Content */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Minimal Logo Mark */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-16"
                >
                  <div className="relative">
                    {/* Stylized F Mark */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="w-20 h-24 border-l-2 border-t-2 border-b-2 border-white/80 relative"
                    >
                      <div className="absolute top-1/2 left-0 w-12 h-px bg-white/80 -translate-y-1/2" />
                      <div className="absolute top-1/3 left-0 w-8 h-px bg-white/40 -translate-y-1/2" />
                      {/* Accent dot */}
                      <div className="absolute -right-1 top-0 w-2 h-2 bg-[#c41e3a]" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Typography */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center mb-20"
                >
                  <h1 className="text-4xl md:text-6xl font-light tracking-[0.3em] text-white uppercase">
                    Ferrari
                  </h1>
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <div className="w-12 h-px bg-white/20" />
                    <p className="text-[10px] md:text-xs font-light text-white/40 tracking-[0.5em] uppercase">
                      Maranello
                    </p>
                    <div className="w-12 h-px bg-white/20" />
                  </div>
                </motion.div>

                {/* Minimal Progress */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="w-48 md:w-56"
                >
                  {/* Progress Line */}
                  <div className="relative h-px bg-white/10 overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-white/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </div>

                  {/* Progress Number */}
                  <div className="flex justify-center mt-6">
                    <span className="text-xs font-light text-white/30 tabular-nums tracking-widest">
                      {Math.min(Math.round(progress), 100).toString().padStart(3, '0')}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Corner Accents - Minimal */}
          <div className="absolute top-12 left-12 w-8 h-px bg-white/10" />
          <div className="absolute top-12 left-12 w-px h-8 bg-white/10" />
          <div className="absolute top-12 right-12 w-8 h-px bg-white/10" />
          <div className="absolute top-12 right-12 w-px h-8 bg-white/10" />
          <div className="absolute bottom-12 left-12 w-8 h-px bg-white/10" />
          <div className="absolute bottom-12 left-12 w-px h-8 bg-white/10" />
          <div className="absolute bottom-12 right-12 w-8 h-px bg-white/10" />
          <div className="absolute bottom-12 right-12 w-px h-8 bg-white/10" />

          {/* Single Red Accent */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <div className="w-1 h-1 bg-[#c41e3a]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

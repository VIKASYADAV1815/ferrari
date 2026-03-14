'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';

interface FerrariSequenceProps {
  frameCount?: number;
  // Default to scene1 folder
  framePath?: (index: number) => string;
}

interface Hotspot {
  frameStart: number;
  frameEnd: number;
  x: number;
  y: number;
  title: string;
  description: string;
}

const hotspots: Hotspot[] = [
  {
    frameStart: 5,
    frameEnd: 15,
    x: 70,
    y: 40,
    title: "V12 Powertrain",
    description: "Naturally aspirated 6.5L V12 engine delivering 800 cv, the most powerful naturally aspirated engine ever in a road-going Ferrari."
  },
  {
    frameStart: 20,
    frameEnd: 30,
    x: 30,
    y: 60,
    title: "Aerodynamic Sculpting",
    description: "Designed by the wind. Every vent, duct, and curve serves to manage airflow, generating massive downforce without drag."
  },
  {
    frameStart: 35,
    frameEnd: 45,
    x: 50,
    y: 75,
    title: "Carbon Ceramic Brakes",
    description: "Extreme stopping power with 398mm front and 360mm rear carbon ceramic discs, ensuring fade-free performance on track."
  }
];

export default function FerrariSequence({
  frameCount = 50,
  framePath = (i) => `/scene1/frame-${i.toString().padStart(3, '0')}.jpg`,
}: FerrariSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<(HTMLImageElement | null)[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [missingAssets, setMissingAssets] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, frameCount - 1]);

  useEffect(() => {
    let isMounted = true;

    const handleResize = () => {
       const canvas = canvasRef.current;
       if (canvas) {
           canvas.width = window.innerWidth;
           canvas.height = window.innerHeight;
           drawFrame(currentFrame);
       }
    };
    window.addEventListener('resize', handleResize);
    
    // Attempt to load local images
    const loadImages = async () => {
        const loadedImages: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
        let successCount = 0;

        // Try loading just the first image to see if assets exist
        const testImg = new Image();
        testImg.onload = () => {
             if (!isMounted) return;
             
             // Load all in background
             for (let i = 0; i < frameCount; i++) {
                 const img = new Image();
                 img.onload = () => {
                     if (isMounted) {
                        loadedImages[i] = img;
                        successCount++;
                        if (successCount > 5) setImages([...loadedImages]);
                     }
                 };
                 img.src = framePath(i + 1);
             }
        };
        
        testImg.onerror = () => {
            if (isMounted) setMissingAssets(true);
        };
        
        testImg.src = framePath(1);
    };

    loadImages();
    drawFrame(0);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [frameCount, framePath]);

  useMotionValueEvent(frameIndex, "change", (latest) => {
    const frame = Math.round(latest);
    if (frame !== currentFrame) {
      setCurrentFrame(frame);
      drawFrame(frame);
      
      const current = hotspots.find(h => frame >= h.frameStart && frame <= h.frameEnd);
      setActiveHotspot(current || null);
    }
  });

  useEffect(() => {
      drawFrame(currentFrame);
  }, [images, missingAssets]);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
    if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;

    const img = images[index];

    if (img && img.complete && img.naturalHeight !== 0) {
       // Draw Real Image
       const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
       const x = (canvas.width - img.width * ratio) / 2;
       const y = (canvas.height - img.height * ratio) / 2;
       
       ctx.fillStyle = '#000';
       ctx.fillRect(0, 0, canvas.width, canvas.height);
       ctx.drawImage(img, 0, 0, img.width, img.height, x, y, img.width * ratio, img.height * ratio);
    } else {
       // Draw Generative Fallback (Ferrari Style)
       drawFerrariGenerativeFrame(ctx, index, canvas.width, canvas.height);
    }
  };

  const drawFerrariGenerativeFrame = (ctx: CanvasRenderingContext2D, index: number, w: number, h: number) => {
      const progress = index / frameCount;
      const angle = progress * Math.PI * 2;
      const cx = w / 2;
      const cy = h / 2;

      // Dark Studio Background
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h));
      gradient.addColorStop(0, '#1a0505'); // Slight red tint in dark
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Floor Reflection
      ctx.fillStyle = 'rgba(255, 40, 0, 0.05)'; // Ferrari red reflection
      ctx.beginPath();
      ctx.ellipse(cx, cy + h * 0.2, w * 0.6, h * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle * 0.5); 
      
      const carW = Math.min(w, h) * 0.85;
      const carH = carW * 0.35; // Lower, sleeker profile
      
      // Body gradient (Ferrari Rosso Corsa)
      const bodyGrad = ctx.createLinearGradient(-carW/2, -carH/2, carW/2, carH/2);
      bodyGrad.addColorStop(0, '#ff2800'); // Rosso Corsa
      bodyGrad.addColorStop(0.5, '#cc0000');
      bodyGrad.addColorStop(1, '#660000');
      
      ctx.fillStyle = bodyGrad;
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 60;
      ctx.shadowOffsetY = 40;
      
      // More aerodynamic shape
      ctx.beginPath();
      ctx.moveTo(-carW/2, carH * 0.2);
      ctx.quadraticCurveTo(-carW * 0.4, -carH * 0.8, 0, -carH * 0.8); // Roofline
      ctx.quadraticCurveTo(carW * 0.4, -carH * 0.8, carW/2, carH * 0.2); // Rear
      ctx.lineTo(carW/2, carH/2);
      ctx.lineTo(-carW/2, carH/2);
      ctx.fill();

      // Side intake (Ferrari signature)
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(carW * 0.1, 0);
      ctx.lineTo(carW * 0.3, 0);
      ctx.lineTo(carW * 0.25, carH * 0.3);
      ctx.fill();

      // Wheels (Star pattern)
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-carW * 0.35, carH * 0.4, carH * 0.28, 0, Math.PI * 2);
      ctx.arc(carW * 0.35, carH * 0.4, carH * 0.3, 0, Math.PI * 2); // Larger rear wheel
      ctx.fill();

      // Yellow Calipers
      ctx.fillStyle = '#FFD700'; // Giallo Modena
      ctx.beginPath();
      ctx.arc(-carW * 0.35, carH * 0.4, carH * 0.15, 3, 4.5);
      ctx.arc(carW * 0.35, carH * 0.4, carH * 0.16, 3, 4.5);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#FFD700';
      ctx.stroke();

      ctx.restore();
      
      // UI Overlay
      ctx.fillStyle = '#ff2800';
      ctx.font = 'bold 16px "Arial", sans-serif';
      ctx.fillText(`SCENE 1 // FRAME ${index.toString().padStart(2, '0')}`, 40, 40);
      
      // Progress line
      ctx.fillStyle = 'rgba(255,40,0,0.2)';
      ctx.fillRect(40, 60, 200, 2);
      ctx.fillStyle = '#ff2800';
      ctx.fillRect(40, 60, 200 * progress, 2);
  };

  return (
    <div ref={containerRef} className="relative w-full bg-black" style={{ height: `${frameCount * 15}vh` }}>
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-black">
        
        <canvas 
          ref={canvasRef}
          className="block w-full h-full"
        />

        {/* Missing Assets Instructions Overlay */}
        {missingAssets && (
            <div className="absolute top-24 left-10 p-6 bg-red-950/90 backdrop-blur-md border border-red-500/50 rounded-lg max-w-md z-30 text-white">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-red-500">
                    ⚠️ SCENE 1 ASSETS MISSING
                </h3>
                <p className="text-sm mb-4 opacity-90">
                    The sequence is running in <strong>Ferrari Generative Mode</strong>.
                </p>
                <div className="text-xs font-mono bg-black/80 p-3 rounded border border-red-500/20 mb-4 text-gray-300">
                    Expected: /public/scene1/frame-001.jpg<br/>
                    ...<br/>
                    Expected: /public/scene1/frame-050.jpg
                </div>
                <p className="text-xs opacity-70">
                    <strong>To fix:</strong> Create <code>/public/scene1/</code> and drop your 50 frame images there.
                </p>
            </div>
        )}
        
        <AnimatePresence>
          {activeHotspot && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute z-20 flex flex-col items-center pointer-events-auto"
              style={{ 
                left: `${activeHotspot.x}%`, 
                top: `${activeHotspot.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative flex items-center justify-center w-8 h-8 mb-4 cursor-pointer group">
                <div className="absolute w-full h-full bg-red-600 rounded-full opacity-50 animate-ping" />
                <div className="relative w-3 h-3 bg-red-600 rounded-full group-hover:scale-150 transition-transform shadow-[0_0_10px_#ff0000]" />
                <div className="absolute top-8 left-1/2 w-px h-16 bg-red-600/50" />
              </div>

              <div className="mt-16 bg-black/90 backdrop-blur-md border border-red-600/30 p-6 rounded-none w-80 text-white shadow-[0_0_30px_rgba(255,0,0,0.1)]">
                <h3 className="text-xl font-black uppercase tracking-wider mb-2 text-red-500 italic">{activeHotspot.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed font-light">
                  {activeHotspot.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
            className="absolute top-10 right-10 z-10 text-right pointer-events-none"
        >
            <h1 className="text-6xl font-black uppercase tracking-tighter text-white italic">Ferrari</h1>
            <p className="text-lg font-mono text-red-600 tracking-[0.5em]">812 SUPERFAST</p>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 z-10 pointer-events-none">
            <p className="text-xs font-mono text-red-600 uppercase tracking-widest flex items-center gap-4">
              <span className="w-8 h-px bg-red-600" />
              Scuderia Ferrari
            </p>
        </div>
      </div>
    </div>
  );
}

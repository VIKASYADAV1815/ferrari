'use client';

import { useState, useEffect } from 'react';
import HeroSection from "./sections/HeroSection";
import Scene1Section from "./sections/Scene1Section";
import Scene2Section from "./sections/Scene2Section";
import Scene3Section from "./sections/Scene3Section";
import Preloader from "./components/Preloader";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top on page refresh
  useEffect(() => {
    // Always scroll to top on mount (handles refresh)
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <>
      <Preloader onComplete={() => setIsLoading(false)} />
      <div className={`flex flex-col bg-black min-h-screen transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <HeroSection />
        <Scene1Section />
        <Scene2Section />
        <Scene3Section />
      </div>
    </>
  );
}

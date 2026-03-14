'use client';

import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="bg-black border-t border-white/5">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold text-white/90 tracking-tight mb-4">
              FERRARI
            </h3>
            <p className="text-xs font-light text-white/40 leading-relaxed">
              Official Ferrari website. Discover the world of Ferrari: history, racing, models, and more.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:border-[#c41e3a] transition-colors group">
                <span className="text-[10px] text-white/40 group-hover:text-[#c41e3a] transition-colors">IG</span>
              </a>
              <a href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:border-[#c41e3a] transition-colors group">
                <span className="text-[10px] text-white/40 group-hover:text-[#c41e3a] transition-colors">FB</span>
              </a>
              <a href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:border-[#c41e3a] transition-colors group">
                <span className="text-[10px] text-white/40 group-hover:text-[#c41e3a] transition-colors">YT</span>
              </a>
              <a href="#" className="w-8 h-8 border border-white/10 flex items-center justify-center hover:border-[#c41e3a] transition-colors group">
                <span className="text-[10px] text-white/40 group-hover:text-[#c41e3a] transition-colors">X</span>
              </a>
            </div>
          </div>

          {/* Models */}
          <div>
            <h4 className="text-[10px] font-medium text-white/60 tracking-[0.3em] uppercase mb-6">
              Models
            </h4>
            <ul className="space-y-3">
              {['SF90 Stradale', '296 GTB', '812 Competizione', 'Roma', 'Purosangue'].map((model) => (
                <li key={model}>
                  <a href="#" className="text-xs font-light text-white/40 hover:text-white/80 transition-colors">
                    {model}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Racing */}
          <div>
            <h4 className="text-[10px] font-medium text-white/60 tracking-[0.3em] uppercase mb-6">
              Racing
            </h4>
            <ul className="space-y-3">
              {['Scuderia Ferrari', 'F1 Team', 'Ferrari Challenge', 'GT Racing', 'Esports'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-xs font-light text-white/40 hover:text-white/80 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] font-medium text-white/60 tracking-[0.3em] uppercase mb-6">
              Newsletter
            </h4>
            <p className="text-xs font-light text-white/40 mb-4">
              Stay updated with the latest from Ferrari.
            </p>
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-xs text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#c41e3a]/50 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#c41e3a] text-white text-xs font-medium hover:bg-[#a01830] transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-[10px] font-light text-white/30">
              © 2024 Ferrari S.p.A. All rights reserved.
            </p>

            {/* Links */}
            <div className="flex gap-6">
              {['Privacy Policy', 'Legal Notice', 'Cookie Policy', 'Accessibility'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-[10px] font-light text-white/30 hover:text-white/60 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Ferrari Logo Mark */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border border-[#c41e3a] rounded-sm flex items-center justify-center">
                <span className="text-[8px] font-bold text-[#c41e3a]">F</span>
              </div>
              <span className="text-[10px] font-light text-white/30 tracking-wider">OFFICIAL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

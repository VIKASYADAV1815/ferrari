'use client';

import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-32 pb-12 px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-zinc-800" />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-32">
        <div className="md:col-span-6">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8">
            Ready to build?
          </h2>
          <p className="text-zinc-400 text-lg max-w-md mb-8">
            Let&apos;s create something extraordinary together. Whether it&apos;s a digital experience or a physical space, we&apos;re here to help.
          </p>
          <a 
            href="mailto:hello@mantis.works" 
            className="inline-block text-xl border-b border-white pb-1 hover:text-zinc-300 hover:border-zinc-300 transition-colors"
          >
            hello@mantis.works
          </a>
        </div>

        <div className="md:col-span-6 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-6">Social</h3>
            <ul className="space-y-4">
              {['Instagram', 'LinkedIn', 'Twitter', 'Vimeo'].map((social) => (
                <li key={social}>
                  <a href="#" className="text-zinc-300 hover:text-white transition-colors">
                    {social}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-6">Offices</h3>
            <ul className="space-y-4 text-zinc-300">
              <li>New York</li>
              <li>Los Angeles</li>
              <li>London</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end border-t border-zinc-900 pt-12">
        <span className="text-zinc-600 text-sm">
          © {new Date().getFullYear()} Mantis. All rights reserved.
        </span>
        
        <motion.h1 
          initial={{ opacity: 0.5 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-[12vw] leading-none font-bold tracking-tighter text-zinc-900 select-none pointer-events-none mt-12 md:mt-0"
        >
          MANTIS
        </motion.h1>
      </div>
    </footer>
  );
};

export default Footer;

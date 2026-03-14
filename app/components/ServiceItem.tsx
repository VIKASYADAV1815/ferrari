'use client';

import { motion } from 'framer-motion';
import { ServiceItem as ServiceItemType } from '../data/services';

const ServiceItem = ({ item, index }: { item: ServiceItemType; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative border-t border-zinc-800 py-12 md:py-16 transition-colors hover:bg-zinc-900/30"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4 md:px-0">
        <div className="md:col-span-5">
          <h3 className="text-2xl md:text-4xl font-light mb-4 text-white group-hover:text-white transition-colors">
            {item.title}
          </h3>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">
            {item.description}
          </p>
        </div>

        <div className="md:col-span-7 flex flex-wrap content-start gap-x-6 gap-y-2">
           <h4 className="w-full text-xs uppercase tracking-widest text-zinc-600 mb-2">Related Services</h4>
           {item.tags.map((tag, i) => (
             <span key={i} className="text-zinc-500 text-sm hover:text-white transition-colors cursor-default">
               {tag}
             </span>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceItem;

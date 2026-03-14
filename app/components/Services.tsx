'use client';

import { servicesData } from '../data/services';
import ServiceItem from './ServiceItem';

const Services = () => {
  return (
    <div className="bg-black text-white py-20 md:py-32">
      {servicesData.map((category) => (
        <section key={category.title} id={category.title.toLowerCase().split(' ')[0]} className="mb-32 px-4 md:px-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            <div className="md:col-span-4 relative">
              <div className="sticky top-32">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-zinc-800">
                  {category.title}
                </h2>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 absolute top-0 left-0 text-white mix-blend-overlay opacity-80">
                  {category.title}
                </h2>
                <p className="text-zinc-500 text-sm md:text-base max-w-xs">
                  {category.description}
                </p>
                <div className="mt-8 w-12 h-[1px] bg-zinc-800" />
              </div>
            </div>

            <div className="md:col-span-8 space-y-0">
              {category.items.map((item, index) => (
                <ServiceItem key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};

export default Services;

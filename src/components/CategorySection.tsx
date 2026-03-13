import React from 'react';
import { CATEGORIES } from '../constants';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export const CategorySection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-sans text-[#1A1A1A] flex items-center gap-2">
            Browse Car Rentals in 
            <span className="text-[#A8441E] border-b-2 border-[#A8441E] cursor-pointer flex items-center gap-1">
              Dubai <ChevronDown size={20} />
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-12 gap-x-8">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="group flex flex-col items-center text-center cursor-pointer"
            >
              <div className="relative w-full aspect-[4/3] mb-4 overflow-hidden">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-[13px] font-bold text-[#1A1A1A] tracking-tight group-hover:text-[#A8441E] transition-colors">
                  {cat.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

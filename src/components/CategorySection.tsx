import React from 'react';
import { CATEGORIES } from '../constants';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export const CategorySection = () => {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl md:text-5xl font-serif text-[#1A1A1A]">
            Select Your Choice of Cars
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-y-12 gap-x-12">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
              className="group flex flex-col items-center text-center cursor-pointer"
            >
              <div className="relative w-3/4 aspect-[16/10] mb-4">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110"
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

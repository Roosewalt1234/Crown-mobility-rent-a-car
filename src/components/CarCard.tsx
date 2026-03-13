import React from 'react';
import { Users, Fuel, Gauge, ArrowRight } from 'lucide-react';
import { Car } from '../types';
import { motion } from 'motion/react';

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4AF37]/30 transition-all"
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={car.image} 
          alt={car.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">{car.type}</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest">{car.brand}</p>
            <h3 className="text-xl font-serif text-white mt-1">{car.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-[#D4AF37] text-xl font-bold">AED {car.pricePerDay}</p>
            <p className="text-white/30 text-[10px] uppercase">Per Day</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
          <div className="flex flex-col items-center gap-1">
            <Users size={14} className="text-white/40" />
            <span className="text-[10px] text-white/60">{car.specs.passengers} Seats</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-white/5">
            <Gauge size={14} className="text-white/40" />
            <span className="text-[10px] text-white/60">{car.specs.transmission}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Fuel size={14} className="text-white/40" />
            <span className="text-[10px] text-white/60">{car.specs.fuel}</span>
          </div>
        </div>

        <button className="w-full py-3 bg-white/5 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-[#D4AF37] hover:text-black transition-all group/btn">
          <span className="text-sm font-bold uppercase tracking-widest">Book Now</span>
          <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
};

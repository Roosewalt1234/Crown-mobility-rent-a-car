import React from 'react';
import { Share2, Heart, MapPin, Check, Phone, MessageCircle, Calendar, Shield, Settings, ArrowRight } from 'lucide-react';
import { Car } from '../types';
import { motion } from 'framer-motion';

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -12 }}
      className="group relative bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 flex flex-col h-full"
    >
      {/* Dynamic Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] rounded-[2.6rem] blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
      
      {/* Image Section with Parallax-like Zoom */}
      <div className="relative h-80 overflow-hidden">
        <motion.img 
          src={car.image} 
          alt={car.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Floating Badge */}
        <div className="absolute top-6 left-6">
          <div className="px-4 py-1.5 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">{car.type}</span>
          </div>
        </div>

        {/* Top Actions Overlay */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
          <button className="p-3 rounded-2xl bg-white/90 backdrop-blur-md text-gray-900 hover:bg-[#D4AF37] hover:text-white shadow-xl transition-all">
            <Share2 size={20} />
          </button>
          <button className="p-3 rounded-2xl bg-white/90 backdrop-blur-md text-gray-900 hover:bg-red-500 hover:text-white shadow-xl transition-all">
            <Heart size={20} />
          </button>
        </div>

        {/* Pagination Dots Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === 0 ? 'w-6 bg-[#D4AF37]' : 'w-1.5 bg-white/50'}`} />
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </div>

      <div className="p-8 flex flex-col flex-1 space-y-6 relative bg-white">
        {/* Header: Title & Description */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#D4AF37] transition-colors duration-300">{car.name}</h3>
            <div className="flex items-center gap-1 text-[#D4AF37]">
              <Shield size={16} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Verified</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 font-light italic">
            "{car.description}"
          </p>
        </div>

        {/* Location & Tags with Glassmorphism */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl">
            <MapPin size={14} />
            <span className="text-[11px] font-bold">{car.location}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl">
            <Calendar size={14} />
            <span className="text-[11px] font-bold">{car.year}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-xl">
            <Settings size={14} />
            <span className="text-[11px] font-bold">{car.region}</span>
          </div>
        </div>

        {/* Pricing Section - Interactive Bento Style */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Rental Plans</span>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'day', price: car.pricing.day, active: true },
              { label: 'week', price: car.pricing.week, active: false },
              { label: 'month', price: car.pricing.month, active: false }
            ].map((plan) => (
              <motion.div 
                key={plan.label}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-3xl text-center transition-all duration-300 cursor-pointer ${
                  plan.active 
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8962E] text-white shadow-lg shadow-[#D4AF37]/30' 
                    : 'bg-gray-50 border border-gray-100 text-gray-900 hover:bg-white hover:border-[#D4AF37]/30'
                }`}
              >
                <p className={`text-[9px] uppercase font-bold mb-1 ${plan.active ? 'text-white/70' : 'text-gray-400'}`}>
                  {plan.label}
                </p>
                <p className="text-sm font-black">AED {plan.price.current}</p>
                <p className={`text-[8px] line-through mt-0.5 ${plan.active ? 'text-white/50' : 'text-gray-300'}`}>
                  AED {plan.price.original}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mileage Info with Visual Progress */}
        <div className="p-5 bg-black/[0.02] rounded-3xl space-y-3 border border-black/[0.03]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span className="text-xs font-medium text-gray-500">Mileage Limit</span>
            </div>
            <span className="text-sm font-black text-gray-900">{car.mileageLimit} km <span className="text-[10px] text-gray-400 font-normal">/ day</span></span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '70%' }}
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700]"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
            <span>Extra: AED {car.additionalMileageCharge}/km</span>
            <span className="text-green-600">Insurance Included</span>
          </div>
        </div>

        {/* Book Now Button with Shimmer and Scale */}
        <div className="pt-4 mt-auto">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group/btn relative w-full py-5 bg-gray-900 text-white font-black rounded-3xl overflow-hidden transition-all duration-300 shadow-2xl shadow-black/20"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
            
            <div className="relative flex items-center justify-center gap-3">
              <span className="uppercase tracking-[0.3em] text-xs">Book This Experience</span>
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center group-hover/btn:rotate-45 transition-transform duration-500">
                <ArrowRight size={16} className="text-black" />
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

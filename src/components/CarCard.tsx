import React from 'react';
import { Share2, Heart, MapPin, Check, Phone, MessageCircle, Car as CarIcon, Settings, Info } from 'lucide-react';
import { Car } from '../types';
import { motion } from 'motion/react';

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full font-sans"
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={car.image} 
          alt={car.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === 0 ? 'w-2 bg-white' : 'w-2 bg-white/40'}`} />
          ))}
        </div>

        {/* Back Arrow (Optional, as seen in image) */}
        <div className="absolute top-4 left-4">
          <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        {/* Title & Actions */}
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-gray-900 leading-tight">{car.name}</h3>
            <p className="text-[11px] text-gray-500 leading-snug">
              Rent in Dubai: {car.description}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
              <Share2 size={16} />
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
              <Heart size={16} />
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-[#FF6321]">
          <MapPin size={14} fill="currentColor" fillOpacity={0.2} />
          <span className="text-[12px] font-medium">{car.location}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-gray-600">
            <CarIcon size={14} />
            <span className="text-xs font-medium">{car.year}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-gray-600">
            <Settings size={14} />
            <span className="text-xs font-medium">{car.region}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-gray-600">
            <span className="text-xs font-medium uppercase">{car.type}</span>
          </div>
        </div>

        {/* Pricing Header */}
        <div className="pt-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-900">Pricing</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-3 gap-1.5 bg-gray-50/50 p-1 rounded-xl border border-gray-100">
          {[
            { label: 'day', price: car.pricing.day, active: true },
            { label: 'week', price: car.pricing.week, active: false },
            { label: 'month', price: car.pricing.month, active: false }
          ].map((plan) => (
            <div 
              key={plan.label}
              className={`py-2 px-1 rounded-lg text-center transition-all ${
                plan.active 
                  ? 'bg-white shadow-sm border border-gray-100' 
                  : 'opacity-60'
              }`}
            >
              <p className="text-[8px] uppercase font-bold text-gray-400 line-through mb-0.5">
                AED {plan.price.original}
              </p>
              <p className="text-[13px] font-bold text-gray-900 leading-none">AED {plan.price.current}</p>
              <p className="text-[9px] font-bold text-[#FF6321] mt-1">
                / {plan.label}
              </p>
            </div>
          ))}
        </div>

        {/* Mileage Table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden text-[12px]">
          <div className="flex justify-between items-center p-2.5 border-b border-gray-50">
            <span className="text-gray-500">Mileage limit</span>
            <span className="font-bold text-gray-900">{car.mileageLimit} km</span>
          </div>
          <div className="flex justify-between items-center p-2.5">
            <span className="text-gray-500">Extra charge</span>
            <span className="font-bold text-gray-900">AED {car.additionalMileageCharge}/Km</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={10} className="text-white" strokeWidth={4} />
            </div>
            <span className="text-[12px] text-gray-600">1 day rental available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={10} className="text-white" strokeWidth={4} />
            </div>
            <span className="text-[12px] text-gray-600">Insurance included</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2 mt-auto">
          <button className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-purple-100 bg-[#F5F3FF] text-[#7C3AED] hover:bg-purple-100 transition-colors">
            <Phone size={20} fill="currentColor" />
          </button>
          <button className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-green-100 bg-[#F0FDF4] text-[#22C55E] hover:bg-green-100 transition-colors">
            <MessageCircle size={22} fill="currentColor" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

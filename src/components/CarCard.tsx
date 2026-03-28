import React from 'react';
import { MapPin, Check, Car as CarIcon, Settings } from 'lucide-react';
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
      whileHover={{ y: -12, scale: 1.02 }}
      viewport={{ once: true }}
      className="group relative p-[1.5px] rounded-[2rem] transition-all duration-500 h-full flex"
    >
      {/* Gradient Border Background */}
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#FF6321] via-[#FFD700] to-[#FF6321] opacity-10 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Inner Card Content */}
      <div className="relative bg-white rounded-[calc(2rem-1.5px)] overflow-hidden shadow-sm group-hover:shadow-2xl group-hover:shadow-orange-200/40 flex flex-col w-full h-full font-sans transition-all duration-500">
        {/* Top Badges */}
        <div className="px-4 py-2.5 flex justify-between items-center bg-white border-b border-gray-50 overflow-hidden">
          <div className="flex flex-wrap gap-1">
            {car.type?.toString().split(',').map((t, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-tight whitespace-nowrap">
                {t.trim()}
              </span>
            ))}
          </div>
          {car.year && (
            <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold tracking-tight">
              {car.year}
            </span>
          )}
        </div>

        {/* Image Section */}
        <div className="relative h-36 overflow-hidden">
          <img 
            src={car.image} 
            alt={car.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
            <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-1 space-y-3">
          {/* Title */}
          <div className="flex justify-between items-start gap-2">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-[#FF6321] transition-colors">{car.name}</h3>
              <p className="text-[11px] text-gray-500 leading-snug">
                {car.description}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-[#FF6321]">
            <MapPin size={14} fill="currentColor" fillOpacity={0.2} />
            <span className="text-[12px] font-medium">{car.location}</span>
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
              { label: 'day', price: car.pricing.day, active: true, actual: null },
              { label: 'week', price: car.pricing.week, active: false, actual: Math.round(car.pricing.week.current / 7) },
              { label: 'month', price: car.pricing.month, active: false, actual: Math.round(car.pricing.month.current / 30) }
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
                {plan.actual && (
                  <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                    AED {plan.actual}/day
                  </p>
                )}
                {plan.label === 'day' && (
                  <p className="text-[8px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                    Intro Rate
                  </p>
                )}
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

          {/* Footer Button */}
          <div className="pt-2 mt-auto">
            <button 
              onClick={() => {
                const event = new CustomEvent('open_chatbot', { 
                  detail: { 
                    carName: car.name,
                    carId: car.id,
                    message: `I am interested in booking the ${car.name}.`
                  } 
                });
                window.dispatchEvent(event);
              }}
              className="w-full py-4 bg-[#FF6321] text-white font-bold rounded-2xl hover:bg-[#e5591e] transition-all active:scale-[0.98] shadow-sm shadow-orange-200 uppercase tracking-wider text-sm"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

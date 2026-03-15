import React from 'react';
import { Search, Calendar, MapPin, Car } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1920")',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight drop-shadow-2xl">
            Drive the <span className="text-[#D4AF37] italic">Extraordinary</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light tracking-wide drop-shadow-lg">
            Experience the pinnacle of luxury and performance in the heart of the UAE.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12 w-full max-w-5xl bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <Car className="text-[#D4AF37]" size={20} />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Car Type</p>
                <select className="bg-transparent text-white text-sm outline-none w-full appearance-none">
                  <option className="bg-black">All Categories</option>
                  <option className="bg-black">Luxury</option>
                  <option className="bg-black">Sports</option>
                  <option className="bg-black">SUV</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <MapPin className="text-[#D4AF37]" size={20} />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Pickup Location</p>
                <select className="bg-transparent text-white text-sm outline-none w-full appearance-none">
                  <option className="bg-black">Dubai Marina</option>
                  <option className="bg-black">Downtown Dubai</option>
                  <option className="bg-black">DXB Airport</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <Calendar className="text-[#D4AF37]" size={20} />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Rental Date</p>
                <input type="date" className="bg-transparent text-white text-sm outline-none w-full [color-scheme:dark]" />
              </div>
            </div>

            <button className="bg-[#D4AF37] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#B8962E] transition-all active:scale-95">
              <Search size={20} />
              <span>Find Your Ride</span>
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
          {[
            { label: 'Premium Cars', value: '150+' },
            { label: 'Happy Clients', value: '10k+' },
            { label: 'UAE Locations', value: '12' },
            { label: 'Support', value: '24/7' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-serif text-[#D4AF37]">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

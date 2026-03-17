import React, { useState, useRef } from 'react';
import { Search, Calendar, MapPin, Car, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Hero = () => {
  const [carType, setCarType] = useState('All Categories');
  const [location, setLocation] = useState('Dubai Marina');
  const [date, setDate] = useState('');
  
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const carTypes = ['All Categories', 'Luxury', 'Sports', 'SUV', 'Convertible'];
  const locations = ['Dubai Marina', 'Downtown Dubai', 'DXB Airport', 'Palm Jumeirah', 'Abu Dhabi'];

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleDateClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

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
            {/* Car Type Selector */}
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleDropdown('carType')}
                className="flex items-center justify-between gap-3 bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Car className="text-[#D4AF37]" size={20} />
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-widest text-white/50">Car Type</p>
                    <p className="text-white text-sm font-medium">{carType}</p>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-white/40 transition-transform duration-300 ${activeDropdown === 'carType' ? 'rotate-180' : ''}`} />
              </motion.div>
              
              <AnimatePresence>
                {activeDropdown === 'carType' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                  >
                    {carTypes.map((type) => (
                      <div 
                        key={type}
                        onClick={() => { setCarType(type); setActiveDropdown(null); }}
                        className="px-4 py-3 text-sm text-white hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer text-left"
                      >
                        {type}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Location Selector */}
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleDropdown('location')}
                className="flex items-center justify-between gap-3 bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="text-[#D4AF37]" size={20} />
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-widest text-white/50">Pickup Location</p>
                    <p className="text-white text-sm font-medium">{location}</p>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-white/40 transition-transform duration-300 ${activeDropdown === 'location' ? 'rotate-180' : ''}`} />
              </motion.div>

              <AnimatePresence>
                {activeDropdown === 'location' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                  >
                    {locations.map((loc) => (
                      <div 
                        key={loc}
                        onClick={() => { setLocation(loc); setActiveDropdown(null); }}
                        className="px-4 py-3 text-sm text-white hover:bg-[#D4AF37] hover:text-black transition-colors cursor-pointer text-left"
                      >
                        {loc}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date Selector */}
            <motion.div 
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDateClick}
              className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer transition-colors"
            >
              <Calendar className="text-[#D4AF37]" size={20} />
              <div className="text-left w-full">
                <p className="text-[10px] uppercase tracking-widest text-white/50">Rental Date</p>
                <input 
                  ref={dateInputRef}
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-white text-sm outline-none w-full [color-scheme:dark] cursor-pointer" 
                />
              </div>
            </motion.div>

            <button className="bg-[#D4AF37] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#B8962E] transition-all active:scale-95 shadow-lg shadow-[#D4AF37]/20">
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
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl md:text-3xl font-serif text-[#D4AF37]">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1 font-bold">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

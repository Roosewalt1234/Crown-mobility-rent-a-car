import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { WavyTransition } from '../components/WavyTransition';
import { CategorySection } from '../components/CategorySection';
import { CarCard } from '../components/CarCard';
import { FLEET_STOCK as STATIC_FLEET_STOCK } from '../constants';
import { fleetService } from '../services/fleetService';
import { Car } from '../types';
import { Shield, Clock, CreditCard, Award, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const HomePage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      const isPlaceholder = import.meta.env.VITE_SUPABASE_URL === undefined || 
                           import.meta.env.VITE_SUPABASE_URL === '' ||
                           !import.meta.env.VITE_SUPABASE_URL.startsWith('http');

      if (isPlaceholder) {
        setCars(STATIC_FLEET_STOCK);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fleetService.getFeaturedCars();
        if (data && data.length > 0) {
          setCars(data);
        } else if (data && data.length === 0) {
          setCars(STATIC_FLEET_STOCK);
        } else {
          setCars(STATIC_FLEET_STOCK);
        }
      } catch (err: any) {
        console.error('Supabase fetch failed:', err);
        setError('Showing available premium fleet.');
        setCars(STATIC_FLEET_STOCK);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  return (
    <main>
      <Hero />
      <WavyTransition />
      <CategorySection />

      {/* Featured Cars Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div className="space-y-4">
              <p className="text-[#D4AF37] text-sm uppercase tracking-[0.3em] font-bold">Exclusive Selection</p>
              <h2 className="text-4xl md:text-5xl font-serif text-black">Our Featured Fleet</h2>
            </div>
            <button className="text-[#D4AF37] border-b border-[#D4AF37]/30 pb-1 hover:border-[#D4AF37] transition-all uppercase tracking-widest text-xs font-bold">
              View All Vehicles
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
                <p className="text-zinc-500 font-medium">Loading premium fleet...</p>
              </div>
            ) : (
              cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))
            )}
          </div>
          {error && (
            <div className="mt-8 text-center">
              <p className="text-amber-600 text-sm font-medium bg-amber-50 py-2 px-4 rounded-full inline-block border border-amber-100">
                {error}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 bg-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4AF37]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <p className="text-[#D4AF37] text-sm uppercase tracking-[0.3em] font-bold">The Crown Standard</p>
            <h2 className="text-4xl md:text-5xl font-serif text-white">Why Rent With Us?</h2>
            <p className="text-white/50 text-lg font-light">
              We don't just rent cars; we provide an unparalleled luxury experience tailored to your lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              {
                icon: Shield,
                title: 'Fully Insured',
                desc: 'Comprehensive insurance coverage for total peace of mind on every journey.'
              },
              {
                icon: Clock,
                title: '24/7 Support',
                desc: 'Our dedicated concierge team is available around the clock to assist you.'
              },
              {
                icon: CreditCard,
                title: 'Flexible Payment',
                desc: 'Multiple payment options including crypto and international credit cards.'
              },
              {
                icon: Award,
                title: 'Best Price',
                desc: 'Premium quality at competitive rates with no hidden charges.'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto group hover:border-[#D4AF37]/50 transition-all">
                  <item.icon className="text-[#D4AF37] transition-transform group-hover:scale-110" size={32} />
                </div>
                <h3 className="text-xl font-serif text-white">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[3rem] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920" 
              alt="Luxury Car" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative z-10 px-8 py-20 md:p-24 text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-serif text-white max-w-4xl mx-auto leading-tight">
                Ready to Experience <span className="text-[#D4AF37]">Pure Luxury</span>?
              </h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto font-light">
                Book your dream car today and enjoy exclusive benefits and 24/7 VIP support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button 
                  onClick={() => {
                    const event = new CustomEvent('open_chatbot', { 
                      detail: { 
                        message: "I am ready to experience pure luxury and want to book a car!" 
                      } 
                    });
                    window.dispatchEvent(event);
                  }}
                  className="px-10 py-4 bg-[#D4AF37] text-black font-bold rounded-full hover:bg-[#B8962E] transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                  Book Now
                </button>
                <button className="px-10 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-full hover:bg-white/20 transition-all active:scale-95 text-sm uppercase tracking-widest">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

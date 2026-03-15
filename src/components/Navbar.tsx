import React from 'react';
import { Menu, X, Phone, User } from 'lucide-react';
import { motion } from 'motion/react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          <div className="flex items-center gap-3">
            <img 
              src="https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/general/crescent-mobility-logo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJnZW5lcmFsL2NyZXNjZW50LW1vYmlsaXR5LWxvZ28uanBlZyIsImlhdCI6MTc3MzU1NDQ0NywiZXhwIjoxODA1MDkwNDQ3fQ.TuloT-1wrOmUdTGNA3WTD6xQF0EnExe_ItYvutqB4lc" 
              alt="Crescent Mobility Logo" 
              className="h-24 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback if logo is not found
                e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png';
                e.currentTarget.className = 'h-12 w-12 invert';
              }}
            />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white/80 hover:text-[#D4AF37] transition-colors text-sm uppercase tracking-wider">Rent a Car</a>
            <a href="#" className="text-white/80 hover:text-[#D4AF37] transition-colors text-sm uppercase tracking-wider">Luxury Fleet</a>
            <a href="#" className="text-white/80 hover:text-[#D4AF37] transition-colors text-sm uppercase tracking-wider">Offers</a>
            <a href="#" className="text-white/80 hover:text-[#D4AF37] transition-colors text-sm uppercase tracking-wider">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="tel:+9710000000" className="hidden sm:flex items-center gap-2 text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-full hover:bg-[#D4AF37] hover:text-black transition-all">
              <Phone size={16} />
              <span className="text-sm font-medium">+971 50 123 4567</span>
            </a>
            <button className="text-white p-2 md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-black border-b border-white/10 px-4 py-6 space-y-4"
        >
          <a href="#" className="block text-white text-lg uppercase tracking-wider">Rent a Car</a>
          <a href="#" className="block text-white text-lg uppercase tracking-wider">Luxury Fleet</a>
          <a href="#" className="block text-white text-lg uppercase tracking-wider">Offers</a>
          <a href="#" className="block text-white text-lg uppercase tracking-wider">Contact</a>
          <div className="pt-4 border-t border-white/10">
            <a href="tel:+9710000000" className="flex items-center gap-2 text-[#D4AF37]">
              <Phone size={18} />
              <span>+971 50 123 4567</span>
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

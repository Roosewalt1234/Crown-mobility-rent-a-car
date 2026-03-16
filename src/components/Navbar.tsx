import React from 'react';
import { Menu, X, Phone, User, LogIn, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/general/crescent-mobility-logo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJnZW5lcmFsL2NyZXNjZW50LW1vYmlsaXR5LWxvZ28uanBlZyIsImlhdCI6MTc3MzU1NDQ0NywiZXhwIjoxODA1MDkwNDQ3fQ.TuloT-1wrOmUdTGNA3WTD6xQF0EnExe_ItYvutqB4lc" 
              alt="Crescent Mobility Logo" 
              className="h-24 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png';
                e.currentTarget.className = 'h-12 w-12 invert';
              }}
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white/80 hover:text-[#D4AF37] transition-colors text-sm uppercase tracking-wider">Rent a Car</Link>
            <Link to="/" className="text-white/80 hover:text-[#D4AF37] transition-colors text-sm uppercase tracking-wider">Luxury Fleet</Link>
            <Link to="/" className="text-white/80 hover:text-[#D4AF37] transition-colors text-sm uppercase tracking-wider">Offers</Link>
            <Link to="/" className="text-white/80 hover:text-[#D4AF37] transition-colors text-sm uppercase tracking-wider">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 mr-4 border-r border-white/10 pr-6">
              {user ? (
                <Link to="/app/dashboard" className="bg-[#D4AF37] hover:bg-[#B8962E] text-black px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/auth" className="text-white/70 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <LogIn size={14} />
                    Sign In
                  </Link>
                  <Link to="/auth" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
            <a href="tel:+971507172790" className="hidden sm:flex items-center gap-2 text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-full hover:bg-[#D4AF37] hover:text-black transition-all">
              <Phone size={16} />
              <span className="text-sm font-medium">+971 50 717 2790</span>
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
          <Link to="/" className="block text-white text-lg uppercase tracking-wider" onClick={() => setIsOpen(false)}>Rent a Car</Link>
          <Link to="/" className="block text-white text-lg uppercase tracking-wider" onClick={() => setIsOpen(false)}>Luxury Fleet</Link>
          <Link to="/" className="block text-white text-lg uppercase tracking-wider" onClick={() => setIsOpen(false)}>Offers</Link>
          <Link to="/" className="block text-white text-lg uppercase tracking-wider" onClick={() => setIsOpen(false)}>Contact</Link>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
            {user ? (
              <Link to="/app/dashboard" className="text-[#D4AF37] text-lg uppercase tracking-wider flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            ) : (
              <Link to="/auth" className="text-[#D4AF37] text-lg uppercase tracking-wider flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <LogIn size={18} />
                Sign In
              </Link>
            )}
            <a href="tel:+971507172790" className="flex items-center gap-2 text-[#D4AF37]">
              <Phone size={18} />
              <span>+971 50 717 2790</span>
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

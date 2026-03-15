import React from 'react';
import { Instagram, Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/general/crescent-mobility-logo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJnZW5lcmFsL2NyZXNjZW50LW1vYmlsaXR5LWxvZ28uanBlZyIsImlhdCI6MTc3MzU1NDQ0NywiZXhwIjoxODA1MDkwNDQ3fQ.TuloT-1wrOmUdTGNA3WTD6xQF0EnExe_ItYvutqB4lc" 
                alt="Crescent Mobility Logo" 
                className="h-20 w-auto object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png';
                  e.currentTarget.className = 'h-12 w-12 invert';
                }}
              />
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Redefining luxury mobility in the UAE. We provide an exclusive fleet of the world's most prestigious vehicles for the discerning traveler.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-serif text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['Luxury Fleet', 'Sports Cars', 'SUV Collection', 'Monthly Rentals', 'Chauffeur Service'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/40 hover:text-[#D4AF37] text-sm transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-serif text-lg mb-6">Information</h4>
            <ul className="space-y-4">
              {['About Us', 'Rental Terms', 'Privacy Policy', 'Cookie Policy', 'Contact Us'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/40 hover:text-[#D4AF37] text-sm transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-serif text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D4AF37] shrink-0" />
                <span className="text-white/40 text-sm">Sheikh Zayed Road, Business Bay, Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#D4AF37] shrink-0" />
                <span className="text-white/40 text-sm">+971 50 717 2790</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#D4AF37] shrink-0" />
                <span className="text-white/40 text-sm">info@crescentmobility.ae</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-[10px] uppercase tracking-widest">
            © 2026 Crescent Mobility Rent A Car. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-20 grayscale" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 opacity-20 grayscale" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-20 grayscale" />
          </div>
        </div>
      </div>
    </footer>
  );
};

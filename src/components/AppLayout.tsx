import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  ChevronRight,
  Shield,
  Car
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const LOGO_URL = "https://dzgyxvsewaxnztglnkrh.supabase.co/storage/v1/object/sign/general/crescent-mobility-logo.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ZGFiZDU3Ny0wYTAyLTQyZjktYjcwMy01ZmQ0ZWYyN2U1YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJnZW5lcmFsL2NyZXNjZW50LW1vYmlsaXR5LWxvZ28uanBlZyIsImlhdCI6MTc3MzU1NDQ0NywiZXhwIjoxODA1MDkwNDQ3fQ.TuloT-1wrOmUdTGNA3WTD6xQF0EnExe_ItYvutqB4lc";

export const AppLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Chats', path: '/app/chats', icon: MessageSquare },
    { name: 'Manage Vehicles', path: '/app/vehicles', icon: Car },
    { name: 'Knowledge Base', path: '/app/knowledge-base', icon: BookOpen },
    { name: 'Settings', path: '/app/settings', icon: Settings },
    { name: 'Admin', path: '/app/admin', icon: Shield },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#080c14] text-white border-r border-white/5">
        <div className="p-6">
          <Link to="/app/dashboard" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Crescent Mobility" className="h-10 w-auto object-contain" />
            <span className="font-bold text-lg tracking-tight">WA Monitor</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[#1a2c1a] text-[#2e7d32] font-semibold' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#2e7d32]' : 'group-hover:text-white'} />
                <span>{link.name}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#2e7d32] flex items-center justify-center text-white font-bold text-xs">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.email}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-[#080c14] text-white border-b border-white/5">
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Crescent Mobility" className="h-8 w-auto object-contain" />
            <span className="font-bold text-lg">WA Monitor</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="fixed inset-0 z-50 md:hidden bg-[#080c14] flex flex-col"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
                <img src={LOGO_URL} alt="Crescent Mobility" className="h-8 w-auto object-contain" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white">
                  <X />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg ${
                        isActive ? 'bg-[#1a2c1a] text-[#2e7d32]' : 'text-white/70'
                      }`}
                    >
                      <Icon size={24} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-6 border-t border-white/5">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl text-red-400 bg-red-400/10"
                >
                  <LogOut size={24} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Home, BookOpen, Users, Calendar, Trophy, Bell, LogOut, Menu, X 
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/skills', label: 'Skills', icon: BookOpen },
    { path: '/browse', label: 'Browse', icon: Users },
    { path: '/sessions', label: 'Sessions', icon: Calendar },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img 
              src="/logo.jpeg" 
              alt="SkillSwap" 
              className="w-9 h-9 rounded-xl object-cover"
            />
            <span className="font-sans font-medium text-lg gradient-text">SkillSwap</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
<Link
                 key={item.path}
                 to={item.path}
                 className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                   isActive(item.path)
                     ? 'text-black'
                     : 'text-gray-400 hover:text-white'
                 }`}
                 style={isActive(item.path) ? { 
                   background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)',
                   boxShadow: '0 4px 20px rgba(62, 207, 142, 0.3)'
                 } : {}}
               >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: '#b4b4b4' }}
            >
              <Bell size={20} />
            </Link>

            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.full_name}</p>
                <p className="text-xs capitalize" style={{ color: '#898989' }}>{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#898989' }}
              >
                <LogOut size={18} />
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
            style={{ background: '#0f0f0f', borderTop: '1px solid #242424' }}
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'text-black'
                      : 'text-secondary'
                  }`}
                  style={isActive(item.path) ? { background: 'rgba(62, 207, 142, 0.2)', color: '#3ecf8e' } : {}}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg"
                style={{ color: '#898989' }}
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

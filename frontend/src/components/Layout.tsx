import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, BookOpen, Users, Calendar, Trophy, Bell, LogOut, Menu, X, 
  Send, Star, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/skills', label: 'My Skills', icon: BookOpen },
    { path: '/browse', label: 'Find Mentors', icon: Users },
    { path: '/sessions', label: 'Sessions', icon: Calendar },
    { path: '/requests', label: 'Requests', icon: Send, roles: ['faculty'] },
    { path: '/favorites', label: 'Favorites', icon: Star, roles: ['student'] },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0f0f0f' }}>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-20 left-4 z-40 p-2 rounded-xl transition-all duration-300 hover:scale-105"
        style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Menu size={22} style={{ color: '#b4b4b4' }} />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          x: mobileOpen ? 0 : -320,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 bottom-0 z-50 flex flex-col w-72"
        style={{ 
          background: 'linear-gradient(180deg, #0a0a0a 0%, #050505 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <img 
              src="/logo.jpeg" 
              alt="SkillSwap" 
              className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
            />
            <span className="font-sans font-bold text-xl gradient-text">
              SkillSwap
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: '#898989' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-4 overflow-y-auto px-3">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                  isActive(item.path) ? 'text-black' : 'text-gray-400 hover:text-white'
                }`}
                style={isActive(item.path) ? { 
                  background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)',
                  boxShadow: '0 4px 24px rgba(62, 207, 142, 0.35)'
                } : { 
                  background: 'transparent',
                }}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="px-4 text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#555' }}>
              Account
            </p>
            <div className="space-y-1">
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-all duration-300"
                style={{ background: 'transparent' }}
              >
                <User size={20} />
                <span>My Profile</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="glass-card p-5 mb-3">
            <div className="flex items-center gap-3">
              <Avatar user={user!} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name}</p>
                <p className="text-xs capitalize" style={{ color: '#898989' }}>{user?.role}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-red-500/10"
            style={{ color: '#ff4060' }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 transition-all duration-300 md:ml-72">
        <nav className="fixed top-0 right-0 z-40 h-16 flex items-center justify-end px-6" style={{ 
          background: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          left: 0
        }}>
          <div className="flex items-center gap-4">
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#b4b4b4' }}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#3ecf8e' }} />
            </Link>
            
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105">
              <Avatar user={user!} size="sm" />
              <span className="text-sm font-medium hidden sm:block">{user?.full_name?.split(' ')[0]}</span>
            </div>
          </div>
        </nav>

        <main className="pt-20 pb-10 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
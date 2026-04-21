import { Link } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" 
          style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#0a0a0f' }}>
          SS
        </div>
        <span className="font-medium hidden sm:block">SkillSwap</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/notifications" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Bell size={20} />
        </Link>
        
        <Link to="/profile" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" 
            style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#0a0a0f' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
        </Link>

        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu size={20} />
        </button>
      </div>
    </nav>
  );
}
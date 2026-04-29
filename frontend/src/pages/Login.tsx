import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[rgba(62,207,142,0.03)] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="glass-card p-10 rounded-3xl">
          <div className="text-center mb-10">
            <img 
              src="/logo.jpeg" 
              alt="SkillSwap" 
              className="w-12 h-12 rounded-2xl mx-auto mb-5 object-cover"
            />
            <h1 className="text-4xl font-normal mb-3 gradient-text" style={{ letterSpacing: '-0.02em' }}>Welcome back</h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@university.edu"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-button w-full disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          </form>

        <p className="text-center mt-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-medium gradient-text">
            Register here
          </Link>
        </p>
        </div>
      </motion.div>
    </div>
  );
}

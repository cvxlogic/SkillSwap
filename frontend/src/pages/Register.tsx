import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { skillApi } from '../services/api';
import type { Skill } from '../types';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [skillType, setSkillType] = useState<'HAVE' | 'WANT'>('WANT');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillApi.getAll();
      setSkills(response.data.data.skills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(formData);
      
      if (selectedSkill) {
        try {
          await skillApi.addMySkill({
            skillId: selectedSkill,
            type: skillType,
          });
        } catch (skillError) {
          console.error('Failed to add skill:', skillError);
        }
      }
      
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative"
      >
        <div className="glass-card p-10 rounded-3xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)' }}>
              <span className="text-black font-bold text-xl">SS</span>
            </div>
            <h1 className="text-4xl font-normal mb-3 gradient-text" style={{ letterSpacing: '-0.02em' }}>Join SkillSwap</h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Create your account and start learning</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="john@student.edu"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Min 8 characters"
              required
            />
          </div>

          <div>
            <label className="label">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="EXCHANGER">Exchanger</option>
            </select>
          </div>

          <div>
            <label className="label">I want to</label>
            <select
              value={skillType}
              onChange={(e) => setSkillType(e.target.value as 'HAVE' | 'WANT')}
              className="input-field"
            >
              <option value="WANT">Learn</option>
              <option value="HAVE">Teach</option>
            </select>
          </div>

          <div>
            <label className="label">Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="input-field"
            >
              <option value="">Select a skill...</option>
              {skills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} ({skill.category})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-button w-full disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium gradient-text">
            Sign in
          </Link>
        </p>
        </div>
      </motion.div>
    </div>
  );
}
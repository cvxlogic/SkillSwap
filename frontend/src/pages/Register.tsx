import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { skillsApi } from '../services/api';
import { Skill, SkillCategory } from '../types';

export default function Register() {
  const [formData, setFormData] = useState({
    roll_number: '',
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
  });
  const [learningSkill, setLearningSkill] = useState('');
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkillsData();
  }, []);

  const fetchSkillsData = async () => {
    try {
      const [catsRes, skillsRes] = await Promise.all([
        skillsApi.getCategories(),
        skillsApi.getAll(),
      ]);
      setCategories(catsRes.data.data);
      setSkills(skillsRes.data.data);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const filteredSkills = selectedCategory
    ? skills.filter((s) => s.categoryId === selectedCategory)
    : skills;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userData = { ...formData };
      await register(userData);
      
      if (learningSkill && formData.role === 'student') {
        try {
          await skillsApi.addLearningGoal({
            skill_id: learningSkill,
            priority: 'high',
          });
        } catch (goalError) {
          console.error('Failed to add learning goal:', goalError);
        }
      }
      
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Registration failed';
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
            <img 
              src="/logo.jpeg" 
              alt="SkillSwap" 
              className="w-14 h-14 rounded-2xl mx-auto mb-5 object-cover"
            />
            <h1 className="text-4xl font-normal mb-3 gradient-text" style={{ letterSpacing: '-0.02em' }}>Join SkillSwap</h1>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Create your account and start learning</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Roll Number</label>
              <input
                type="text"
                name="roll_number"
                value={formData.roll_number}
                onChange={handleChange}
                className="input-field"
                placeholder="MCA2024001"
                required
              />
            </div>
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>
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
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div>
              <label className="label">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field"
                placeholder="MCA"
              />
            </div>
          </div>

          {formData.role === 'student' && (
            <div className="p-5 rounded-xl" style={{ 
              background: 'linear-gradient(135deg, rgba(120, 64, 255, 0.08) 0%, rgba(62, 207, 142, 0.05) 100%)',
              border: '1px solid rgba(120, 64, 255, 0.15)'
            }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <label className="label mb-0">I want to learn</label>
              </div>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Select a skill you're interested in learning - we'll help you find mentors!
              </p>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setLearningSkill('');
                  }}
                  className="input-field text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={learningSkill}
                  onChange={(e) => setLearningSkill(e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Pick a skill...</option>
                  {filteredSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, BookOpen, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { skillsApi } from '../services/api';
import toast from 'react-hot-toast';
import { Skill, SkillCategory, UserSkill } from '../types';

const proficiencyLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

export default function MySkills() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    skillId: '',
    proficiency_level: 'intermediate',
    years_of_experience: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skillsRes, allSkillsRes, categoriesRes] = await Promise.all([
        skillsApi.getUserSkills(user!.user_id as string),
        skillsApi.getAll(),
        skillsApi.getCategories(),
      ]);
      setSkills(skillsRes.data.data);
      setAllSkills(allSkillsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await skillsApi.addSkill({
        skillId: formData.skillId,
        proficiency_level: formData.proficiency_level,
        years_of_experience: Number(formData.years_of_experience),
      });
      toast.success('Skill added successfully!');
      setModalOpen(false);
      setFormData({ skillId: '', proficiency_level: 'intermediate', years_of_experience: 1 });
      fetchData();
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to add skill';
      toast.error(message);
    }
  };

  const handleDelete = async (userSkillId: string) => {
    try {
      await skillsApi.deleteSkill(userSkillId as string);
      toast.success('Skill removed');
      fetchData();
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to remove skill';
      toast.error(message);
    }
  };

  const filteredSkills = selectedCategory
    ? allSkills.filter((s) => s.categoryId === selectedCategory)
    : allSkills;

  const availableSkills = filteredSkills.filter(
    (skill) => !skills.some((s) => s.skillId === skill.id)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Dashboard</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-normal mb-2 gradient-text" style={{ letterSpacing: '-0.02em' }}>My Skills</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Showcase your expertise to help others learn.</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="pill-btn pill-btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Skill
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(62,207,142,0.3)', borderTopColor: '#3ecf8e' }} />
          </div>
        ) : skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((userSkill) => (
              <motion.div
                key={userSkill.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(62, 207, 142, 0.15) 0%, rgba(62, 207, 142, 0.05) 100%)' }}>
                      <BookOpen size={20} style={{ color: '#3ecf8e' }} />
                    </div>
                    <div>
                      <h3 className="font-medium">{userSkill.skill.name}</h3>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{userSkill.skill.category?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(userSkill.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: '#898989' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 rounded-full capitalize" style={{ background: '#0f0f0f' }}>
                    {userSkill.proficiency_level}
                  </span>
                  <span style={{ color: '#898989' }}>
                    {userSkill.years_of_experience} year{userSkill.years_of_experience !== 1 ? 's' : ''} exp
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card p-5 text-center py-16">
            <BookOpen size={48} className="mx-auto mb-4" style={{ color: '#4d4d4d' }} />
            <h3 className="text-xl font-normal mb-2">No skills added yet</h3>
            <p style={{ color: '#898989' }}>Add your skills to start teaching others.</p>
            <button onClick={() => setModalOpen(true)} className="pill-btn pill-btn-primary mt-4">
              Add Your First Skill
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Skill">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Skill</label>
            <select
              value={formData.skillId}
              onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select a skill</option>
              {availableSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Proficiency Level</label>
            <select
              value={formData.proficiency_level}
              onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })}
              className="input-field"
            >
              {proficiencyLevels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Years of Experience</label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.years_of_experience}
              onChange={(e) => setFormData({ ...formData, years_of_experience: Number(e.target.value) })}
              className="input-field"
            />
          </div>

          <button type="submit" className="pill-btn pill-btn-primary w-full mt-6">
            Add Skill
          </button>
        </form>
      </Modal>
    </Layout>
  );
}

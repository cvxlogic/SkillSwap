import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, BookOpen } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { skillsApi, sessionsApi } from '../services/api';
import toast from 'react-hot-toast';
import { UserSkill } from '../types';

export default function BookSession() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const [mentorSkills, setMentorSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<UserSkill | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
  });

  useEffect(() => {
    fetchData();
  }, [mentorId]);

  const fetchData = async () => {
    try {
      const skillsRes = await skillsApi.getUserSkills(mentorId as string);
      setMentorSkills(skillsRes.data.data);
    } catch (error) {
      toast.error('Failed to load mentor data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) return;

    try {
      const scheduledDate = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      await sessionsApi.create({
        mentor_id: mentorId as string,
        skillId: selectedSkill.skillId,
        title: formData.title,
        description: formData.description,
        scheduled_date: scheduledDate.toISOString(),
      });
      toast.success('Session request sent!');
      setModalOpen(false);
      setFormData({ title: '', description: '', scheduled_date: '', scheduled_time: '' });
      setTimeout(() => window.location.href = '/sessions', 1500);
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to book session';
      toast.error(message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <Link to="/browse" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Browse</span>
          </Link>
          <h1 className="text-4xl font-normal mb-2 gradient-text" style={{ letterSpacing: '-0.02em' }}>Book a Session</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Select a skill and schedule your learning session.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(62,207,142,0.3)', borderTopColor: '#3ecf8e' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentorSkills.map((us) => (
              <motion.div
                key={us.id}
                whileHover={{ scale: 1.02, borderColor: 'rgba(62, 207, 142, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                className="elevated-card cursor-pointer p-5"
                onClick={() => {
                  setSelectedSkill(us);
                  setFormData({ ...formData, title: `${us.skill.name} Session` });
                  setModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(62, 207, 142, 0.15)' }}>
                    <BookOpen size={22} style={{ color: '#3ecf8e' }} />
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs capitalize" style={{ 
                    background: 'rgba(120, 64, 255, 0.15)', 
                    color: '#7840ff',
                    border: '1px solid rgba(120, 64, 255, 0.3)'
                  }}>
                    {us.proficiency_level}
                  </span>
                </div>
                
                <h3 className="font-normal text-lg mb-1" style={{ letterSpacing: '-0.02em' }}>{us.skill.name}</h3>
                <p className="text-sm mb-3" style={{ color: '#555' }}>{us.skill.category?.name}</p>
                
                <div className="flex items-center gap-3 text-sm" style={{ color: '#555' }}>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{us.years_of_experience} years</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedSkill ? `Book: ${selectedSkill.skill.name}` : 'Book Session'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Session Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              placeholder="e.g., Introduction to Python"
              required
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              placeholder="What would you like to learn?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <Calendar size={14} />
                Date
              </label>
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Clock size={14} />
                Time
              </label>
              <input
                type="time"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <button type="submit" className="pill-btn pill-btn-primary w-full mt-6 flex items-center justify-center gap-2">
            <Calendar size={18} />
            Request Session
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
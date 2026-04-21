import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { skillApi, requestApi, userApi } from '../services/api';
import toast from 'react-hot-toast';
import type { User, UserSkill } from '../types';

export default function BookSession() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<User | null>(null);
  const [mentorSkills, setMentorSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<UserSkill | null>(null);
  const [formData, setFormData] = useState({
    message: '',
    type: 'LEARN' as 'LEARN' | 'EXCHANGE' | 'PAID',
  });

  useEffect(() => {
    fetchData();
  }, [mentorId]);

  const fetchData = async () => {
    try {
      const [mentorRes, skillsRes] = await Promise.all([
        userApi.getById(mentorId as string),
        skillApi.getMySkills(),
      ]);
      setMentor(mentorRes.data.data);
      
      // Filter to show skills the user can teach (HAVE)
      const allSkills = skillsRes.data.data || [];
      const haveSkills = allSkills.filter((s: UserSkill) => s.type === 'HAVE');
      setMentorSkills(haveSkills);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill || !mentorId) return;

    try {
      await requestApi.create({
        receiverId: mentorId,
        offeredSkill: '', // Will be filled by receiver
        wantedSkill: selectedSkill.skillId,
        type: formData.type,
        message: formData.message,
      });
      toast.success('Request sent!');
      setModalOpen(false);
      setTimeout(() => navigate('/requests'), 1500);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to send request';
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
          {mentor && (
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>with {mentor.name}</p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(62,207,142,0.3)', borderTopColor: '#3ecf8e' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentorSkills.map((us) => (
              <div
                key={us.id}
                className="elevated-card cursor-pointer p-5"
                onClick={() => {
                  setSelectedSkill(us);
                  setModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(62, 207, 142, 0.15)' }}>
                    <BookOpen size={22} style={{ color: '#3ecf8e' }} />
                  </div>
                  {us.isPaid && us.price && (
                    <span className="px-2 py-1 rounded-full text-xs" style={{ 
                      background: 'rgba(120, 64, 255, 0.15)', 
                      color: '#7840ff',
                      border: '1px solid rgba(120, 64, 255, 0.3)'
                    }}>
                      ₹{us.price}
                    </span>
                  )}
                </div>
                
                <h3 className="font-normal text-lg mb-1" style={{ letterSpacing: '-0.02em' }}>{us.skill.name}</h3>
                <p className="text-sm mb-3" style={{ color: '#555' }}>{us.skill.category}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedSkill ? `Request: ${selectedSkill.skill.name}` : 'Book Session'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Request Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="input-field"
            >
              <option value="LEARN">Learn (Free)</option>
              <option value="EXCHANGE">Skill Exchange</option>
              <option value="PAID">Paid Class</option>
            </select>
          </div>

          <div>
            <label className="label">Message (optional)</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="input-field min-h-[80px] resize-none"
              placeholder="Introduce yourself..."
            />
          </div>

          <button type="submit" className="pill-btn pill-btn-primary w-full mt-6 flex items-center justify-center gap-2">
            Send Request
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
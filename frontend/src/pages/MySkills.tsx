import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { skillApi } from '../services/api';
import type { UserSkill } from '../types';

export default function MySkills() {
  const [haveSkills, setHaveSkills] = useState<UserSkill[]>([]);
  const [wantSkills, setWantSkills] = useState<UserSkill[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [tab, setTab] = useState<'HAVE' | 'WANT'>('HAVE');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [haveRes, wantRes, skillsRes] = await Promise.all([
        skillApi.getMySkills('HAVE'),
        skillApi.getMySkills('WANT'),
        skillApi.getAll(),
      ]);
      setHaveSkills(haveRes.data.data || []);
      setWantSkills(wantRes.data.data || []);
      setAllSkills(skillsRes.data.data.skills || []);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill) return;
    try {
      await skillApi.addMySkill({
        skillId: selectedSkill,
        type: tab,
      });
      setShowAdd(false);
      setSelectedSkill('');
      await fetchData();
    } catch (error) {
      console.error('Failed to add skill:', error);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await skillApi.removeMySkill(skillId);
      await fetchData();
    } catch (error) {
      console.error('Failed to remove skill:', error);
    }
  };

  const skills = tab === 'HAVE' ? haveSkills : wantSkills;

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-normal gradient-text">My Skills</h1>
          <button onClick={() => setShowAdd(true)} className="glow-button">
            Add Skill
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('HAVE')}
            className={`px-6 py-2 rounded-full ${tab === 'HAVE' ? 'glow-button' : 'pill-btn-secondary'}`}
          >
            I Have ({haveSkills.length})
          </button>
          <button
            onClick={() => setTab('WANT')}
            className={`px-6 py-2 rounded-full ${tab === 'WANT' ? 'glow-button' : 'pill-btn-secondary'}`}
          >
            I Want ({wantSkills.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin border-[#3ecf8e] border-t-transparent" />
          </div>
        ) : skills.length === 0 ? (
          <div className="empty-state glass-card">
            <p>No {tab === 'HAVE' ? 'skills to teach' : 'skills to learn'} added</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {skills.map((us: UserSkill) => (
              <div key={us.id} className="glass-card p-5 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{us.skill?.name}</h3>
                    <p className="text-sm text-white/50">{us.skill?.category}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(us.skillId)}
                    className="text-red-400 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAdd && (
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="glass-card p-8 rounded-3xl max-w-md w-full">
              <h2 className="text-xl mb-6">Add {tab === 'HAVE' ? 'Skill to Teach' : 'Skill to Learn'}</h2>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="input-field mb-4"
              >
                <option value="">Select skill...</option>
                {allSkills.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button onClick={handleAddSkill} className="glow-button flex-1">
                  Add
                </button>
                <button onClick={() => setShowAdd(false)} className="pill-btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
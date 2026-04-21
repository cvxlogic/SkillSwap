import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { skillApi } from '../services/api';
import type { UserSkill } from '../types';

export default function Profile() {
  const { user } = useAuth();
  const [mySkills, setMySkills] = useState<UserSkill[]>([]);

  useEffect(() => {
    fetchMySkills();
  }, []);

  const fetchMySkills = async () => {
    try {
      const response = await skillApi.getMySkills();
      setMySkills(response.data.data || []);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="glass-card p-8 rounded-3xl mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#0a0a0f' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-3xl gradient-text">{user?.name}</h1>
              <p className="text-white/60">{user?.email}</p>
              <span className="inline-block mt-2 px-4 py-1 rounded-full text-sm" style={{ background: 'rgba(62, 207, 142, 0.2)', color: '#3ecf8e' }}>
                {user?.role}
              </span>
            </div>
          </div>
          
          {user?.bio && (
            <p className="mt-6 text-white/80">{user.bio}</p>
          )}
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h2 className="text-xl mb-6">My Skills</h2>
          
          {mySkills.length === 0 ? (
            <p className="text-white/50">No skills added yet</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {mySkills.map((us) => (
                <span
                  key={us.id}
                  className="px-4 py-2 rounded-full text-sm"
                  style={{
                    background: us.type === 'HAVE' ? 'rgba(62, 207, 142, 0.2)' : 'rgba(120, 64, 255, 0.2)',
                    color: us.type === 'HAVE' ? '#3ecf8e' : '#7840ff',
                    border: `1px solid ${us.type === 'HAVE' ? 'rgba(62, 207, 142, 0.3)' : 'rgba(120, 64, 255, 0.3)'}`
                  }}
                >
                  {us.skill?.name} ({us.type})
                  {us.isPaid && us.price && ` - ₹${us.price}`}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
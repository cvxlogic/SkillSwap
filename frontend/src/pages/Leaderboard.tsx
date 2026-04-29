import { motion } from 'framer-motion';
import { Trophy, Star, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import { reviewsApi } from '../services/api';
import toast from 'react-hot-toast';
import { TopMentor } from '../types';
import { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [mentors, setMentors] = useState<TopMentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await reviewsApi.getLeaderboard();
      setMentors(res.data.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-normal flex items-center gap-3 mb-2 gradient-text" style={{ letterSpacing: '-0.02em' }}>
            <Trophy className="gradient-text" />
            Top Mentors
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>The best educators based on ratings and sessions.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(62,207,142,0.3)', borderTopColor: '#3ecf8e' }} />
          </div>
        ) : mentors.length > 0 ? (
          <div className="space-y-4">
            {mentors.map((mentor, index) => (
              <motion.div
                key={mentor.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-5"
                style={index < 3 ? { 
                  borderColor: 'rgba(62, 207, 142, 0.3)',
                  boxShadow: index === 0 ? '0 0 40px rgba(62, 207, 142, 0.1)' : undefined
                } : {}}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center text-2xl font-normal">
                    {getRankIcon(index)}
                  </div>
                  
                  <Avatar user={mentor} size="md" />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-normal text-lg" style={{ letterSpacing: '-0.02em' }}>{mentor.full_name}</h3>
                    <p className="text-sm" style={{ color: '#898989' }}>{mentor.department || 'Faculty'}</p>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1" style={{ color: '#3ecf8e' }}>
                        <Star size={16} fill="#3ecf8e" />
                        <span className="font-medium">
                          {mentor.avg_rating ? Number(mentor.avg_rating).toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#898989' }}>Rating</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1" style={{ color: '#b4b4b4' }}>
                        <Calendar size={16} />
                        <span className="font-medium">{mentor.completed_sessions}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#898989' }}>Sessions</p>
                    </div>
                  </div>

                  <a
                    href={`/sessions/book/${mentor.user_id}`}
                    className="pill-btn pill-btn-primary text-sm"
                  >
                    Book
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card p-5 text-center py-16">
            <Trophy size={48} className="mx-auto mb-4" style={{ color: '#4d4d4d' }} />
            <h3 className="text-xl font-normal mb-2">No mentors yet</h3>
            <p style={{ color: '#898989' }}>The leaderboard will appear once mentors have sessions.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

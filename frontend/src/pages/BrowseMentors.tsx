import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import type { User } from '../types';

export default function BrowseMentors() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await userApi.search({ role: 'TEACHER' });
      setMentors(response.data.data.users || []);
    } catch (error) {
      console.error('Failed to load mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-normal mb-8 gradient-text">Browse Mentors</h1>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin border-[#3ecf8e] border-t-transparent" />
          </div>
        ) : mentors.length === 0 ? (
          <div className="empty-state glass-card">
            <p>No mentors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <div 
                key={mentor.id} 
                className="glass-card p-5 rounded-xl cursor-pointer"
                onClick={() => navigate(`/profile/${mentor.id}`)}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto" 
                  style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#000' }}>
                  {mentor.name?.charAt(0) || '?'}
                </div>
                <h3 className="font-medium text-center">{mentor.name}</h3>
                <p className="text-sm text-white/50 text-center">{mentor.role}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
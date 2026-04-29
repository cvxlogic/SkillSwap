import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import MentorCard from '../components/MentorCard';
import { skillsApi } from '../services/api';
import toast from 'react-hot-toast';
import { User, UserSkill } from '../types';

interface FavoriteMentor extends User {
  user_skills?: UserSkill[];
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteMentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('favorites');
      const favIds = stored ? JSON.parse(stored) : [];
      
      const allMentors: FavoriteMentor[] = [];
      for (const id of favIds) {
        try {
          const res = await skillsApi.getUserSkills(id);
          if (res.data.data.length > 0) {
            allMentors.push(res.data.data[0]);
          }
        } catch (e) {}
      }
      setFavorites(allMentors);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (mentorId: string) => {
    const stored = localStorage.getItem('favorites');
    const favIds: string[] = stored ? JSON.parse(stored) : [];
    const newFavs = favIds.filter((id: string) => id !== mentorId);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
    setFavorites(favorites.filter(f => f.user_id !== mentorId));
    toast.success('Removed from favorites');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-normal mb-2 gradient-text" style={{ letterSpacing: '-0.02em' }}>
            Favorite Mentors
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Your saved mentors for quick access.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-700" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((mentor) => (
              <div key={mentor.user_id} className="relative group">
                <MentorCard
                  mentor={mentor}
                  onSelect={() => window.location.href = `/sessions/book/${mentor.user_id}`}
                />
                <button
                  onClick={() => removeFavorite(mentor.user_id)}
                  className="absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(255, 64, 96, 0.15)', color: '#ff4060' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Star size={32} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <h3 className="text-xl font-normal mb-2">No favorites yet</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              Browse mentors and add them to your favorites for quick access!
            </p>
            <a href="/browse" className="pill-btn pill-btn-primary inline-block mt-4">
              Browse Mentors
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}
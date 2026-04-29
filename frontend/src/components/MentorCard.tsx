import { motion } from 'framer-motion';
import { Star, MapPin, BookOpen } from 'lucide-react';
import { User, UserSkill } from '../types';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

interface MentorCardProps {
  mentor: User & { user_skills?: UserSkill[] };
  onSelect?: () => void;
  showSkills?: boolean;
  showFavorite?: boolean;
}

export default function MentorCard({ mentor, onSelect, showSkills = true, showFavorite = false }: MentorCardProps) {
  const skills = mentor.user_skills?.slice(0, 3) || [];

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const stored = localStorage.getItem('favorites');
    const favs: string[] = stored ? JSON.parse(stored) : [];
    
    if (favs.includes(mentor.user_id)) {
      const newFavs = favs.filter(id => id !== mentor.user_id);
      localStorage.setItem('favorites', JSON.stringify(newFavs));
      toast.success('Removed from favorites');
    } else {
      localStorage.setItem('favorites', JSON.stringify([...favs, mentor.user_id]));
      toast.success('Added to favorites');
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, borderColor: 'rgba(62, 207, 142, 0.5)' }}
      className="elevated-card cursor-pointer p-5 relative group"
      onClick={onSelect}
    >
      {showFavorite && (
        <button
          onClick={handleFavorite}
          className="absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            color: '#b4b4b4' 
          }}
        >
          <Star size={16} fill="currentColor" />
        </button>
      )}
      
      <div className="flex items-start gap-4">
        <Avatar user={mentor} size="lg" />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-normal text-lg" style={{ letterSpacing: '-0.02em' }}>{mentor.full_name}</h3>
          
          <div className="flex items-center gap-4 mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {mentor.department && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {mentor.department}
              </span>
            )}
            {mentor.avg_rating ? (
              <span className="flex items-center gap-1 gradient-text">
                <Star size={14} fill="#3ecf8e" />
                {Number(mentor.avg_rating).toFixed(1)}
              </span>
            ) : null}
          </div>

          {showSkills && skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((us) => (
                <span
                  key={us.id}
                  className="px-3 py-1 rounded-full text-xs flex items-center gap-1"
                  style={{ 
                    background: 'rgba(62, 207, 142, 0.1)', 
                    border: '1px solid rgba(62, 207, 142, 0.2)',
                    color: '#3ecf8e'
                  }}
                >
                  <BookOpen size={10} />
                  {us.skill.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

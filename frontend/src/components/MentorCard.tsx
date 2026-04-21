import type { User } from '../types';

interface MentorCardProps {
  mentor: User & { userSkills?: any[] };
}

export default function MentorCard({ mentor }: MentorCardProps) {
  const userSkills = mentor.userSkills || [];

  return (
    <div className="glass-card p-5 rounded-xl">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0" 
          style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#0a0a0f' }}>
          {mentor.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{mentor.name}</h3>
          <p className="text-sm text-white/50 truncate">{mentor.role}</p>
          {mentor.bio && (
            <p className="text-sm text-white/70 mt-1 line-clamp-2">{mentor.bio}</p>
          )}
        </div>
      </div>

      {userSkills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50 mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {userSkills.slice(0, 4).map((us: any) => (
              <span key={us.id} className="px-2 py-1 rounded-full text-xs" 
                style={{ background: 'rgba(62, 207, 142, 0.15)', color: '#3ecf8e' }}>
                {us.skill?.name || us.skill?.name || 'Skill'}
              </span>
            ))}
          </div>
        </div>
      )}

      <button className="glow-button w-full mt-4">
        Connect
      </button>
    </div>
  );
}
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock, User, MessageSquare, RefreshCw, Star, Check, X } from 'lucide-react';
import { SkillSession } from '../types';

interface SessionCardProps {
  session: SkillSession;
  currentUserId: string;
  onAccept?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  onReview?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
}

const statusStyles = {
  pending: { bg: 'rgba(255, 120, 64, 0.15)', color: '#ff7840', border: 'rgba(255, 120, 64, 0.3)' },
  confirmed: { bg: 'rgba(62, 207, 142, 0.15)', color: '#3ecf8e', border: 'rgba(62, 207, 142, 0.3)' },
  completed: { bg: 'rgba(120, 64, 255, 0.15)', color: '#7840ff', border: 'rgba(120, 64, 255, 0.3)' },
  cancelled: { bg: 'rgba(255, 64, 96, 0.15)', color: '#ff4060', border: 'rgba(255, 64, 96, 0.3)' },
};

const actionButtonStyles = {
  accept: { bg: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#0a0a0f', hover: 'hover:shadow-[0_4px_20px_rgba(62,207,142,0.4)]' },
  reject: { bg: 'rgba(255, 64, 96, 0.15)', color: '#ff4060', border: '1px solid rgba(255, 64, 96, 0.3)', hover: 'hover:bg-red-500/20' },
  complete: { bg: 'linear-gradient(135deg, #7840ff 0%, #5a2db8 100%)', color: '#ffffff', hover: 'hover:shadow-[0_4px_20px_rgba(120,64,255,0.4)]' },
  review: { bg: 'linear-gradient(135deg, #40e0e0 0%, #2eb8b8 100%)', color: '#0a0a0f', hover: 'hover:shadow-[0_4px_20px_rgba(64,224,224,0.4)]' },
  reschedule: { bg: 'rgba(255,255,255,0.05)', color: '#b4b4b4', border: '1px solid rgba(255,255,255,0.1)', hover: 'hover:bg-white/10' },
  cancel: { bg: 'rgba(255, 64, 96, 0.1)', color: '#ff4060', border: '1px solid rgba(255, 64, 96, 0.2)', hover: 'hover:bg-red-500/10' },
};

export default function SessionCard({
  session,
  currentUserId,
  onAccept,
  onReject,
  onComplete,
  onReview,
  onReschedule,
  onCancel,
}: SessionCardProps) {
  const isMentor = session.mentor_id === currentUserId;
  const isMentee = session.mentee_id === currentUserId;
  const otherPerson = isMentor ? session.mentee : session.mentor;
  const statusStyle = statusStyles[session.status as keyof typeof statusStyles];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
        className="elevated-card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-normal text-lg" style={{ letterSpacing: '-0.02em' }}>{session.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm" style={{ color: '#898989' }}>{session.skill.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <span className="text-xs" style={{ color: '#555' }}>{session.skill.category?.name}</span>
          </div>
        </div>
        <span 
          className="status-badge"
          style={statusStyle}
        >
          {session.status === 'pending' && <Clock size={12} />}
          {session.status === 'confirmed' && <Check size={12} />}
          {session.status === 'completed' && <Star size={12} />}
          {session.status === 'cancelled' && <X size={12} />}
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-2 mb-1">
            <User size={14} style={{ color: '#555' }} />
            <span className="text-xs" style={{ color: '#555' }}>{isMentor ? 'Mentee' : 'Mentor'}</span>
          </div>
          <p className="text-sm font-medium">{otherPerson.full_name}</p>
          <p className="text-xs" style={{ color: '#555' }}>{otherPerson.email}</p>
        </div>
        
        <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} style={{ color: '#555' }} />
            <span className="text-xs" style={{ color: '#555' }}>Scheduled</span>
          </div>
          <p className="text-sm font-medium">{format(new Date(session.scheduled_date), 'MMM dd, yyyy')}</p>
          <p className="text-xs" style={{ color: '#555' }}>{format(new Date(session.scheduled_date), 'hh:mm a')}</p>
        </div>
      </div>

      {session.description && (
        <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={14} style={{ color: '#555' }} />
            <span className="text-xs" style={{ color: '#555' }}>Notes</span>
          </div>
          <p className="text-sm" style={{ color: '#b4b4b4' }}>{session.description}</p>
        </div>
      )}

      {session.review && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl mb-4"
          style={{ 
            background: 'linear-gradient(135deg, rgba(120, 64, 255, 0.1) 0%, rgba(62, 207, 142, 0.05) 100%)',
            border: '1px solid rgba(120, 64, 255, 0.2)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  fill={star <= session.review!.rating ? '#7840ff' : 'transparent'}
                  style={{ color: star <= session.review!.rating ? '#7840ff' : '#4d4d4d' }}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: '#555' }}>
              {isMentor ? 'Student feedback' : 'Your review'}
            </span>
          </div>
          {session.review.comment && (
            <p className="text-sm italic" style={{ color: '#b4b4b4' }}>"{session.review.comment}"</p>
          )}
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2">
        {session.status === 'pending' && isMentor && (
          <>
            <button onClick={onAccept} className="pill-btn flex-1 flex items-center justify-center gap-2" style={actionButtonStyles.accept}>
              <Check size={16} />
              Accept
            </button>
            <button onClick={onReject} className="pill-btn flex-1 flex items-center justify-center gap-2" style={actionButtonStyles.reject}>
              <X size={16} />
              Reject
            </button>
          </>
        )}

        {session.status === 'confirmed' && (
          <>
            {isMentor && onComplete && (
              <button onClick={onComplete} className="pill-btn flex-1 flex items-center justify-center gap-2" style={actionButtonStyles.complete}>
                <Check size={16} />
                Mark Completed
              </button>
            )}
            {(onReschedule || onCancel) && (
              <div className="flex gap-2 flex-1">
                {onReschedule && (
                  <button onClick={onReschedule} className="pill-btn flex-1 flex items-center justify-center gap-2" style={actionButtonStyles.reschedule}>
                    <RefreshCw size={16} />
                    Reschedule
                  </button>
                )}
                {onCancel && (
                  <button onClick={onCancel} className="pill-btn flex-1 flex items-center justify-center gap-2" style={actionButtonStyles.cancel}>
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {session.status === 'completed' && isMentee && !session.review && onReview && (
          <button onClick={onReview} className="pill-btn flex-1 flex items-center justify-center gap-2" style={actionButtonStyles.review}>
            <Star size={16} />
            Leave a Review
          </button>
        )}
      </div>
    </motion.div>
  );
}
import { useEffect, useState } from 'react';
import { Calendar, List, Grid, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import SessionCard from '../components/SessionCard';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sessionsApi, reviewsApi } from '../services/api';
import toast from 'react-hot-toast';
import { SkillSession } from '../types';

export default function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SkillSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'pending'>('upcoming');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reviewModal, setReviewModal] = useState<{ open: boolean; session: SkillSession | null }>({
    open: false,
    session: null,
  });
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await sessionsApi.getAll();
      setSessions(res.data.data);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (sessionId: string, status: string) => {
    try {
      await sessionsApi.updateStatus(sessionId, status);
      toast.success(`Session ${status}!`);
      fetchSessions();
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to update session';
      toast.error(message);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal.session) return;

    try {
      await reviewsApi.create({
        session_id: reviewModal.session.session_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      toast.success('Review submitted!');
      setReviewModal({ open: false, session: null });
      setReviewData({ rating: 5, comment: '' });
      fetchSessions();
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to submit review';
      toast.error(message);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (activeTab === 'upcoming') return ['pending', 'confirmed'].includes(s.status);
    if (activeTab === 'past') return ['completed', 'cancelled'].includes(s.status);
    if (activeTab === 'pending') return s.status === 'pending';
    return true;
  });

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const sessionsOnDate = (date: Date) => 
    filteredSessions.filter(s => isSameDay(new Date(s.scheduled_date), date));

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: sessions.filter(s => ['pending', 'confirmed'].includes(s.status)).length },
    { id: 'past', label: 'Past', count: sessions.filter(s => ['completed', 'cancelled'].includes(s.status)).length },
    { id: 'pending', label: 'Pending', count: sessions.filter(s => s.status === 'pending').length },
  ] as const;

  return (
    <Layout>
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Dashboard</span>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-normal mb-2 gradient-text" style={{ letterSpacing: '-0.02em' }}>My Sessions</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Manage your learning and mentoring sessions.</p>
          </div>
          
          <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 rounded-lg transition-all duration-300"
              style={viewMode === 'list' 
                ? { background: 'rgba(62, 207, 142, 0.2)', color: '#3ecf8e' }
                : { color: '#555' }
              }
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className="p-2 rounded-lg transition-all duration-300"
              style={viewMode === 'calendar' 
                ? { background: 'rgba(62, 207, 142, 0.2)', color: '#3ecf8e' }
                : { color: '#555' }
              }
            >
              <Grid size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300"
              style={
                activeTab === tab.id
                  ? { 
                      background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', 
                      color: '#0a0a0f',
                      boxShadow: '0 4px 20px rgba(62, 207, 142, 0.3)'
                    }
                  : { 
                      background: 'rgba(255,255,255,0.05)', 
                      color: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }
              }
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {viewMode === 'calendar' ? (
        <div className="elevated-card p-5">
             <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: '#555' }}
              >
                <X size={20} className="rotate-90" />
              </button>
              <h2 className="text-xl font-normal">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: '#555' }}
              >
                <X size={20} className="-rotate-90" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium p-2" style={{ color: '#555' }}>
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date) => {
                const daySessions = sessionsOnDate(date);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isToday = isSameDay(date, new Date());
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className="p-2 min-h-[80px] rounded-xl transition-all duration-300 text-left relative"
                    style={{
                      background: isSelected 
                        ? 'rgba(62, 207, 142, 0.15)' 
                        : isToday 
                          ? 'rgba(120, 64, 255, 0.1)'
                          : 'rgba(255,255,255,0.03)',
                      border: isSelected 
                        ? '1px solid rgba(62, 207, 142, 0.5)'
                        : isToday
                          ? '1px solid rgba(120, 64, 255, 0.3)'
                          : '1px solid rgba(255,255,255,0.05)',
                      opacity: isCurrentMonth ? 1 : 0.4,
                    }}
                  >
                    <span className="text-sm font-medium">{format(date, 'd')}</span>
                    {daySessions.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {daySessions.slice(0, 2).map((s) => (
                          <div
                            key={s.session_id}
                            className="text-xs p-1 rounded truncate"
                            style={{
                              background: s.status === 'confirmed' ? 'rgba(62, 207, 142, 0.2)' : 'rgba(255, 120, 64, 0.2)',
                              color: s.status === 'confirmed' ? '#3ecf8e' : '#ff7840',
                            }}
                          >
                            {s.title}
                          </div>
                        ))}
                        {daySessions.length > 2 && (
                          <span className="text-xs" style={{ color: '#555' }}>
                            +{daySessions.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-700" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.session_id}
                  session={session}
                  currentUserId={user!.user_id}
                  onAccept={() => handleStatusUpdate(session.session_id, 'confirmed')}
                  onReject={() => handleStatusUpdate(session.session_id, 'cancelled')}
                  onComplete={() => handleStatusUpdate(session.session_id, 'completed')}
                  onReview={() => setReviewModal({ open: true, session })}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Calendar size={32} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <h3 className="text-xl font-normal mb-2">No {activeTab} sessions</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              {activeTab === 'upcoming'
                ? 'Browse mentors and book your first session!'
                : 'Your session history will appear here.'}
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={reviewModal.open}
        onClose={() => setReviewModal({ open: false, session: null })}
        title="Leave a Review"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="label">Rating</label>
            <StarRating value={reviewData.rating} onChange={(v) => setReviewData({ ...reviewData, rating: v })} />
          </div>

          <div>
            <label className="label">Comment (optional)</label>
            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="Share your experience..."
            />
          </div>

          <button type="submit" className="pill-btn pill-btn-primary w-full mt-4">
            Submit Review
          </button>
        </form>
      </Modal>
    </Layout>
  );
}
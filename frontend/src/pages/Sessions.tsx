import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { requestApi, ratingApi } from '../services/api';
import type { SkillRequest } from '../types';

export default function Sessions() {
  const [sessions, setSessions] = useState<SkillRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const [incoming, outgoing] = await Promise.all([
        requestApi.getIncoming(),
        requestApi.getOutgoing(),
      ]);
      const allSessions = [
        ...(incoming.data.data.requests || []),
        ...(outgoing.data.data.requests || []),
      ].filter((r: SkillRequest) => r.status === 'ACCEPTED');
      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (requestId: string, ratedId: string) => {
    try {
      await ratingApi.create({
        ratedId,
        requestId,
        stars: rating,
        review,
      });
      setShowRating(null);
      setRating(5);
      setReview('');
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'status-badge-pending',
      ACCEPTED: 'status-badge-confirmed',
      REJECTED: 'status-badge-rejected',
      CANCELLED: 'status-badge-cancelled',
    };
    return styles[status] || 'status-badge-pending';
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-normal mb-8 gradient-text">My Sessions</h1>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin border-[#3ecf8e] border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state glass-card">
            <p>No active sessions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      {session.offeredSkillRef?.name} ↔ {session.wantedSkillRef?.name}
                    </h3>
                    <p className="text-sm text-white/50">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`status-badge ${getStatusBadge(session.status)}`}>
                    {session.status}
                  </span>
                </div>

                <button
                  onClick={() => setShowRating(session.id)}
                  className="pill-btn-primary"
                >
                  Rate Session
                </button>

                {showRating === session.id && (
                  <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-2xl"
                          style={{ color: star <= rating ? '#3ecf8e' : '#666' }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Write a review..."
                      className="input-field mb-3"
                      rows={3}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSubmitRating(session.id, session.senderId || '')}
                        className="glow-button"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setShowRating(null)}
                        className="pill-btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
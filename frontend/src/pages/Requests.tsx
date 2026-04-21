import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { requestApi } from '../services/api';
import type { SkillRequest } from '../types';

export default function Requests() {
  const [incoming, setIncoming] = useState<SkillRequest[]>([]);
  const [outgoing, setOutgoing] = useState<SkillRequest[]>([]);
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        requestApi.getIncoming(),
        requestApi.getOutgoing(),
      ]);
      setIncoming(incomingRes.data.data.requests || []);
      setOutgoing(outgoingRes.data.data.requests || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await requestApi.accept(id);
      await fetchRequests();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await requestApi.reject(id);
      await fetchRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await requestApi.cancel(id);
      await fetchRequests();
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'status-badge-pending',
      ACCEPTED: 'status-badge-accepted',
      REJECTED: 'status-badge-rejected',
      CANCELLED: 'status-badge-cancelled',
    };
    return styles[status] || 'status-badge-pending';
  };

  const requests = tab === 'incoming' ? incoming : outgoing;
  const otherUser = tab === 'incoming' ? 'sender' : 'receiver';

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-normal mb-8 gradient-text">Requests</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('incoming')}
            className={`px-6 py-2 rounded-full ${tab === 'incoming' ? 'glow-button' : 'pill-btn-secondary'}`}
          >
            Incoming ({incoming.length})
          </button>
          <button
            onClick={() => setTab('outgoing')}
            className={`px-6 py-2 rounded-full ${tab === 'outgoing' ? 'glow-button' : 'pill-btn-secondary'}`}
          >
            Outgoing ({outgoing.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin border-[#3ecf8e] border-t-transparent" />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state glass-card">
            <p>No {tab} requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#0a0a0f' }}>
                      {request[otherUser]?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{request[otherUser]?.name}</p>
                      <p className="text-sm text-white/50">{request[otherUser]?.email}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="flex gap-4 mb-4">
                  <div className="flex-1 p-4 rounded-xl" style={{ background: 'rgba(62, 207, 142, 0.1)', border: '1px solid rgba(62, 207, 142, 0.2)' }}>
                    <p className="text-xs text-white/50 mb-1">Offering</p>
                    <p>{request.offeredSkillRef?.name}</p>
                  </div>
                  <div className="flex items-center justify-center">↔</div>
                  <div className="flex-1 p-4 rounded-xl" style={{ background: 'rgba(120, 64, 255, 0.1)', border: '1px solid rgba(120, 64, 255, 0.2)' }}>
                    <p className="text-xs text-white/50 mb-1">Wants</p>
                    <p>{request.wantedSkillRef?.name}</p>
                  </div>
                </div>

                {request.message && (
                  <p className="text-sm text-white/70 mb-4">"{request.message}"</p>
                )}

                {request.status === 'PENDING' && tab === 'incoming' && (
                  <div className="flex gap-3">
                    <button onClick={() => handleAccept(request.id)} className="glow-button flex-1">
                      Accept
                    </button>
                    <button onClick={() => handleReject(request.id)} className="pill-btn-secondary flex-1 text-red-400">
                      Reject
                    </button>
                  </div>
                )}

                {request.status === 'PENDING' && tab === 'outgoing' && (
                  <button onClick={() => handleCancel(request.id)} className="pill-btn-secondary text-red-400">
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
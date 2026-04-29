import { useEffect, useState } from 'react';
import { Send, Check, X, Clock, BookOpen, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { sessionsApi } from '../services/api';
import toast from 'react-hot-toast';
import { MentorRequest } from '../types';

export default function Requests() {
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<MentorRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await sessionsApi.getRequests(activeTab);
      setRequests(res.data.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, action: 'accepted' | 'rejected') => {
    try {
      setProcessing(true);
      await sessionsApi.respondToRequest(requestId, action, responseMessage);
      toast.success(action === 'accepted' ? 'Request accepted!' : 'Request declined');
      setSelectedRequest(null);
      setResponseMessage('');
      fetchRequests();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to respond');
    } finally {
      setProcessing(false);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: requests.length, icon: Clock },
    { id: 'accepted', label: 'Accepted', icon: Check },
    { id: 'rejected', label: 'Rejected', icon: X },
  ] as const;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-normal mb-2 gradient-text" style={{ letterSpacing: '-0.02em' }}>
            Request Management
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Manage incoming requests from students who want to learn from you.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2"
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
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'pending' && requests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
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
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {requests.map((request) => (
                <motion.div
                  key={request.request_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="elevated-card p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-medium" style={{ 
                        background: 'linear-gradient(135deg, #7840ff 0%, #5a2db8 100%)', 
                        color: 'white',
                        boxShadow: '0 4px 20px rgba(120, 64, 255, 0.3)'
                      }}>
                        {request.requester.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-medium">{request.requester.full_name}</h3>
                        <p className="text-xs" style={{ color: '#555' }}>{request.requester.email}</p>
                      </div>
                    </div>
                    
                    {activeTab === 'pending' && (
                      <span className="status-badge status-badge-pending">
                        <Clock size={12} />
                        Pending
                      </span>
                    )}
                    {activeTab === 'accepted' && (
                      <span className="status-badge status-badge-accepted">
                        <Check size={12} />
                        Accepted
                      </span>
                    )}
                    {activeTab === 'rejected' && (
                      <span className="status-badge status-badge-rejected">
                        <X size={12} />
                        Rejected
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen size={14} style={{ color: '#555' }} />
                        <span className="text-xs" style={{ color: '#555' }}>Requested Skill</span>
                      </div>
                      <p className="text-sm font-medium">{request.skill.name}</p>
                      <p className="text-xs" style={{ color: '#555' }}>{request.skill.category?.name}</p>
                    </div>

                    {request.message && (
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={14} style={{ color: '#555' }} />
                          <span className="text-xs" style={{ color: '#555' }}>Message</span>
                        </div>
                        <p className="text-sm" style={{ color: '#b4b4b4' }}>{request.message}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs" style={{ color: '#555' }}>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {format(new Date(request.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>

                  {activeTab === 'pending' && (
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => setSelectedRequest(request)}
                        className="pill-btn pill-btn-primary flex-1"
                      >
                        Respond
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Send size={32} style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <h3 className="text-xl font-normal mb-2">No {activeTab} requests</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>
              {activeTab === 'pending' 
                ? 'When students send you requests, they will appear here.'
                : 'Your response history will appear here.'}
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedRequest}
        onClose={() => {
          setSelectedRequest(null);
          setResponseMessage('');
        }}
        title="Respond to Request"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium" style={{ background: '#7840ff', color: 'white' }}>
                  {selectedRequest.requester.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{selectedRequest.requester.full_name}</p>
                  <p className="text-xs" style={{ color: '#555' }}>wants to learn {selectedRequest.skill.name}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Add a message (optional)</label>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="input-field min-h-[100px] resize-none"
                placeholder="Add any notes or instructions for the student..."
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleRespond(selectedRequest.request_id, 'accepted')}
                disabled={processing}
                className="pill-btn flex-1 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#0a0a0f' }}
              >
                <Check size={18} />
                Accept
              </button>
              <button 
                onClick={() => handleRespond(selectedRequest.request_id, 'rejected')}
                disabled={processing}
                className="pill-btn flex-1 flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,64,96,0.15)', color: '#ff4060', border: '1px solid rgba(255,64,96,0.3)' }}
              >
                <X size={18} />
                Decline
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
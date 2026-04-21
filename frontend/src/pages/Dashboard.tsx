import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { requestApi, notificationApi, userApi } from '../services/api';
import type { Notification, User } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalRequests: 0, acceptedRequests: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [suggestedMentors, setSuggestedMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incoming, outgoing, notifRes, mentorsRes] = await Promise.all([
          requestApi.getIncoming(),
          requestApi.getOutgoing(),
          notificationApi.getAll(),
          userApi.getRecommendedTeachers(),
        ]);
        
        const allRequests = [
          ...(incoming.data.data.requests || []),
          ...(outgoing.data.data.requests || [])
        ];
        
        setStats({
          totalRequests: allRequests.length,
          acceptedRequests: allRequests.filter((r: any) => r.status === 'ACCEPTED').length,
        });
        
        setNotifications(notifRes.data.data.notifications?.slice(0, 5) || []);
        setSuggestedMentors(mentorsRes.data.data.users || []);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl gradient-text">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-white/60 mt-2">Here's what's happening with your skill exchanges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-6 rounded-2xl">
            <p className="text-sm text-white/50">Total Requests</p>
            <p className="text-3xl font-bold text-[#3ecf8e]">{stats.totalRequests}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <p className="text-sm text-white/50">Active Exchanges</p>
            <p className="text-3xl font-bold text-[#3ecf8e]">{stats.acceptedRequests}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <p className="text-sm text-white/50">Notifications</p>
            <p className="text-3xl font-bold text-[#3ecf8e]">{unreadCount}</p>
          </div>
          <div className="glass-card p-6 rounded-2xl">
            <p className="text-sm text-white/50">Your Role</p>
            <p className="text-3xl font-bold text-[#3ecf8e]">{user?.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">Recent Notifications</h2>
              <Link to="/notifications" className="text-sm text-[#3ecf8e]">View all</Link>
            </div>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 rounded-full animate-spin border-[#3ecf8e] border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-white/50">No notifications</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-3 rounded-xl ${!n.read ? 'bg-[#3ecf8e]/10 border-l-2 border-[#3ecf8e]' : 'bg-white/5'}`}>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-white/50">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/skills" className="pill-btn-primary text-center">
                My Skills
              </Link>
              <Link to="/browse" className="pill-btn-primary text-center">
                Browse Mentors
              </Link>
              <Link to="/requests" className="pill-btn-primary text-center">
                Requests
              </Link>
              <Link to="/messages" className="pill-btn-primary text-center">
                Messages
              </Link>
            </div>
          </div>
        </div>

        {suggestedMentors.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl mb-4">Recommended Teachers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestedMentors.slice(0, 3).map((mentor) => (
                <div key={mentor.id} className="glass-card p-5 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                      style={{ background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#000' }}>
                      {mentor.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{mentor.name}</p>
                      <p className="text-sm text-white/50">{mentor.role}</p>
                    </div>
                  </div>
                  <Link to={`/profile/${mentor.id}`} className="pill-btn-secondary w-full text-center block">
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
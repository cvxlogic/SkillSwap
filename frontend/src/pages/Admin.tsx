import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  completedRequests: number;
  totalPayments: number;
  revenue: number;
  totalRatings: number;
  pendingReports: number;
}

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin border-[#3ecf8e] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-normal mb-8 gradient-text">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} />
          <StatCard title="Active Users" value={stats?.activeUsers || 0} />
          <StatCard title="Total Requests" value={stats?.totalRequests || 0} />
          <StatCard title="Completed" value={stats?.completedRequests || 0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Payments" value={stats?.totalPayments || 0} />
          <StatCard title="Revenue" value={`₹${stats?.revenue || 0}`} />
          <StatCard title="Ratings" value={stats?.totalRatings || 0} />
          <StatCard title="Pending Reports" value={stats?.pendingReports || 0} color="red" />
        </div>

        <div className="mt-8 glass-card p-6 rounded-3xl">
          <h2 className="text-xl mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/admin/users'}
              className="glow-button"
            >
              Manage Users
            </button>
            <button
              onClick={() => window.location.href = '/admin/reports'}
              className="glow-button"
            >
              View Reports
            </button>
            <button
              onClick={() => window.location.href = '/admin/audit'}
              className="glow-button"
            >
              Audit Logs
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, color = 'green' }: { title: string; value: number | string; color?: 'green' | 'red' }) {
  const valueColor = color === 'green' ? '#3ecf8e' : '#ef4444';
  return (
    <div className="glass-card p-6 rounded-2xl">
      <p className="text-sm text-white/50 mb-2">{title}</p>
      <p className="text-3xl font-medium" style={{ color: valueColor }}>{value}</p>
    </div>
  );
}
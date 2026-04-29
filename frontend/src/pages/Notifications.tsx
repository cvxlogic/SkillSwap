import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck } from 'lucide-react';
import Layout from '../components/Layout';
import { notificationsApi } from '../services/api';
import toast from 'react-hot-toast';
import { Notification } from '../types';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data.data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.notification_id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-normal flex items-center gap-3 mb-2" style={{ letterSpacing: '-0.02em' }}>
              <Bell style={{ color: '#3ecf8e' }} />
              Notifications
            </h1>
            <p style={{ color: '#898989' }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="pill-btn pill-btn-secondary flex items-center gap-2"
            >
              <CheckCheck size={18} />
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#3ecf8e', borderTopColor: 'transparent' }} />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif, index) => (
              <motion.div
                key={notif.notification_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="card p-5 flex items-start gap-4"
                style={
                  !notif.is_read 
                    ? { background: 'rgba(62, 207, 142, 0.05)', borderColor: 'rgba(62, 207, 142, 0.3)' }
                    : {}
                }
              >
                <div className="p-2 rounded-full" style={!notif.is_read ? { background: 'rgba(62, 207, 142, 0.15)' } : { background: '#0f0f0f' }}>
                  <Bell size={18} style={!notif.is_read ? { color: '#3ecf8e' } : { color: '#898989' }} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={!notif.is_read ? 'font-medium' : ''}>{notif.message}</p>
                  <p className="text-sm mt-1" style={{ color: '#898989' }}>
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>

                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.notification_id)}
                    className="p-2 rounded-lg transition-colors"
                    title="Mark as read"
                    style={{ color: '#898989' }}
                  >
                    <Check size={18} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card p-5 text-center py-16">
            <Bell size={48} className="mx-auto mb-4" style={{ color: '#4d4d4d' }} />
            <h3 className="text-xl font-normal mb-2">No notifications</h3>
            <p style={{ color: '#898989' }}>You're all caught up!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

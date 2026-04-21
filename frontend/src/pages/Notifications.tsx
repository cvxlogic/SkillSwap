import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notificationApi } from '../services/api';
import type { Notification } from '../types';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getAll();
      setNotifications(response.data.data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-normal gradient-text">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 text-lg text-white/50">({unreadCount})</span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="pill-btn-secondary">
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin border-[#3ecf8e] border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state glass-card">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkAsRead(n.id)}
                className={`glass-card p-5 rounded-xl cursor-pointer transition-all ${
                  !n.read ? 'border-l-4 border-l-[#3ecf8e]' : ''
                }`}
                style={{
                  background: !n.read ? 'rgba(62, 207, 142, 0.05)' : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{n.title}</h3>
                    <p className="text-sm text-white/70">{n.body}</p>
                  </div>
                  <span className="text-xs text-white/40">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-normal mb-8 gradient-text">Leaderboard</h1>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-2 rounded-full animate-spin border-[#3ecf8e] border-t-transparent" />
          </div>
        ) : (
          <div className="empty-state glass-card">
            <p>Leaderboard coming soon</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
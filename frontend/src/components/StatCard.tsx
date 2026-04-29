import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'default' | 'brand';
}

export default function StatCard({ title, value, icon, variant = 'default' }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, borderColor: 'rgba(62, 207, 142, 0.5)' }}
        className="glass-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{title}</p>
          <p className="text-4xl font-normal mt-2 gradient-text" style={{ letterSpacing: '-0.02em' }}>{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ 
          background: variant === 'brand' 
            ? 'linear-gradient(135deg, rgba(62, 207, 142, 0.2) 0%, rgba(62, 207, 142, 0.05) 100%)'
            : 'rgba(255,255,255,0.05)'
        }}>
          <div style={{ color: '#3ecf8e' }}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ className = '', variant = 'rectangular', width, height, lines = 1 }: SkeletonProps) {
  const baseStyles = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '100px'),
  };

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant={i === lines - 1 ? 'text' : variant}
            width={i === lines - 1 ? '70%' : width}
            height={height}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`skeleton ${className}`}
      style={baseStyles}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

export function MentorCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={56} height={56} />
        <div className="flex-1 space-y-3">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} />
          <div className="flex gap-2">
            <Skeleton width={80} height={24} variant="text" />
            <Skeleton width={80} height={24} variant="text" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SessionCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-3">
          <div className="flex justify-between">
            <Skeleton width="50%" height={20} />
            <Skeleton width={60} height={24} variant="text" />
          </div>
          <Skeleton width="30%" height={14} />
          <Skeleton width="70%" height={14} />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="space-y-2">
          <Skeleton width={60} height={12} />
          <Skeleton width={40} height={28} />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card p-5 overflow-hidden">
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} width={`${100 / cols}%`} height={16} />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-5 border-b flex gap-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} width={`${100 / cols}%`} height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" height={14} />
          <Skeleton width="30%" height={12} />
        </div>
      </div>
    </div>
  );
}
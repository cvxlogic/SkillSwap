import { User } from '../types';

interface AvatarProps {
  user: User | { full_name: string; avatar_url?: string | null };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-28 h-28 text-3xl',
};

export default function Avatar({ user, size = 'md', className = '' }: AvatarProps) {
  const initials = user.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className={`${sizeClasses[size]} rounded-xl object-cover ${className}`}
      />
    );
  }

  const isXl = size === 'xl';

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center font-medium flex-shrink-0 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)',
        color: '#0a0a0f',
        boxShadow: isXl ? '0 8px 40px rgba(62, 207, 142, 0.4)' : undefined,
      }}
    >
      {initials}
    </div>
  );
}

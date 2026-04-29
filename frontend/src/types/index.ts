export interface User {
  user_id: string;
  id?: string;
  roll_number: string;
  full_name: string;
  email: string;
  role: 'student' | 'faculty';
  department: string | null;
  avg_rating: number | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  categoryId?: string;
  category?: SkillCategory;
  _count?: { user_skills: number };
}

export interface SkillCategory {
  id: string;
  name: string;
  _count?: { skills: number };
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience: number;
  skill: Skill;
}

export interface SkillSession {
  session_id: string;
  id?: string;
  mentor_id: string;
  mentee_id: string;
  skill_id: string;
  title: string;
  description: string | null;
  scheduled_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  mentor: Pick<User, 'user_id' | 'full_name' | 'email' | 'avg_rating'>;
  mentee: Pick<User, 'user_id' | 'full_name' | 'email'>;
  skill: Skill;
  review?: SessionReview;
}

export interface SessionReview {
  review_id: string;
  id?: string;
  session_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  notification_id: string;
  id?: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_skills: number;
  upcoming_sessions: number;
  completed_sessions: number;
  avg_rating: number;
  unread_notifications: number;
}

export interface TopMentor {
  user_id: string;
  roll_number: string;
  full_name: string;
  email: string;
  department: string | null;
  avg_rating: number;
  total_sessions: number;
  completed_sessions: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LearningGoal {
  id: string;
  userId: string;
  skillId: string;
  description: string | null;
  status: 'wanted' | 'learning' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  skill: Skill;
}

export interface MentorRequest {
  request_id: string;
  id?: string;
  requester_id: string;
  receiver_id: string;
  skill_id: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  requester: Pick<User, 'user_id' | 'full_name' | 'email' | 'department' | 'avg_rating'>;
  receiver: Pick<User, 'user_id' | 'full_name' | 'email' | 'department'>;
  skill: Skill;
}

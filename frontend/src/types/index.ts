export type UserRole = 'STUDENT' | 'TEACHER' | 'EXCHANGER' | 'OTHER';

export type SkillType = 'HAVE' | 'WANT';

export type RequestType = 'EXCHANGE' | 'LEARN' | 'PAID';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type NotificationType = 'REQUEST' | 'MESSAGE' | 'RATING' | 'PAYMENT' | 'REPORT' | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phoneVerified?: boolean;
  profilePic?: string;
  role: UserRole;
  bio?: string;
  isOnline?: boolean;
  isAdmin?: boolean;
  isSuspended?: boolean;
  lastSeen?: string;
  createdAt: string;
  userSkills?: UserSkill[];
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  createdAt?: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  type: SkillType;
  isPaid?: boolean;
  price?: number;
  createdAt?: string;
  skill: Skill;
}

export interface SkillRequest {
  id: string;
  senderId: string;
  receiverId: string;
  offeredSkill: string;
  wantedSkill: string;
  type: RequestType;
  status: RequestStatus;
  message?: string;
  createdAt: string;
  updatedAt?: string;
  sender?: User;
  receiver?: User;
  offeredSkillRef?: Skill;
  wantedSkillRef?: Skill;
}

export interface Conversation {
  id: string;
  requestId?: string;
  participants: User[];
  lastMessage?: Message;
  updatedAt?: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
  read?: boolean;
  createdAt: string;
  sender?: User;
}

export interface Rating {
  id: string;
  raterId: string;
  ratedId: string;
  requestId: string;
  stars: number;
  review?: string;
  createdAt: string;
  rater?: User;
  rated?: User;
}

export interface Payment {
  id: string;
  payerId: string;
  payeeId: string;
  requestId: string;
  amount: number;
  currency: string;
  razorpayId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read?: boolean;
  link?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ path: string; message: string }>;
}
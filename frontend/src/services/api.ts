import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillswap-auth');
  if (token) {
    try {
      const stored = JSON.parse(token);
      if (stored.state?.accessToken) {
        config.headers.Authorization = `Bearer ${stored.state.accessToken}`;
      }
    } catch (e) {
      // ignore parse errors
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skillswap-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) => 
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => 
    api.post('/auth/login', data),
  googleAuth: (googleToken: string) => 
    api.post('/auth/google', { googleToken }),
  refreshToken: (refreshToken: string) => 
    api.post('/auth/refresh-token', { refreshToken }),
  logout: () => 
    api.post('/auth/logout'),
  forgotPassword: (email: string) => 
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => 
    api.post('/auth/reset-password', { token, newPassword }),
  getProfile: () => 
    api.get('/auth/profile'),
  updateProfile: (data: { name?: string; bio?: string; role?: string }) => 
    api.patch('/auth/profile', data),
  uploadAvatar: (formData: FormData) => 
    api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const userApi = {
  search: (params?: { q?: string; skill?: string; role?: string; type?: string; rating?: number; page?: number }) => 
    api.get('/users/search', { params }),
  getById: (id: string) => 
    api.get(`/users/${id}`),
  getRecommendedTeachers: (page?: number) => 
    api.get('/users/recommendations', { params: { page } }),
};

export const skillApi = {
  getAll: (params?: { category?: string; page?: number; limit?: number }) => 
    api.get('/skills', { params }),
  getCategories: () => 
    api.get('/skills/categories'),
  create: (data: { name: string; category: string }) => 
    api.post('/skills', data),
  getMySkills: (type?: 'HAVE' | 'WANT') => 
    api.get('/skills/my', { params: { type } }),
  addMySkill: (data: { skillId: string; type: 'HAVE' | 'WANT'; isPaid?: boolean; price?: number }) => 
    api.post('/skills/my', data),
  updateMySkill: (skillId: string, data: { isPaid?: boolean; price?: number }) => 
    api.patch(`/skills/my/${skillId}`, data),
  removeMySkill: (skillId: string) => 
    api.delete(`/skills/my/${skillId}`),
  getUsersBySkill: (skillId: string, params?: { type?: string; page?: number }) => 
    api.get(`/skills/users/${skillId}`, { params }),
};

export const requestApi = {
  create: (data: { receiverId: string; offeredSkill: string; wantedSkill: string; type: string; message?: string }) => 
    api.post('/requests', data),
  getIncoming: (page?: number) => 
    api.get('/requests/incoming', { params: { page } }),
  getOutgoing: (page?: number) => 
    api.get('/requests/outgoing', { params: { page } }),
  getById: (id: string) => 
    api.get(`/requests/${id}`),
  accept: (id: string) => 
    api.patch(`/requests/${id}/accept`),
  reject: (id: string) => 
    api.patch(`/requests/${id}/reject`),
  cancel: (id: string) => 
    api.patch(`/requests/${id}/cancel`),
};

export const conversationApi = {
  getAll: (page?: number) => 
    api.get('/conversations', { params: { page } }),
  getById: (id: string, page?: number) => 
    api.get(`/conversations/${id}`, { params: { page } }),
  sendMessage: (id: string, content: string, type?: string) => 
    api.post(`/conversations/${id}/messages`, { content, type }),
  markAsRead: (id: string) => 
    api.patch(`/conversations/${id}/read`),
  getUnreadCount: () => 
    api.get('/conversations/unread-count'),
};

export const ratingApi = {
  create: (data: { ratedId: string; requestId: string; stars: number; review?: string }) => 
    api.post('/ratings', data),
  getUserRatings: (userId: string, page?: number) => 
    api.get(`/ratings/user/${userId}`, { params: { page } }),
  getMyGiven: (page?: number) => 
    api.get('/ratings/my-given', { params: { page } }),
};

export const paymentApi = {
  createOrder: (requestId: string) => 
    api.post('/payments/create-order', { requestId }),
  verify: (data: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string }) => 
    api.post('/payments/verify', data),
  getMyPayments: (page?: number) => 
    api.get('/payments/my', { params: { page } }),
  requestRefund: (paymentId: string) => 
    api.post(`/payments/${paymentId}/refund`),
};

export const reportApi = {
  create: (data: { reportedId: string; reason: string; description: string }) => 
    api.post('/reports', data),
};

export const notificationApi = {
  getAll: (page?: number) => 
    api.get('/notifications', { params: { page } }),
  markAsRead: (id: string) => 
    api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => 
    api.patch('/notifications/read-all'),
  delete: (id: string) => 
    api.delete(`/notifications/${id}`),
  getUnreadCount: () => 
    api.get('/notifications/unread-count'),
};

export const adminApi = {
  getUsers: (params?: { suspended?: string; role?: string; search?: string; page?: number }) => 
    api.get('/admin/users', { params }),
  suspendUser: (id: string, reason?: string) => 
    api.patch(`/admin/users/${id}/suspend`, { reason }),
  unsuspendUser: (id: string) => 
    api.patch(`/admin/users/${id}/unsuspend`),
  getReports: (params?: { status?: string; page?: number }) => 
    api.get('/admin/reports', { params }),
  updateReport: (id: string, data: { status: string; adminNote?: string }) => 
    api.patch(`/admin/reports/${id}`, data),
  getStats: () => 
    api.get('/admin/stats'),
  getAuditLogs: (params?: { userId?: string; action?: string; page?: number }) => 
    api.get('/admin/audit-logs', { params }),
};

export default api;
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.patch('/auth/profile', data),
};

export const skillsApi = {
  getAll: (categoryId?: string) => 
    categoryId ? api.get(`/skills?category_id=${categoryId}`) : api.get('/skills'),
  getCategories: () => api.get('/skills/categories'),
  getUserSkills: (userId: string) => api.get(`/skills/users/${userId}`),
  searchUsers: (params: { skill_id?: string; q?: string }) => api.get('/skills/users/search', { params }),
  addSkill: (data: any) => api.post('/skills', data),
  updateSkill: (id: string, data: any) => api.patch(`/skills/${id}`, data),
  deleteSkill: (id: string) => api.delete(`/skills/${id}`),
  getLearningGoals: () => api.get('/skills/learning-goals'),
  addLearningGoal: (data: any) => api.post('/skills/learning-goals', data),
  updateLearningGoal: (id: string, data: any) => api.patch(`/skills/learning-goals/${id}`, data),
  deleteLearningGoal: (id: string) => api.delete(`/skills/learning-goals/${id}`),
  getSuggestedMentors: (goalId: string) => api.get(`/skills/learning-goals/${goalId}/suggested-mentors`),
};

export const sessionsApi = {
  getAll: () => api.get('/sessions'),
  getById: (id: string) => api.get(`/sessions/${id}`),
  create: (data: any) => api.post('/sessions', data),
  updateStatus: (id: string, status: string) => api.patch(`/sessions/${id}/status`, { status }),
  getStats: () => api.get('/sessions/stats'),
  getRequests: (status?: string) => api.get('/sessions/requests', { params: { status } }),
  respondToRequest: (id: string, action: 'accepted' | 'rejected', message?: string) => 
    api.post(`/sessions/${id}/respond`, { action, message }),
  requestReschedule: (id: string, new_date: string, reason?: string) => 
    api.post(`/sessions/${id}/reschedule`, { new_date, reason }),
};

export const reviewsApi = {
  create: (data: any) => api.post('/reviews', data),
  getMentorReviews: (mentorId: string) => api.get(`/reviews/mentor/${mentorId}`),
  getLeaderboard: () => api.get('/reviews/leaderboard'),
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export default api;

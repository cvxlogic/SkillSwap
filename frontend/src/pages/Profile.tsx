import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Calendar, Star, BookOpen, Clock, Edit, Save, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { authApi, sessionsApi, skillsApi } from '../services/api';
import toast from 'react-hot-toast';
import { UserSkill } from '../types';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    department: user?.department || '',
    bio: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, skillsRes] = await Promise.all([
        sessionsApi.getStats(),
        skillsApi.getUserSkills(user?.user_id || ''),
      ]);
      setStats(statsRes.data.data);
      setUserSkills(skillsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await authApi.updateProfile(formData);
      updateUser(res.data.data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full" style={{ 
            background: 'radial-gradient(circle, rgba(120, 64, 255, 0.15) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }} />
          
          <div className="elevated-card p-5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-3xl font-medium" style={{ 
                  background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', 
                  color: '#0a0a0f',
                  boxShadow: '0 8px 40px rgba(62, 207, 142, 0.4)'
                }}>
                  {user?.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 rounded-xl" style={{ 
                  background: 'linear-gradient(135deg, #7840ff 0%, #5a2db8 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(120, 64, 255, 0.4)'
                }}>
                  <Camera size={16} />
                </button>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                {editing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="input-field text-center md:text-left"
                      placeholder="Your name"
                    />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="input-field text-center md:text-left"
                      placeholder="Department"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-normal gradient-text mb-2">{user?.full_name}</h1>
                    <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>{user?.department}</p>
                  </>
                )}
                
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium uppercase" style={{ 
                    background: 'rgba(62, 207, 142, 0.15)', 
                    color: '#3ecf8e',
                    border: '1px solid rgba(62, 207, 142, 0.3)'
                  }}>
                    {user?.role}
                  </span>
                  {user?.avg_rating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= Math.round(user.avg_rating!) ? '#7840ff' : 'transparent'}
                          style={{ color: star <= Math.round(user.avg_rating!) ? '#7840ff' : '#4d4d4d' }}
                        />
                      ))}
                      <span className="text-sm ml-1" style={{ color: '#7840ff' }}>
                        {Number(user.avg_rating).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={loading}
                className="pill-btn flex items-center gap-2"
                style={editing 
                  ? { background: 'linear-gradient(135deg, #3ecf8e 0%, #2eb878 100%)', color: '#0a0a0f' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#b4b4b4', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {editing ? (
                  <>
                    <Save size={16} />
                    Save
                  </>
                ) : (
                  <>
                    <Edit size={16} />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="elevated-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(62, 207, 142, 0.15)' }}>
                <BookOpen size={22} style={{ color: '#3ecf8e' }} />
              </div>
              <span className="text-sm" style={{ color: '#555' }}>Skills</span>
            </div>
            <p className="text-3xl font-medium gradient-text">{stats?.total_skills || 0}</p>
            <p className="text-xs mt-1" style={{ color: '#555' }}>Added to profile</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="elevated-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(120, 64, 255, 0.15)' }}>
                <Calendar size={22} style={{ color: '#7840ff' }} />
              </div>
              <span className="text-sm" style={{ color: '#555' }}>Sessions</span>
            </div>
            <p className="text-3xl font-medium" style={{ color: '#7840ff' }}>{stats?.completed_sessions || 0}</p>
            <p className="text-xs mt-1" style={{ color: '#555' }}>Completed</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="elevated-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(64, 224, 224, 0.15)' }}>
                <Clock size={22} style={{ color: '#40e0e0' }} />
              </div>
              <span className="text-sm" style={{ color: '#555' }}>Upcoming</span>
            </div>
            <p className="text-3xl font-medium" style={{ color: '#40e0e0' }}>{stats?.upcoming_sessions || 0}</p>
            <p className="text-xs mt-1" style={{ color: '#555' }}>Scheduled</p>
          </motion.div>
        </div>

         <div className="elevated-card p-5">
           <h2 className="text-xl font-normal mb-4 flex items-center gap-2">
             <BookOpen size={20} style={{ color: '#3ecf8e' }} />
             My Skills
          </h2>
          
          {userSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userSkills.map((us) => (
                <div 
                  key={us.id}
                   className="p-5 rounded-xl flex items-center justify-between"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div>
                    <p className="font-medium">{us.skill.name}</p>
                    <p className="text-xs" style={{ color: '#555' }}>{us.skill.category?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 rounded-full text-xs capitalize" style={{ 
                      background: 'rgba(62, 207, 142, 0.15)', 
                      color: '#3ecf8e',
                      border: '1px solid rgba(62, 207, 142, 0.3)'
                    }}>
                      {us.proficiency_level}
                    </span>
                    <p className="text-xs mt-1" style={{ color: '#555' }}>{us.years_of_experience} years</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>No skills added yet</p>
            </div>
          )}
        </div>

         <div className="elevated-card p-5">
           <h2 className="text-xl font-normal mb-4 flex items-center gap-2">
             <Mail size={20} style={{ color: '#7840ff' }} />
             Account Info
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <Mail size={18} style={{ color: '#555' }} />
                <span style={{ color: '#555' }}>Email</span>
              </div>
              <span>{user?.email}</span>
            </div>
            
            <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <Briefcase size={18} style={{ color: '#555' }} />
                <span style={{ color: '#555' }}>Department</span>
              </div>
              <span>{user?.department || 'Not set'}</span>
            </div>
            
            <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <User size={18} style={{ color: '#555' }} />
                <span style={{ color: '#555' }}>Role</span>
              </div>
              <span className="capitalize">{user?.role}</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Calendar size={18} style={{ color: '#555' }} />
                <span style={{ color: '#555' }}>Member Since</span>
              </div>
              <span>{format(new Date(user?.created_at || Date.now()), 'MMM yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
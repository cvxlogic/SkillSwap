import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.profilePic || '');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const response = await authApi.uploadAvatar(formData);
        updateUser({ ...user!, profilePic: response.data.data.profilePic });
        toast.success('Profile picture updated');
      }

      if (name !== user?.name || bio !== user?.bio) {
        await authApi.updateProfile({ name, bio });
        updateUser({ ...user!, name, bio: bio || undefined });
        toast.success('Profile updated');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-normal mb-8 gradient-text">Settings</h1>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl">
            <h2 className="text-xl mb-6">Profile Settings</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={avatarPreview || '/placeholder-avatar.png'}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#3ecf8e]"
                  />
                  <label className="absolute bottom-0 right-0 bg-[#3ecf8e] p-2 rounded-full cursor-pointer hover:bg-[#2eb878] transition-colors">
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                      <line x1="21" y1="5" x2="9" y2="17"/>
                      <line x1="9" y1="5" x2="21" y2="17"/>
                    </svg>
                  </label>
                </div>
              </div>

              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field opacity-50"
                />
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glow-button w-full disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <h2 className="text-xl mb-6">Account</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
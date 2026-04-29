import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import Layout from '../components/Layout';
import MentorCard from '../components/MentorCard';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { skillsApi } from '../services/api';
import toast from 'react-hot-toast';
import { Skill, SkillCategory, User, UserSkill } from '../types';

export default function BrowseMentors() {
  const [mentors, setMentors] = useState<(User & { user_skills?: UserSkill[] })[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<typeof mentors[0] | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skillsRes, categoriesRes] = await Promise.all([
        skillsApi.getAll(),
        skillsApi.getCategories(),
      ]);
      setAllSkills(skillsRes.data.data);
      setCategories(categoriesRes.data.data);
      await searchMentors();
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const searchMentors = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedSkill) params.skill_id = selectedSkill;
      
      const res = await skillsApi.searchUsers(params);
      const faculty = res.data.data.filter((u: any) => 
        u.role === 'faculty' && u.user_skills?.length > 0
      );
      setMentors(faculty);
    } catch (error) {
      toast.error('Failed to search mentors');
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchMentors();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedSkill]);

  const filteredSkills = selectedCategory
    ? allSkills.filter((s) => s.categoryId === selectedCategory)
    : allSkills;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-normal mb-2 gradient-text" style={{ letterSpacing: '-0.02em' }}>Browse Mentors</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Find experts to learn from.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          <select
            value={selectedCategory || ''}
            onChange={(e) => {
              setSelectedCategory(e.target.value || null);
              setSelectedSkill(null);
            }}
            className="input-field sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSkill || ''}
            onChange={(e) => setSelectedSkill(e.target.value || null)}
            className="input-field sm:w-48"
            disabled={!selectedCategory}
          >
            <option value="">All Skills</option>
            {filteredSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(62,207,142,0.3)', borderTopColor: '#3ecf8e' }} />
          </div>
        ) : mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor.user_id}
                mentor={mentor}
                onSelect={() => setSelectedMentor(mentor)}
                showFavorite={true}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-5 text-center py-16">
            <Users size={48} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
            <h3 className="text-xl font-normal mb-2">No mentors found</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Try adjusting your search filters.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
        title={selectedMentor?.full_name || ''}
      >
        {selectedMentor && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar user={selectedMentor} size="lg" />
              <div>
                <p style={{ color: '#898989' }}>{selectedMentor.department}</p>
                {selectedMentor.avg_rating && (
                  <p style={{ color: '#3ecf8e' }}>★ {Number(selectedMentor.avg_rating).toFixed(1)} rating</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMentor.user_skills?.map((us) => (
                  <span key={us.id} className="px-3 py-1 rounded-full text-sm" style={{ background: '#0f0f0f' }}>
                    {us.skill.name} • {us.proficiency_level}
                  </span>
                ))}
              </div>
            </div>

            <a
              href={`/sessions/book/${selectedMentor.user_id}`}
              className="pill-btn pill-btn-primary w-full text-center block mt-4"
            >
              Book a Session
            </a>
          </div>
        )}
      </Modal>
    </Layout>
  );
}

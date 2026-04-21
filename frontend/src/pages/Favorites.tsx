import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-normal mb-8 gradient-text">Favorites</h1>
        
        <div className="empty-state glass-card">
          <p className="text-white/50">No favorites yet</p>
          <button 
            onClick={() => navigate('/browse')}
            className="mt-4 glow-button"
          >
            Browse Mentors
          </button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './TabNavigation.css';

export function TabNavigation({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  return (
    <nav className="tab-navigation">
      <button 
        className={`tab ${activeTab === 'overall' ? 'active' : ''}`}
        onClick={() => handleTabClick('overall')}
      >
        Overall Player List
      </button>
      <button 
        className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
        onClick={() => handleTabClick('weekly')}
      >
        Game Creation
      </button>
      <button 
        className={`tab ${activeTab === 'games' ? 'active' : ''}`}
        onClick={() => handleTabClick('games')}
      >
        Game Scores
      </button>
      <button 
        className={`tab ${activeTab === 'player-stats' ? 'active' : ''}`}
        onClick={() => handleTabClick('player-stats')}
      >
        Player Stats
      </button>
      <Link
        to="/admin"
        className={activeTab === 'admin' ? 'active' : ''}
        onClick={() => setActiveTab('admin')}
      >
        Admin
      </Link>
    </nav>
  );
}
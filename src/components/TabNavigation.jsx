import React from 'react';
import { useNavigate } from 'react-router-dom';

export function TabNavigation({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'overall':
        navigate('/overall');
        break;
      case 'weekly':
        navigate('/weekly');
        break;
      case 'games':
        navigate('/games');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <nav className="App-nav">
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
        Weekly Selection
      </button>
      <button 
        className={`tab ${activeTab === 'games' ? 'active' : ''}`}
        onClick={() => handleTabClick('games')}
      >
        Game Management
      </button>
    </nav>
  );
}
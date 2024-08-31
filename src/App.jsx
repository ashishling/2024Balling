import React, { useState, useEffect, useCallback } from 'react';
import { Player } from './models/Player';
import { Team } from './models/Team';
import { PlayerInput } from './components/PlayerInput';
import { PlayerList } from './components/PlayerList';
import { WeeklySelection } from './components/WeeklySelection';
import { createBalancedTeams } from './utils/teambalancer';
import './App.css';

function App() {
  const [allPlayers, setAllPlayers] = useState(() => {
    const storedPlayers = localStorage.getItem('basketballPlayers');
    console.log('Initial load from storage:', storedPlayers);
    if (storedPlayers) {
      try {
        const parsedPlayers = JSON.parse(storedPlayers);
        console.log('Initial parsed players:', parsedPlayers);
        if (Array.isArray(parsedPlayers)) {
          return parsedPlayers.map(p => new Player(p.name, p.position, p.skillLevel));
        }
      } catch (error) {
        console.error('Error parsing stored players:', error);
      }
    }
    return [];
  });

  const [weeklyPlayers, setWeeklyPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    console.log('allPlayers state updated:', allPlayers);
    console.log('Saving to storage:', JSON.stringify(allPlayers));
    localStorage.setItem('basketballPlayers', JSON.stringify(allPlayers));
  }, [allPlayers]);

  const addPlayer = useCallback((player) => {
    console.log('Adding player:', player);
    setAllPlayers(prevPlayers => [...prevPlayers, player]);
  }, []);

  const removePlayer = useCallback((name) => {
    setAllPlayers(prevPlayers => prevPlayers.filter(player => player.name !== name));
  }, []);

  const updateWeeklyPlayers = useCallback((selectedPlayers) => {
    setWeeklyPlayers(selectedPlayers);
  }, []);

  useEffect(() => {
    if (weeklyPlayers.length >= 2) {
      createTeams();
    }
  }, [weeklyPlayers]);

  const createTeams = useCallback(() => {
    const balancedTeams = createBalancedTeams(weeklyPlayers);
    
    // Sort players by position within each team
    const sortedTeams = balancedTeams.map(team => {
      const sortedPlayers = team.players.sort((a, b) => {
        const positionOrder = { 'Guard': 1, 'Forward': 2, 'Center': 3 };
        return positionOrder[a.position] - positionOrder[b.position];
      });
      return new Team(sortedPlayers);
    });
    
    setTeams(sortedTeams);
  }, [weeklyPlayers]);

  const editPlayer = useCallback((name, newPosition, newSkillLevel) => {
    setAllPlayers(prevPlayers =>
      prevPlayers.map(player =>
        player.name === name
          ? { ...player, position: newPosition, skillLevel: newSkillLevel }
          : player
      )
    );
  }, []);

  const handleReset = useCallback(() => {
    setWeeklyPlayers([]);
    setTeams([]);
  }, []);

  console.log('Rendering App with allPlayers:', allPlayers);

  return (
    <div className="App">
      <header className="App-header">
        <h1>2024 Balling</h1>
      </header>
      <nav className="App-nav">
        <button 
          className={`tab ${activeTab === 'overall' ? 'active' : ''}`}
          onClick={() => setActiveTab('overall')}
        >
          Overall Player List
        </button>
        <button 
          className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly Selection
        </button>
      </nav>
      <main className="App-main">
        {activeTab === 'overall' && (
          <div className="overall-list-container">
            <div className="player-input-section">
              <h2>Add New Player</h2>
              <PlayerInput onAddPlayer={addPlayer} />
            </div>
            <div className="player-list-section">
              <h2>Overall Player List</h2>
              <PlayerList players={allPlayers} onRemovePlayer={removePlayer} />
            </div>
          </div>
        )}
        {activeTab === 'weekly' && (
          <div className="weekly-container">
            <div className="weekly-selection-container">
              <WeeklySelection 
                allPlayers={allPlayers} 
                onUpdateWeeklyPlayers={updateWeeklyPlayers}
                onGenerateTeams={createTeams}
                onReset={handleReset}
              />
            </div>
            <div className="generated-teams-container">
              <h2>Generated Teams</h2>
              {teams.length > 0 ? (
                <div className="teams-container">
                  {teams.map((team, index) => (
                    <div key={index} className="team">
                      <h3>Team {index + 1}</h3>
                      <ul>
                        {team.players.map((player, playerIndex) => (
                          <li key={playerIndex}>{player.name} - {player.position} (Skill: {player.skillLevel})</li>
                        ))}
                      </ul>
                      <p>Total Skill: {team.getTotalSkill()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-teams-message">No teams generated yet. Select players and click "Generate Teams" to create balanced teams.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

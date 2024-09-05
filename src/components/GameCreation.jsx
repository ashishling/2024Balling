import React, { useState } from 'react';
import './GameCreation.css';

export function GameCreation({ onCreateGame, allPlayers }) {
  const [gameDate, setGameDate] = useState('');
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreateGame) {
      const newGame = {
        date: gameDate,
        teams: [
          { name: team1Name, players: team1Players, score: 0 },
          { name: team2Name, players: team2Players, score: 0 }
        ],
        status: 'upcoming'
      };
      onCreateGame(newGame);
      // Reset form
      setGameDate('');
      setTeam1Name('');
      setTeam2Name('');
      setTeam1Players([]);
      setTeam2Players([]);
    }
  };

  const handlePlayerSelection = (playerId, team) => {
    if (team === 1) {
      setTeam1Players(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
    } else {
      setTeam2Players(prev => prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]);
    }
  };

  return (
    <div className="game-creation">
      <h2>Create a New Game</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Game Date:
          <input
            type="date"
            value={gameDate}
            onChange={(e) => setGameDate(e.target.value)}
            required
          />
        </label>
        <label>
          Team 1 Name:
          <input
            type="text"
            value={team1Name}
            onChange={(e) => setTeam1Name(e.target.value)}
            required
          />
        </label>
        <label>
          Team 2 Name:
          <input
            type="text"
            value={team2Name}
            onChange={(e) => setTeam2Name(e.target.value)}
            required
          />
        </label>
        <div className="player-selection">
          <div className="team-players">
            <h3>Team 1 Players</h3>
            {allPlayers.map(player => (
              <label key={player.id}>
                <input
                  type="checkbox"
                  checked={team1Players.includes(player.id)}
                  onChange={() => handlePlayerSelection(player.id, 1)}
                />
                {player.name}
              </label>
            ))}
          </div>
          <div className="team-players">
            <h3>Team 2 Players</h3>
            {allPlayers.map(player => (
              <label key={player.id}>
                <input
                  type="checkbox"
                  checked={team2Players.includes(player.id)}
                  onChange={() => handlePlayerSelection(player.id, 2)}
                />
                {player.name}
              </label>
            ))}
          </div>
        </div>
        <button type="submit">Create Game</button>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import './GameCard.css';

export function GameCard({ game, onUpdateScore, onDeleteGame, isUpcoming, getPlayerName }) {
  const [localTeam1Score, setLocalTeam1Score] = useState(game.teams[0]?.score || 0);
  const [localTeam2Score, setLocalTeam2Score] = useState(game.teams[1]?.score || 0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLocalTeam1Score(game.teams[0]?.score || 0);
    setLocalTeam2Score(game.teams[1]?.score || 0);
  }, [game]);

  const handleScoreUpdate = () => {
    onUpdateScore(game.id, parseInt(localTeam1Score), parseInt(localTeam2Score));
    setIsEditing(false);
  };

  const handleDeleteGame = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this game? This action cannot be undone.");
    if (confirmDelete) {
      onDeleteGame(game.id);
    }
  };

  const renderTeam = (teamIndex) => {
    const team = game.teams[teamIndex];
    if (!team) {
      console.error(`Team ${teamIndex} is undefined for game:`, game);
      return null;
    }

    return (
      <div className="team-column">
        <h3>{team.name}</h3>
        <ul>
          {Array.isArray(team.players) ? (
            team.players.map((playerId, index) => (
              <li key={index}>{getPlayerName(playerId)}</li>
            ))
          ) : (
            <li>No players available</li>
          )}
        </ul>
        <div className="score-display">Score: {team.score}</div>
      </div>
    );
  };

  if (!game || !Array.isArray(game.teams) || game.teams.length < 2) {
    console.error('Invalid game data:', game);
    return <div className="game-card">Invalid game data</div>;
  }

  return (
    <div className="game-card">
      <div className="game-date">{new Date(game.date).toLocaleDateString()}</div>
      <div className="game-id" style={{ fontSize: '0.8em', color: '#666', marginBottom: '5px' }}>
        Game ID: {game.id}
      </div>
      <div className="game-status" style={{ fontSize: '0.9em', color: '#444', marginBottom: '5px' }}>
        Status: {game.status}
      </div>
      <div className="teams-container">
        {renderTeam(0)}
        {renderTeam(1)}
      </div>
      <div className="action-buttons">
        {game.status === 'completed' && !isEditing ? (
          <button onClick={() => setIsEditing(true)}>Edit Score</button>
        ) : (
          <>
            <input
              type="number"
              value={localTeam1Score}
              onChange={(e) => setLocalTeam1Score(e.target.value)}
            />
            <input
              type="number"
              value={localTeam2Score}
              onChange={(e) => setLocalTeam2Score(e.target.value)}
            />
            <button onClick={handleScoreUpdate}>
              {isUpcoming ? "Update Score" : "Save Score"}
            </button>
          </>
        )}
        <button className="delete-button" onClick={handleDeleteGame}>Delete Game</button>
      </div>
    </div>
  );
}

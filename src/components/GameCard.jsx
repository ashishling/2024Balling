import React, { useState } from 'react';
import './GameCard.css';

export function GameCard({ game, onUpdateScore, onDeleteGame, isUpcoming }) {
  console.log('onDeleteGame in GameCard:', onDeleteGame); // Keep this line for debugging

  const [isEditing, setIsEditing] = useState(false);
  const [team1Score, setTeam1Score] = useState(game.team1Score || 0);
  const [team2Score, setTeam2Score] = useState(game.team2Score || 0);

  const handleScoreSubmit = () => {
    onUpdateScore(game.id, team1Score, team2Score);
    setIsEditing(false);
  };

  const handleDeleteGame = () => {
    if (typeof onDeleteGame !== 'function') {
      console.error('onDeleteGame is not a function in GameCard');
      return;
    }
    if (window.confirm('Are you sure you want to delete this game?')) {
      onDeleteGame(game.id);
    }
  };

  const renderPlayers = (team) => {
    if (team && team.players && Array.isArray(team.players)) {
      return team.players.map((player, index) => (
        <li key={index}>{player.name} - {player.position}</li>
      ));
    }
    return <li>No players available</li>;
  };

  const team1Players = renderPlayers(game.teams[0]);
  const team2Players = renderPlayers(game.teams[1]);

  return (
    <div className={`game-card ${isUpcoming ? 'upcoming' : 'past'}`}>
      <p className="game-date">Game Date: {new Date(game.date).toLocaleDateString()}</p>
      <div className="teams-container">
        <div className="team-column">
          <h3>Team 1</h3>
          <ul>{team1Players}</ul>
          <div className="score-display">
            <p>Score: {team1Score}</p>
          </div>
        </div>
        <div className="team-column">
          <h3>Team 2</h3>
          <ul>{team2Players}</ul>
          <div className="score-display">
            <p>Score: {team2Score}</p>
          </div>
        </div>
      </div>
      <div className="action-buttons">
        {isEditing ? (
          <>
            <input
              type="number"
              value={team1Score}
              onChange={(e) => setTeam1Score(Number(e.target.value))}
              min="0"
              placeholder="Team 1 Score"
            />
            <input
              type="number"
              value={team2Score}
              onChange={(e) => setTeam2Score(Number(e.target.value))}
              min="0"
              placeholder="Team 2 Score"
            />
            <button onClick={handleScoreSubmit}>Save Scores</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)}>
              {isUpcoming ? 'Record Scores' : 'Edit Scores'}
            </button>
            <button onClick={handleDeleteGame} className="delete-button">
              Delete Game
            </button>
          </>
        )}
      </div>
    </div>
  );
}

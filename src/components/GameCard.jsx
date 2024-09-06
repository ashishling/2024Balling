import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { PlayerScoresModal } from './PlayerScoresModal'; // We'll create this component next
import './GameCard.css';

export function GameCard({ game, onUpdateScore, onDeleteGame, isUpcoming, getPlayerName, navigate }) {
  const [localTeam1Score, setLocalTeam1Score] = useState(game.teams[0]?.score || 0);
  const [localTeam2Score, setLocalTeam2Score] = useState(game.teams[1]?.score || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [showPlayerScores, setShowPlayerScores] = useState(false);
  const [liveScoringCompleted, setLiveScoringCompleted] = useState(false);

  useEffect(() => {
    setLocalTeam1Score(game.teams[0]?.score || 0);
    setLocalTeam2Score(game.teams[1]?.score || 0);
    checkLiveScoringStatus();
  }, [game]);

  const checkLiveScoringStatus = async () => {
    if (game.status === 'completed') {
      const liveScoringGamesRef = collection(db, 'liveScoringGames');
      const q = query(liveScoringGamesRef, where('gameId', '==', game.id), where('status', '==', 'completed'));
      const querySnapshot = await getDocs(q);
      setLiveScoringCompleted(!querySnapshot.empty);
    }
  };

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

  const handleLiveScoringClick = async () => {
    try {
      const liveScoringGameData = {
        gameId: game.id,  // Store the original game ID
        date: game.date,
        teams: game.teams.map(team => ({
          ...team,
          players: team.players.map(playerId => ({
            id: playerId,
            name: getPlayerName(playerId),
            score: 0
          }))
        })),
        scoringHistory: [],
        status: 'in_progress'
      };

      const docRef = await addDoc(collection(db, 'liveScoringGames'), liveScoringGameData);
      console.log('LiveScoringGame created with ID: ', docRef.id);
      navigate(`/live-scoring/${docRef.id}`);
    } catch (error) {
      console.error('Error creating LiveScoringGame:', error);
    }
  };

  const handleViewPlayerScores = () => {
    console.log("Viewing player scores for game:", game.id);
    setShowPlayerScores(true);
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
        <div className="score-display">Points: {team.score}</div>
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
        {isUpcoming && (
          <button onClick={handleLiveScoringClick} className="live-scoring-button">
            Live Scoring
          </button>
        )}
        {game.status === 'completed' && !isEditing ? (
          <>
            <button onClick={() => setIsEditing(true)}>Edit Score</button>
            {liveScoringCompleted && (
              <button onClick={handleViewPlayerScores}>View Player Scores</button>
            )}
          </>
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
      {showPlayerScores && (
        <PlayerScoresModal
          gameId={game.id}
          onClose={() => setShowPlayerScores(false)}
          getPlayerName={getPlayerName}
        />
      )}
    </div>
  );
}

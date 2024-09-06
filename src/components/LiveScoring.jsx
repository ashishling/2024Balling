import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot, runTransaction, increment } from 'firebase/firestore';
import { db } from '../firebase';
import './LiveScoring.css';

export function LiveScoring({ getPlayerName }) {
  const { liveScoringGameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoringHistory, setScoringHistory] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState(null);

  useEffect(() => {
    const liveScoringGameRef = doc(db, 'liveScoringGames', liveScoringGameId);
    const unsubscribe = onSnapshot(liveScoringGameRef, (doc) => {
      if (doc.exists()) {
        const gameData = { id: doc.id, ...doc.data() };
        console.log("Game data:", gameData);
        setGame(gameData);
        setScoringHistory(gameData.scoringHistory || []);
        setLoading(false);
      } else {
        setError('Game not found');
        setLoading(false);
      }
    }, (err) => {
      setError('Error fetching game data: ' + err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [liveScoringGameId]);

  const addScore = async (teamIndex, playerId, points) => {
    if (!game) return;

    try {
      await runTransaction(db, async (transaction) => {
        const liveScoringGameRef = doc(db, 'liveScoringGames', liveScoringGameId);
        const liveScoringGameDoc = await transaction.get(liveScoringGameRef);

        if (!liveScoringGameDoc.exists()) {
          throw "Live scoring game not found";
        }

        const liveScoringGameData = liveScoringGameDoc.data();
        const updatedTeams = [...liveScoringGameData.teams];
        updatedTeams[teamIndex].score += points;
        const playerIndex = updatedTeams[teamIndex].players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          updatedTeams[teamIndex].players[playerIndex].score += points;
        }

        const newScoringEvent = {
          teamIndex,
          playerId,
          points,
          timestamp: new Date().toISOString()
        };

        transaction.update(liveScoringGameRef, {
          teams: updatedTeams,
          scoringHistory: [...liveScoringGameData.scoringHistory || [], newScoringEvent]
        });
      });

      console.log("Score added successfully");
      setSelectedTeam(null);
      setSelectedPoints(null);
    } catch (err) {
      setError('Error updating score: ' + err.message);
      console.error(err);
    }
  };

  const handlePointSelection = (teamIndex, points) => {
    setSelectedTeam(teamIndex);
    setSelectedPoints(points);
  };

  const handlePlayerSelection = (playerId) => {
    if (selectedTeam !== null && selectedPoints !== null) {
      addScore(selectedTeam, playerId, selectedPoints);
    }
  };

  const undoLastScore = async () => {
    if (scoringHistory.length === 0) return;

    try {
      const lastScore = scoringHistory[scoringHistory.length - 1];
      await runTransaction(db, async (transaction) => {
        const liveScoringGameRef = doc(db, 'liveScoringGames', liveScoringGameId);
        const liveScoringGameDoc = await transaction.get(liveScoringGameRef);

        if (!liveScoringGameDoc.exists()) {
          throw "Live scoring game not found";
        }

        const liveScoringGameData = liveScoringGameDoc.data();
        const updatedTeams = [...liveScoringGameData.teams];
        updatedTeams[lastScore.teamIndex].score -= lastScore.points;
        const playerIndex = updatedTeams[lastScore.teamIndex].players.findIndex(p => p.id === lastScore.playerId);
        if (playerIndex !== -1) {
          updatedTeams[lastScore.teamIndex].players[playerIndex].score -= lastScore.points;
        }

        transaction.update(liveScoringGameRef, {
          teams: updatedTeams,
          scoringHistory: liveScoringGameData.scoringHistory.slice(0, -1)
        });
      });

      console.log("Last score undone successfully");
    } catch (err) {
      setError('Error undoing last score: ' + err.message);
      console.error(err);
    }
  };

  const finishGame = async () => {
    if (!game) return;

    try {
      await runTransaction(db, async (transaction) => {
        const liveScoringGameRef = doc(db, 'liveScoringGames', liveScoringGameId);
        const gameRef = doc(db, 'games', game.gameId);

        const liveScoringGameDoc = await transaction.get(liveScoringGameRef);
        const gameDoc = await transaction.get(gameRef);

        if (!liveScoringGameDoc.exists() || !gameDoc.exists()) {
          throw "Game document not found";
        }

        const liveScoringGameData = liveScoringGameDoc.data();

        // Determine the winning team
        const winningTeamIndex = liveScoringGameData.teams[0].score > liveScoringGameData.teams[1].score ? 0 : 1;

        // Update player stats
        for (let i = 0; i < liveScoringGameData.teams.length; i++) {
          const team = liveScoringGameData.teams[i];
          const isWinningTeam = i === winningTeamIndex;

          for (const player of team.players) {
            const playerRef = doc(db, 'players', player.id);
            transaction.update(playerRef, {
              gamesPlayed: increment(1),
              wins: increment(isWinningTeam ? 1 : 0),
              losses: increment(isWinningTeam ? 0 : 1),
              totalPoints: increment(player.score)
            });
          }
        }

        // Update game status
        transaction.update(gameRef, {
          status: 'completed',
          teams: liveScoringGameData.teams.map(team => ({
            name: team.name,
            players: team.players.map(player => player.id),
            score: team.score
          }))
        });

        // Update live scoring game status
        transaction.update(liveScoringGameRef, { status: 'completed' });
      });

      console.log("Game finished successfully");
      navigate('/games');
    } catch (err) {
      setError('Error finishing game: ' + err.message);
      console.error(err);
    }
  };

  const handleBackToGames = () => {
    if (game && game.status !== 'completed') {
      const confirmLeave = window.confirm('The game is not finished. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/games');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!game) return <div>No game data available</div>;

  return (
    <div className="live-scoring">
      <h2>Live Scoring</h2>
      <div className="teams-container">
        {game.teams.map((team, teamIndex) => (
          <div key={teamIndex} className="team-scoring">
            <h3>{team.name}</h3>
            <div className="player-list">
              {team.players.map((player) => (
                <div key={player.id} className="player-item">
                  <span className="player-name">{getPlayerName(player.id)}</span>
                  <span className="player-score">{player.score}</span>
                </div>
              ))}
            </div>
            <p className="team-score">Team Score: {team.score}</p>
            <div className="scoring-buttons">
              <button onClick={() => handlePointSelection(teamIndex, 1)}>+1</button>
              <button onClick={() => handlePointSelection(teamIndex, 2)}>+2</button>
              <button onClick={() => handlePointSelection(teamIndex, 3)}>+3</button>
            </div>
            {selectedTeam === teamIndex && selectedPoints !== null && (
              <div className="player-selection">
                <h4>Select player who scored {selectedPoints} points:</h4>
                {team.players.map((player) => (
                  <button key={player.id} onClick={() => handlePlayerSelection(player.id)}>
                    {getPlayerName(player.id)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="scoring-history">
        <h3>Scoring History</h3>
        <ul>
          {scoringHistory.map((event, index) => (
            <li key={index}>
              {getPlayerName(event.playerId)} ({game.teams[event.teamIndex].name}) scored {event.points} points
            </li>
          ))}
        </ul>
      </div>
      <div className="action-buttons">
        <button onClick={undoLastScore}>Undo Last Score</button>
        <button onClick={finishGame}>Finish Game</button>
        <button onClick={handleBackToGames}>Back to Games</button>
      </div>
    </div>
  );
}
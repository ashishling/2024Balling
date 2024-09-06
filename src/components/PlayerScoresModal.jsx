import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './PlayerScoresModal.css';

export function PlayerScoresModal({ gameId, onClose, getPlayerName }) {
  const [teamScores, setTeamScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerScores = async () => {
      console.log("Fetching player scores for gameId:", gameId);
      try {
        const liveScoringGamesRef = collection(db, 'liveScoringGames');
        const q = query(liveScoringGamesRef, where('gameId', '==', gameId), where('status', '==', 'completed'));
        const querySnapshot = await getDocs(q);
        
        console.log("Query snapshot size:", querySnapshot.size);
        
        if (!querySnapshot.empty) {
          const liveScoringGame = querySnapshot.docs[0].data();
          console.log("Live scoring game data:", liveScoringGame);
          
          const processedTeamScores = liveScoringGame.teams.map(team => ({
            name: team.name,
            score: team.score,
            players: team.players
              .map(player => ({
                id: player.id,
                name: getPlayerName(player.id),
                score: player.score
              }))
              .sort((a, b) => b.score - a.score) // Sort players by score descending
          }));

          console.log("Processed team scores:", processedTeamScores);
          setTeamScores(processedTeamScores);
        } else {
          console.log("No completed live scoring game found for gameId:", gameId);
          setError('No completed live scoring game found');
        }
      } catch (err) {
        console.error("Error fetching player scores:", err);
        setError('Error fetching player scores: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerScores();
  }, [gameId, getPlayerName]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Player Scores</h2>
        {loading && <div>Loading player scores...</div>}
        {error && <div>Error: {error}</div>}
        {!loading && !error && (
          teamScores.length > 0 ? (
            teamScores.map((team, teamIndex) => (
              <div key={teamIndex} className="team-scores">
                <h3>{team.name} - Total Score: {team.score}</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.players.map((player, playerIndex) => (
                      <tr key={playerIndex}>
                        <td>{player.name}</td>
                        <td>{player.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <p>No player scores available.</p>
          )
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

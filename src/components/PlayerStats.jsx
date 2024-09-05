import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './PlayerStats.css';

export function PlayerStats() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const playersCollection = collection(db, 'players');
      const playerSnapshot = await getDocs(playersCollection);
      const playerList = playerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlayers(playerList);
    };

    fetchPlayers();
  }, []);

  return (
    <div className="player-stats">
      <h2>Player Stats</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.id}>
              <td>{player.name}</td>
              <td>{player.position}</td>
              <td>{player.wins || 0}</td>
              <td>{player.losses || 0}</td>
              <td>
                {player.wins || player.losses
                  ? `${(
                      (player.wins / (player.wins + player.losses)) *
                      100
                    ).toFixed(2)}%`
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

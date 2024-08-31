import React, { useState } from 'react';

export const TeamSelection = ({ allPlayers, onSelectPlayers }) => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const togglePlayerSelection = (player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else if (selectedPlayers.length < 16) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleSubmit = () => {
    if (selectedPlayers.length === 16) {
      onSelectPlayers(selectedPlayers);
    }
  };

  return (
    <div>
      <h2>Select 16 players for the game:</h2>
      <ul>
        {allPlayers.map(player => (
          <li key={player.id}>
            <input
              type="checkbox"
              checked={selectedPlayers.some(p => p.id === player.id)}
              onChange={() => togglePlayerSelection(player)}
            />
            {player.name} - {player.position} (Skill: {player.skillLevel})
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit} disabled={selectedPlayers.length !== 16}>
        Create Teams
      </button>
    </div>
  );
};

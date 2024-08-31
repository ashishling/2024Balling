import React, { useState } from 'react';

export function PlayerList({ players, onRemovePlayer, onEditPlayer }) {
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editedPosition, setEditedPosition] = useState('');
  const [editedSkillLevel, setEditedSkillLevel] = useState('');

  if (!players || players.length === 0) {
    return <p>No players available.</p>;
  }

  const handleEditClick = (player) => {
    setEditingPlayer(player);
    setEditedPosition(player.position);
    setEditedSkillLevel(player.skillLevel);
  };

  const handleSaveEdit = () => {
    onEditPlayer(editingPlayer.name, editedPosition, Number(editedSkillLevel));
    setEditingPlayer(null);
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
  };

  const columns = [[], [], []];
  players.forEach((player, index) => {
    columns[index % 3].push(player);
  });

  return (
    <div className="player-list-columns">
      {columns.map((column, columnIndex) => (
        <ul key={columnIndex} className="player-column">
          {column.map((player) => (
            <li key={player.name}>
              {editingPlayer === player ? (
                <div className="edit-player">
                  <span>{player.name}</span>
                  <select
                    value={editedPosition}
                    onChange={(e) => setEditedPosition(e.target.value)}
                  >
                    <option value="Guard">Guard</option>
                    <option value="Forward">Forward</option>
                    <option value="Center">Center</option>
                  </select>
                  <input
                    type="number"
                    value={editedSkillLevel}
                    onChange={(e) => setEditedSkillLevel(e.target.value)}
                    min="1"
                    max="10"
                  />
                  <button onClick={handleSaveEdit}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </div>
              ) : (
                <div className="player-info">
                  <span>{player.name} - {player.position} (Skill: {player.skillLevel})</span>
                  <div className="player-actions">
                    <button onClick={() => handleEditClick(player)}>Edit</button>
                    <button onClick={() => onRemovePlayer(player.name)}>Remove</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

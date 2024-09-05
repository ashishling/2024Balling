import React, { useState } from 'react';
import './PlayerList.css';

export function PlayerList({ players = [], onRemovePlayer, onEditPlayer }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', position: '', skillLevel: '' });

  const handleEdit = (player) => {
    setEditingId(player.id);
    setEditForm({ name: player.name, position: player.position, skillLevel: player.skillLevel });
  };

  const handleSave = (id) => {
    onEditPlayer(id, editForm);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      onRemovePlayer(id);
    }
  };

  return (
    <div className="player-list">
      <h2>Player List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Skill Level</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players && players.length > 0 ? (
            players.map((player) => (
              <tr key={player.id}>
                {editingId === player.id ? (
                  <>
                    <td><input name="name" value={editForm.name} onChange={handleChange} /></td>
                    <td><input name="position" value={editForm.position} onChange={handleChange} /></td>
                    <td><input name="skillLevel" type="number" value={editForm.skillLevel} onChange={handleChange} /></td>
                    <td>
                      <button className="save-button" onClick={() => handleSave(player.id)}>Save</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{player.name}</td>
                    <td>{player.position}</td>
                    <td>Skill: {player.skillLevel}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEdit(player)}>Edit</button>
                      <button className="delete-button" onClick={() => handleDelete(player.id, player.name)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No players available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

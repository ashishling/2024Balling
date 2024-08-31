import React, { useState } from 'react';
import './PlayerInput.css'; // Make sure to create this CSS file

export function PlayerInput({ onAddPlayer }) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('Guard');
  const [skillLevel, setSkillLevel] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddPlayer({ name, position, skillLevel: Number(skillLevel) });
    setName('');
    setPosition('Guard');
    setSkillLevel(1);
  };

  return (
    <form onSubmit={handleSubmit} className="player-input-form">
      <div className="input-group">
        <label>Player Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter player name"
          required
        />
      </div>
      <div className="input-group">
        <label>Player Position</label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
        >
          <option value="Guard">Guard</option>
          <option value="Forward">Forward</option>
          <option value="Center">Center</option>
        </select>
      </div>
      <div className="input-group">
        <label>Player Skill</label>
        <input
          type="number"
          value={skillLevel}
          onChange={(e) => setSkillLevel(e.target.value)}
          min="1"
          max="10"
          required
        />
      </div>
      <button type="submit">Add Player</button>
    </form>
  );
}

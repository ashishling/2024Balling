import React, { useState, useEffect } from 'react';
import { Player } from '../models/Player';
import './WeeklySelection.css'; // We'll create this CSS file

export function WeeklySelection({ allPlayers, onUpdateWeeklyPlayers, onGenerateTeams, onReset }) {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [temporaryPlayers, setTemporaryPlayers] = useState([]);
  const [newTempPlayer, setNewTempPlayer] = useState({ name: '', position: 'Guard', skillLevel: 1 });

  useEffect(() => {
    setSelectedPlayers([]);
    setTemporaryPlayers([]);
  }, [allPlayers]);

  const togglePlayerSelection = (player) => {
    setSelectedPlayers(prevSelected => {
      const isSelected = prevSelected.some(p => p.name === player.name);
      if (isSelected) {
        return prevSelected.filter(p => p.name !== player.name);
      } else {
        return [...prevSelected, player];
      }
    });
  };

  const handleGenerateTeams = () => {
    if (selectedPlayers.length + temporaryPlayers.length < 2) {
      alert("Please select at least 2 players for the weekly game.");
      return;
    }
    onUpdateWeeklyPlayers([...selectedPlayers, ...temporaryPlayers]);
  };

  const handleSelectAll = () => {
    setSelectedPlayers(prevSelected => 
      prevSelected.length === allPlayers.length ? [] : [...allPlayers]
    );
  };

  const handleReset = () => {
    setSelectedPlayers([]);
    setTemporaryPlayers([]);
    onReset();
  };

  const handleAddTempPlayer = (e) => {
    e.preventDefault();
    if (temporaryPlayers.length >= 2) {
      alert("Maximum of 2 temporary players allowed.");
      return;
    }
    const tempPlayer = new Player(newTempPlayer.name, newTempPlayer.position, parseInt(newTempPlayer.skillLevel));
    setTemporaryPlayers([...temporaryPlayers, tempPlayer]);
    setNewTempPlayer({ name: '', position: 'Guard', skillLevel: 1 });
  };

  const handleTempPlayerInputChange = (e) => {
    const { name, value } = e.target;
    setNewTempPlayer({ ...newTempPlayer, [name]: value });
  };

  // Split players into two columns
  const midpoint = Math.ceil(allPlayers.length / 2);
  const leftColumnPlayers = allPlayers.slice(0, midpoint);
  const rightColumnPlayers = allPlayers.slice(midpoint);

  return (
    <div className="weekly-selection">
      <h2>Select Confirmed Players for Game</h2>
      <div className="selection-actions">
        <button onClick={handleSelectAll} className="select-all-btn">
          {selectedPlayers.length === allPlayers.length ? 'Deselect All' : 'Select All'}
        </button>
        <button onClick={handleReset} className="reset-btn">Reset</button>
      </div>
      <div className="player-columns">
        <ul className="player-list">
          {leftColumnPlayers.map((player, index) => (
            <li key={index} className="player-item">
              <label className="player-label">
                <input 
                  type="checkbox" 
                  checked={selectedPlayers.some(p => p.name === player.name)}
                  onChange={() => togglePlayerSelection(player)}
                  className="player-checkbox"
                />
                <span className="player-name">{player.name} - {player.position}</span>
              </label>
            </li>
          ))}
        </ul>
        <ul className="player-list">
          {rightColumnPlayers.map((player, index) => (
            <li key={index} className="player-item">
              <label className="player-label">
                <input 
                  type="checkbox" 
                  checked={selectedPlayers.some(p => p.name === player.name)}
                  onChange={() => togglePlayerSelection(player)}
                  className="player-checkbox"
                />
                <span className="player-name">{player.name} - {player.position}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <h3>Add +1s for the week</h3>
      <div className="temporary-player-form">
        <form onSubmit={handleAddTempPlayer}>
          <input
            type="text"
            name="name"
            value={newTempPlayer.name}
            onChange={handleTempPlayerInputChange}
            placeholder="Name"
            required
          />
          <select
            name="position"
            value={newTempPlayer.position}
            onChange={handleTempPlayerInputChange}
            required
          >
            <option value="Guard">Guard</option>
            <option value="Forward">Forward</option>
            <option value="Center">Center</option>
          </select>
          <input
            type="number"
            name="skillLevel"
            value={newTempPlayer.skillLevel}
            onChange={handleTempPlayerInputChange}
            min="1"
            max="10"
            required
          />
          <button type="submit">Add</button>
        </form>
      </div>
      {temporaryPlayers.length > 0 && (
        <div className="temporary-players-list">
          <h4>Temporary Players</h4>
          <ul>
            {temporaryPlayers.map((player, index) => (
              <li key={index}>{player.name} - {player.position} (Skill: {player.skillLevel})</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleGenerateTeams} className="generate-teams-btn">Generate Teams</button>
    </div>
  );
}

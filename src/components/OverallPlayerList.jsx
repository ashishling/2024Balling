import React from 'react';
import { PlayerInput } from './PlayerInput';
import { PlayerList } from './PlayerList';

export function OverallPlayerList({ allPlayers, addPlayer, removePlayer, onEditPlayer }) {
  return (
    <div className="overall-list-container">
      <div className="player-input-section">
        <h2>Add New Player</h2>
        <PlayerInput onAddPlayer={addPlayer} />
      </div>
      <div className="player-list-section">
        <h2>Overall Player List</h2>
        <PlayerList players={allPlayers} onRemovePlayer={removePlayer} onEditPlayer={onEditPlayer} /> {/* Pass onEditPlayer */}
      </div>
    </div>
  );
}
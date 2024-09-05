import React from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PlayerInput } from './PlayerInput';
import { PlayerList } from './PlayerList';
import './OverallPlayerList.css';

export function OverallPlayerList({ allPlayers }) {
  const addPlayer = async (player) => {
    try {
      await addDoc(collection(db, 'players'), player);
    } catch (error) {
      console.error("Error adding player: ", error);
    }
  };

  const removePlayer = async (id) => {
    try {
      await deleteDoc(doc(db, 'players', id));
    } catch (error) {
      console.error("Error deleting player: ", error);
    }
  };

  const editPlayer = async (id, updatedPlayer) => {
    try {
      await updateDoc(doc(db, 'players', id), updatedPlayer);
    } catch (error) {
      console.error("Error updating player: ", error);
    }
  };

  return (
    <div className="overall-list-container">
      <div className="player-input-section">
        <h2>Add New Player</h2>
        <PlayerInput onAddPlayer={addPlayer} />
      </div>
      <div className="player-list-section">
        <h2>Overall Player List</h2>
        <div className="player-count">Total Players: {allPlayers.length}</div>
        <PlayerList 
          players={allPlayers} 
          onRemovePlayer={removePlayer}
          onEditPlayer={editPlayer}
        />
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Player } from '../models/Player';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './WeeklySelection.css';

export function WeeklySelection({ 
  allPlayers, 
  onUpdateWeeklyPlayers, 
  onGenerateTeams,  // Make sure this prop is named correctly
  onReset, 
  onCreateGame, 
  currentGame, 
  recordScores, 
  teams = [], // Provide a default empty array
  setTeams 
}) {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [temporaryPlayers, setTemporaryPlayers] = useState([]);
  const [newTempPlayer, setNewTempPlayer] = useState({ name: '', position: 'Guard', skillLevel: 1 });
  const [gameDate, setGameDate] = useState('');
  const navigate = useNavigate();
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  useEffect(() => {
    // Reset selected players and temporary players when allPlayers changes
    setSelectedPlayers([]);
    setTemporaryPlayers([]);
  }, [allPlayers]);

  // Reset state when currentGame is null (after recording scores)
  useEffect(() => {
    if (!currentGame) {
      setSelectedPlayers([]);
      setTemporaryPlayers([]);
      setGameDate(''); // Reset game date
    }
  }, [currentGame]);

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
    onGenerateTeams([...selectedPlayers, ...temporaryPlayers]);  // Pass the selected players to onGenerateTeams
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

  const handleAddTempPlayer = async (e) => {
    e.preventDefault();
    if (temporaryPlayers.length >= 2) {
      alert("Maximum of 2 temporary players allowed.");
      return;
    }

    setIsAddingPlayer(true);

    try {
      // Add the new player to Firestore
      const docRef = await addDoc(collection(db, 'players'), {
        name: newTempPlayer.name,
        position: newTempPlayer.position,
        skillLevel: parseInt(newTempPlayer.skillLevel)
      });

      // Create a new Player object with the Firestore ID
      const tempPlayer = new Player(
        newTempPlayer.name, 
        newTempPlayer.position, 
        parseInt(newTempPlayer.skillLevel),
        docRef.id
      );

      // Update local state
      setTemporaryPlayers(prevPlayers => [...prevPlayers, tempPlayer]);
      setNewTempPlayer({ name: '', position: 'Guard', skillLevel: 1 });

      // Optionally, you can update the allPlayers state here or in the parent component
      // For example:
      // onUpdateWeeklyPlayers([...allPlayers, tempPlayer]);

    } catch (error) {
      console.error("Error adding temporary player: ", error);
      alert("Failed to add temporary player. Please try again.");
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const handleTempPlayerInputChange = (e) => {
    const { name, value } = e.target;
    setNewTempPlayer({ ...newTempPlayer, [name]: value });
  };

  const handleCreateGame = (e) => {
    e.preventDefault();
    console.log("Creating game with date:", gameDate);
    onCreateGame(gameDate);
    setGameDate('');
  };

  // Sort players alphabetically by name
  const sortedPlayers = useMemo(() => {
    return [...allPlayers].sort((a, b) => a.name.localeCompare(b.name));
  }, [allPlayers]);

  // Split players into two columns
  const midpoint = Math.ceil(allPlayers.length / 2);
  const leftColumnPlayers = allPlayers.slice(0, midpoint);
  const rightColumnPlayers = allPlayers.slice(midpoint);

  const swapPlayer = (playerIndex, fromTeam) => {
    if (!teams || teams.length < 2) return; // Add this check
    const updatedTeams = [...teams];
    const player = updatedTeams[fromTeam].players.splice(playerIndex, 1)[0];
    updatedTeams[fromTeam === 0 ? 1 : 0].players.push(player);
    setTeams(updatedTeams);
  };

  // Calculate total selected players
  const totalSelectedPlayers = useMemo(() => {
    return selectedPlayers.length + temporaryPlayers.length;
  }, [selectedPlayers, temporaryPlayers]);

  return (
    <div className="weekly-selection">
      {/* Section 1: Player Selection */}
      <div className="player-selection">
        <h2>Select Confirmed Players for Game</h2>
        <div className="selection-actions">
          <button onClick={handleSelectAll} className="select-all-btn">
            {selectedPlayers.length === allPlayers.length ? 'Deselect All' : 'Select All'}
          </button>
          <button onClick={handleReset} className="reset-btn">Reset</button>
        </div>
        <div className="player-grid">
          {sortedPlayers.map((player, index) => (
            <div key={index} className="player-item">
              <label className="player-label">
                <input 
                  type="checkbox" 
                  checked={selectedPlayers.some(p => p.name === player.name)}
                  onChange={() => togglePlayerSelection(player)}
                  className="player-checkbox"
                />
                <span className="player-name">{player.name} - {player.position}</span>
              </label>
            </div>
          ))}
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
            <button type="submit" disabled={isAddingPlayer}>
              {isAddingPlayer ? 'Adding...' : 'Add'}
            </button>
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
        {/* Generate Teams Button and Player Count */}
        <div className="generate-teams-section">
          <button 
            onClick={handleGenerateTeams} 
            className="generate-teams-btn"
            disabled={totalSelectedPlayers < 2}
          >
            Generate Teams
          </button>
          <div className="player-count">
            Selected Players: {totalSelectedPlayers}
          </div>
        </div>
      </div>

      {/* Section 2: Generated Teams */}
      {teams && teams.length > 0 && (
        <div className="generated-teams">
          <h2>Generated Teams</h2>
          <div className="teams-list">
            {teams.map((team, teamIndex) => (
              <div key={teamIndex} className="team">
                <h3>Team {teamIndex + 1}</h3>
                <ul>
                  {team.players.map((player, playerIndex) => (
                    <li key={playerIndex}>
                      <span>{player.name} - {player.position}</span>
                      <button 
                        onClick={() => swapPlayer(playerIndex, teamIndex)}
                        className="swap-button"
                      >
                        Swap
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Create Game */}
      {teams && teams.length > 0 && !currentGame && (
        <div className="game-creation">
          <h2>Confirm Players and Create Game</h2>
          <form onSubmit={handleCreateGame}>
            <label>
              Game Date:
              <input
                type="date"
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                required
              />
            </label>
            <button type="submit">Confirm Players and Create Game</button>
          </form>
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { WeeklySelection } from './WeeklySelection';

export function WeeklySelectionContainer({
  allPlayers,
  updateWeeklyPlayers,
  createTeams,
  handleReset,
  createGame,
  currentGame,
  recordScores,
  teams,
  setTeams // Add this line
}) {
  return (
    <div className="weekly-container">
      <div className="weekly-selection-container">
        <WeeklySelection 
          allPlayers={allPlayers} 
          onUpdateWeeklyPlayers={updateWeeklyPlayers}
          onGenerateTeams={createTeams}
          onReset={handleReset}
          onCreateGame={createGame}
          currentGame={currentGame}
          recordScores={recordScores}
          teams={teams}
          setTeams={setTeams} // Now this is defined
        />
      </div>
    </div>
  );
}
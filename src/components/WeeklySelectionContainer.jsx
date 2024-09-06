import React from 'react';
import { WeeklySelection } from './WeeklySelection';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export function WeeklySelectionContainer({ 
  allPlayers, 
  onUpdateWeeklyPlayers,  // Changed from updateWeeklyPlayers
  onGenerateTeams, 
  handleReset, 
  teams,
  setTeams
}) {
  const navigate = useNavigate();

  const createGame = async (date) => {
    try {
      console.log("Creating game with date:", date);
      console.log("Teams data:", teams);

      const gameData = {
        date,
        teams: teams.map((team, index) => ({
          name: `Team ${index + 1}`,
          players: team.players.map(player => player.id || player.name),
          score: 0
        })),
        status: 'upcoming'
      };

      console.log("Game data to be sent to Firebase:", gameData);

      const docRef = await addDoc(collection(db, 'games'), gameData);
      console.log("Game created with ID: ", docRef.id);
      navigate('/games');
    } catch (error) {
      console.error("Error creating game: ", error);
    }
  };

  return (
    <WeeklySelection
      allPlayers={allPlayers}
      onUpdateWeeklyPlayers={onUpdateWeeklyPlayers}  // This now matches
      onGenerateTeams={onGenerateTeams}
      onReset={handleReset}
      onCreateGame={createGame}
      teams={teams}
      setTeams={setTeams}
    />
  );
}
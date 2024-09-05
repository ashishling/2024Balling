import React, { useState, useEffect, useCallback } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { Player } from './models/Player';
import { Team } from './models/Team';
import { TabNavigation } from './components/TabNavigation';
import { OverallPlayerList } from './components/OverallPlayerList';
import { WeeklySelectionContainer } from './components/WeeklySelectionContainer';
import { GameManagement } from './components/GameManagement';
import { createBalancedTeams } from './utils/teambalancer';
import './App.css';

function App() {
  const [allPlayers, setAllPlayers] = useState(() => {
    const storedPlayers = localStorage.getItem('basketballPlayers');
    console.log('Initial load from storage:', storedPlayers);
    if (storedPlayers) {
      try {
        const parsedPlayers = JSON.parse(storedPlayers);
        console.log('Initial parsed players:', parsedPlayers);
        if (Array.isArray(parsedPlayers)) {
          return parsedPlayers.map(p => new Player(p.name, p.position, p.skillLevel));
        }
      } catch (error) {
        console.error('Error parsing stored players:', error);
      }
    }
    return [];
  });

  const [weeklyPlayers, setWeeklyPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [games, setGames] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');
  const navigate = useNavigate();
  const location = useLocation();
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [pastGames, setPastGames] = useState([]);

  // Function to update game lists
  const updateGameLists = useCallback(() => {
    const currentDate = new Date();
    const upcoming = games.filter(game => new Date(game.date) > currentDate);
    const past = games.filter(game => new Date(game.date) <= currentDate);
    setUpcomingGames(upcoming);
    setPastGames(past);
  }, [games]);

  // Use effect to update game lists whenever games change
  useEffect(() => {
    updateGameLists();
  }, [games, updateGameLists]);

  useEffect(() => {
    console.log('allPlayers state updated:', allPlayers);
    console.log('Saving to storage:', JSON.stringify(allPlayers));
    localStorage.setItem('basketballPlayers', JSON.stringify(allPlayers));
  }, [allPlayers]);

  useEffect(() => {
    // Update activeTab based on the current route
    const path = location.pathname;
    if (path === '/overall') {
      setActiveTab('overall');
    } else if (path === '/weekly') {
      setActiveTab('weekly');
    } else if (path === '/games') {
      setActiveTab('games');
    }
  }, [location]);

  const addPlayer = useCallback((player) => {
    console.log('Adding player:', player);
    setAllPlayers(prevPlayers => [...prevPlayers, player]);
  }, []);

  const removePlayer = useCallback((name) => {
    setAllPlayers(prevPlayers => prevPlayers.filter(player => player.name !== name));
  }, []);

  const updateWeeklyPlayers = useCallback((selectedPlayers) => {
    setWeeklyPlayers(selectedPlayers);
  }, []);

  useEffect(() => {
    if (weeklyPlayers.length >= 2) {
      createTeams();
    }
  }, [weeklyPlayers]);

  const createTeams = useCallback(() => {
    const generatedTeams = createBalancedTeams(weeklyPlayers);
    console.log('Generated teams:', generatedTeams); // Add this line for debugging
    setTeams(generatedTeams.map(team => ({
      players: team.players.map(player => ({
        name: player.name,
        position: player.position,
        skillLevel: player.skillLevel
      }))
    })));
  }, [weeklyPlayers]);

  const handleReset = useCallback(() => {
    setWeeklyPlayers([]);
    setTeams([]);
  }, []);

  const createGame = useCallback((date) => {
    const newGame = {
      id: upcomingGames.length + pastGames.length + 1,
      date,
      teams: teams.map(team => ({
        ...team,
        players: team.players.map(player => ({
          name: player.name,
          position: player.position,
          skillLevel: player.skillLevel
        }))
      })),
      team1Score: 0,
      team2Score: 0,
    };
    console.log('Creating new game:', newGame); // Add this line for debugging
    setUpcomingGames(prevGames => [...prevGames, newGame]);
    navigate('/game-management');
  }, [teams, upcomingGames.length, pastGames.length, navigate]);

  const recordScores = useCallback((team1Score, team2Score) => {
    const updatedGame = {
      ...currentGame,
      team1Score,
      team2Score
    };

    setGames(prevGames => [...prevGames, updatedGame]);

    // Update player wins and losses
    if (team1Score > team2Score) {
      currentGame.teams[0].players.forEach(player => player.recordWin());
      currentGame.teams[1].players.forEach(player => player.recordLoss());
    } else {
      currentGame.teams[0].players.forEach(player => player.recordLoss());
      currentGame.teams[1].players.forEach(player => player.recordWin());
    }

    // Save updated players to local storage
    setAllPlayers([...allPlayers]);
    setCurrentGame(null); // Reset currentGame to null
  }, [currentGame, allPlayers]);

  const handleUpdateScore = useCallback((gameId, team1Score, team2Score) => {
    const updateGame = (games) => games.map(game => 
      game.id === gameId ? { ...game, team1Score, team2Score } : game
    );

    setUpcomingGames(prevGames => {
      const updatedGames = updateGame(prevGames);
      const completedGame = updatedGames.find(game => game.id === gameId);
      if (completedGame) {
        setPastGames(prevPastGames => [...prevPastGames, completedGame]);
        return updatedGames.filter(game => game.id !== gameId);
      }
      return updatedGames;
    });

    setPastGames(prevGames => updateGame(prevGames));
  }, []);

  const editPlayer = useCallback((name, position, skillLevel) => {
    setAllPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.name === name ? { ...player, position, skillLevel } : player
      )
    );
  }, []);

  const onDeleteGame = useCallback((gameId) => {
    setGames(prevGames => {
      const updatedGames = prevGames.filter(game => game.id !== gameId);
      // Update localStorage
      localStorage.setItem('games', JSON.stringify(updatedGames));
      return updatedGames;
    });
    // No need to call updateGameLists() here as it will be triggered by the useEffect
  }, []);

  console.log('Rendering App with allPlayers:', allPlayers);

  return (
    <div className="App">
      <header className="App-header">
        <h1>2024 Balling</h1>
      </header>
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="App-main">
        <Routes>
          <Route path="/overall" element={
            <OverallPlayerList 
              allPlayers={allPlayers} 
              addPlayer={addPlayer} 
              removePlayer={removePlayer} 
              onEditPlayer={editPlayer} // Pass the editPlayer function
            />
          } />
          <Route path="/weekly" element={
            <WeeklySelectionContainer 
              allPlayers={allPlayers} 
              updateWeeklyPlayers={updateWeeklyPlayers}
              createTeams={createTeams}
              handleReset={handleReset}
              createGame={createGame}
              currentGame={currentGame}
              recordScores={recordScores}
              teams={teams}
              setTeams={setTeams} // Add this line
            />
          } />
          <Route path="/games" element={
            <GameManagement 
              upcomingGames={upcomingGames}
              pastGames={pastGames}
              onUpdateScore={handleUpdateScore}
              onDeleteGame={onDeleteGame} // Make sure this is here
            />
          } />
          <Route path="/game-management" element={
            <GameManagement 
              upcomingGames={upcomingGames}
              pastGames={pastGames}
              onUpdateScore={handleUpdateScore}
            />
          } />
          <Route path="/" element={
            <WeeklySelectionContainer 
              allPlayers={allPlayers} 
              updateWeeklyPlayers={updateWeeklyPlayers}
              createTeams={createTeams}
              handleReset={handleReset}
              createGame={createGame}
              currentGame={currentGame}
              recordScores={recordScores}
              teams={teams}
            />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
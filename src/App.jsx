import React, { useState, useEffect, useCallback } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Player } from './models/Player';
import { Team } from './models/Team';
import { TabNavigation } from './components/TabNavigation';
import { OverallPlayerList } from './components/OverallPlayerList';
import { WeeklySelectionContainer } from './components/WeeklySelectionContainer';
import { GameManagement } from './components/GameManagement';
import { createBalancedTeams } from './utils/teambalancer';
import './App.css';
import { AdminPage } from './components/AdminPage';
import { PlayerStats } from './components/PlayerStats';

function App() {
  const [allPlayers, setAllPlayers] = useState([]);
  const [weeklyPlayers, setWeeklyPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [games, setGames] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');
  const navigate = useNavigate();
  const location = useLocation();
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [pastGames, setPastGames] = useState([]);

  useEffect(() => {
    // Listen for changes in the players collection
    const unsubscribePlayers = onSnapshot(query(collection(db, 'players')), (snapshot) => {
      const playersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return new Player(data.name, data.position, data.skillLevel, doc.id);
      });
      setAllPlayers(playersData);
    }, (error) => {
      console.error("Error fetching players:", error);
    });

    // Listen for changes in the games collection
    const gamesQuery = query(collection(db, 'games'));
    const unsubscribeGames = onSnapshot(gamesQuery, (snapshot) => {
      const gamesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const currentDate = new Date();
      const upcoming = gamesData.filter(game => new Date(game.date) > currentDate || game.status !== 'completed');
      const past = gamesData.filter(game => new Date(game.date) <= currentDate && game.status === 'completed');
      
      setUpcomingGames(upcoming);
      setPastGames(past);
    }, (error) => {
      console.error("Error fetching games:", error);
    });

    // Cleanup function
    return () => {
      unsubscribePlayers();
      unsubscribeGames();
    };
  }, []);

  const updateGameLists = useCallback((gamesData) => {
    const currentDate = new Date();
    const upcoming = gamesData.filter(game => new Date(game.date) > currentDate);
    const past = gamesData.filter(game => new Date(game.date) <= currentDate);
    setUpcomingGames(upcoming);
    setPastGames(past);
  }, []);

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
    // This will be handled by Firestore listener
  }, []);

  const removePlayer = useCallback((id) => {
    // This will be handled by Firestore listener
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
    console.log('Generated teams:', generatedTeams);
    setTeams(generatedTeams.map(team => new Team(team.players)));
  }, [weeklyPlayers]);

  const handleReset = useCallback(() => {
    setWeeklyPlayers([]);
    setTeams([]);
  }, []);

  // Remove this function
  // const createGame = useCallback((date) => {
  //   // This will be handled in the WeeklySelectionContainer component
  // }, [teams, upcomingGames.length, pastGames.length, navigate]);

  const recordScores = useCallback((team1Score, team2Score) => {
    // This will be handled in the GameManagement component
  }, [currentGame, allPlayers]);

  const handleUpdateScore = useCallback((gameId, team1Score, team2Score) => {
    // This will be handled in the GameManagement component
  }, []);

  const editPlayer = useCallback((id, position, skillLevel) => {
    // This will be handled by Firestore listener
  }, []);

  const onDeleteGame = useCallback((gameId) => {
    // This will be handled in the GameManagement component
  }, []);

  const handleGameUpdated = (gameId, updatedData) => {
    setUpcomingGames(prevGames => 
      prevGames.filter(game => game.id !== gameId)
    );
    setPastGames(prevGames => [
      ...prevGames,
      { ...prevGames.find(game => game.id === gameId), ...updatedData }
    ]);
  };

  const handleGameDeleted = (gameId) => {
    setUpcomingGames(prevGames => prevGames.filter(game => game.id !== gameId));
    setPastGames(prevGames => prevGames.filter(game => game.id !== gameId));
  };

  console.log('Rendering App with allPlayers:', allPlayers);

  return (
    <div className="App">
      <header className="App-header">
        <h1>2024 Balling</h1>
      </header>
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="App-main">
        <Routes>
          <Route path="/overall" element={<OverallPlayerList allPlayers={allPlayers} />} />
          <Route path="/weekly" element={
            <WeeklySelectionContainer 
              allPlayers={allPlayers} 
              updateWeeklyPlayers={updateWeeklyPlayers}
              createTeams={createTeams}
              handleReset={handleReset}
              teams={teams}
              setTeams={setTeams}
            />
          } />
          <Route path="/games" element={
            <GameManagement 
              upcomingGames={upcomingGames}
              pastGames={pastGames}
              onGameUpdated={handleGameUpdated}
              onGameDeleted={handleGameDeleted}
            />
          } />
          <Route path="/game-management" element={
            <GameManagement 
              upcomingGames={upcomingGames}
              pastGames={pastGames}
              onUpdateScore={handleUpdateScore}
              onDeleteGame={onDeleteGame}
            />
          } />
          <Route path="/" element={
            <WeeklySelectionContainer 
              allPlayers={allPlayers} 
              updateWeeklyPlayers={updateWeeklyPlayers}
              createTeams={createTeams}
              handleReset={handleReset}
              teams={teams}
              setTeams={setTeams}
            />
          } />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/player-stats" element={<PlayerStats players={allPlayers} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
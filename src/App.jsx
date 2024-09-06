import React, { useState, useEffect, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase';
import { Player } from './models/Player';
import { TabNavigation } from './components/TabNavigation';
import { OverallPlayerList } from './components/OverallPlayerList';
import { WeeklySelectionContainer } from './components/WeeklySelectionContainer';
import { GameManagement } from './components/GameManagement';
import { LiveScoring } from './components/LiveScoring';
import { AdminPage } from './components/AdminPage';
import { PlayerStats } from './components/PlayerStats';
import './App.css';

function App() {
  const [allPlayers, setAllPlayers] = useState([]);
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');
  const [teams, setTeams] = useState([]);

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

  const getPlayerName = useCallback((playerId) => {
    const player = allPlayers.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
  }, [allPlayers]);

  const handleGameUpdated = useCallback((gameId, updatedData) => {
    setUpcomingGames(prevGames => 
      prevGames.filter(game => game.id !== gameId)
    );
    setPastGames(prevGames => [
      ...prevGames,
      { ...prevGames.find(game => game.id === gameId), ...updatedData }
    ]);
  }, []);

  const handleGameDeleted = useCallback((gameId) => {
    setUpcomingGames(prevGames => prevGames.filter(game => game.id !== gameId));
    setPastGames(prevGames => prevGames.filter(game => game.id !== gameId));
  }, []);

  const handleUpdateWeeklyPlayers = useCallback((newPlayers) => {
    // This function is no longer needed for updating allPlayers
    // but we'll keep it in case it's used elsewhere
    console.log("Weekly players updated:", newPlayers);
  }, []);

  const onGenerateTeams = useCallback((selectedPlayers) => {
    const shuffled = [...selectedPlayers].sort(() => 0.5 - Math.random());
    const midpoint = Math.ceil(shuffled.length / 2);
    const newTeams = [
      { name: 'Team 1', players: shuffled.slice(0, midpoint) },
      { name: 'Team 2', players: shuffled.slice(midpoint) }
    ];
    setTeams(newTeams);
  }, []);

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
              onUpdateWeeklyPlayers={handleUpdateWeeklyPlayers}
              onGenerateTeams={onGenerateTeams}
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
              getPlayerName={getPlayerName}
            />
          } />
          <Route path="/" element={
            <WeeklySelectionContainer 
              allPlayers={allPlayers}
              onUpdateWeeklyPlayers={handleUpdateWeeklyPlayers}
              onGenerateTeams={onGenerateTeams}
              teams={teams}
              setTeams={setTeams}
            />
          } />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/player-stats" element={<PlayerStats players={allPlayers} />} />
          <Route 
            path="/live-scoring/:liveScoringGameId" 
            element={<LiveScoring getPlayerName={getPlayerName} />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
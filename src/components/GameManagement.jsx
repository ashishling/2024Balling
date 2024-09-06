import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCard } from './GameCard';
import { doc, updateDoc, deleteDoc, collection, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import './GameManagement.css';

export function GameManagement({ upcomingGames, pastGames, onGameUpdated, onGameDeleted, getPlayerName }) {
  const [games, setGames] = useState({ upcoming: [], completed: [] });
  const [players, setPlayers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersCollection = collection(db, 'players');
        const playerSnapshot = await getDocs(playersCollection);
        const playerData = {};
        playerSnapshot.forEach(doc => {
          playerData[doc.id] = doc.data().name;
        });
        setPlayers(playerData);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    console.log("Upcoming games:", upcomingGames);
    console.log("Past games:", pastGames);
    
    const upcoming = upcomingGames.filter(game => game.status === 'upcoming');
    const completed = [...pastGames, ...upcomingGames.filter(game => game.status === 'completed')];
    
    // Sort completed games by date in descending order
    const sortedCompleted = completed.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setGames({ 
      upcoming: upcoming, 
      completed: sortedCompleted 
    });
  }, [upcomingGames, pastGames]);

  const handleUpdateScore = async (gameId, team1Score, team2Score) => {
    try {
      await runTransaction(db, async (transaction) => {
        // Perform all reads first
        const gameRef = doc(db, 'games', gameId);
        const gameDoc = await transaction.get(gameRef);
        const gameData = gameDoc.data();

        if (!gameData || !Array.isArray(gameData.teams) || gameData.teams.length < 2) {
          throw new Error('Invalid game data');
        }

        const winningTeamIndex = team1Score > team2Score ? 0 : 1;
        const losingTeamIndex = 1 - winningTeamIndex;

        const playerRefs = gameData.teams.flatMap(team => 
          team.players.map(playerId => doc(db, 'players', playerId))
        );
        const playerDocs = await Promise.all(playerRefs.map(ref => transaction.get(ref)));

        // Now perform all writes
        const updateData = {
          teams: gameData.teams.map((team, index) => ({
            ...team,
            score: index === 0 ? team1Score : team2Score
          })),
          status: 'completed'
        };

        transaction.update(gameRef, updateData);

        playerDocs.forEach((playerDoc, index) => {
          const playerData = playerDoc.data();
          const teamIndex = Math.floor(index / gameData.teams[0].players.length);
          if (teamIndex === winningTeamIndex) {
            transaction.update(playerRefs[index], { wins: (playerData.wins || 0) + 1 });
          } else {
            transaction.update(playerRefs[index], { losses: (playerData.losses || 0) + 1 });
          }
        });
      });

      console.log("Game score and player stats updated successfully");
      
      // Update local state
      setGames(prevGames => {
        const updatedGame = prevGames.upcoming.find(game => game.id === gameId);
        if (updatedGame) {
          const updatedUpcoming = prevGames.upcoming.filter(game => game.id !== gameId);
          const updatedCompleted = [...prevGames.completed, {
            ...updatedGame,
            teams: updatedGame.teams.map((team, index) => ({
              ...team,
              score: index === 0 ? team1Score : team2Score
            })),
            status: 'completed'
          }].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort after adding the new completed game
          return {
            upcoming: updatedUpcoming,
            completed: updatedCompleted
          };
        }
        return prevGames;
      });

      // Call onGameUpdated after the transaction is complete
      onGameUpdated(gameId, { 
        teams: [
          { score: team1Score },
          { score: team2Score }
        ],
        status: 'completed'
      });

    } catch (error) {
      console.error("Error updating game score and player stats: ", error);
    }
  };

  const handleDeleteGame = async (gameId) => {
    try {
      await deleteDoc(doc(db, 'games', gameId));
      console.log("Game deleted successfully");
      
      setGames(prevGames => ({
        upcoming: prevGames.upcoming.filter(game => game.id !== gameId),
        completed: prevGames.completed.filter(game => game.id !== gameId)
      }));

      onGameDeleted(gameId);
    } catch (error) {
      console.error("Error deleting game: ", error);
    }
  };

  return (
    <div className="game-management">
      <div className="upcoming-games">
        <h2>Upcoming Games</h2>
        {games.upcoming.map(game => (
          <GameCard 
            key={game.id}
            game={game}
            onUpdateScore={handleUpdateScore}
            onDeleteGame={handleDeleteGame}
            isUpcoming={true}
            getPlayerName={getPlayerName}
            navigate={navigate}
          />
        ))}
      </div>
      
      <div className="completed-games">
        <h2>Completed Games</h2>
        {games.completed.map(game => (
          <GameCard 
            key={game.id}
            game={game}
            onUpdateScore={handleUpdateScore}
            onDeleteGame={handleDeleteGame}
            isUpcoming={false}
            getPlayerName={getPlayerName}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}
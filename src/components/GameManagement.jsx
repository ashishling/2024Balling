import React from 'react';
import { GameCard } from './GameCard';
import './GameManagement.css';

export function GameManagement({ upcomingGames, pastGames, onUpdateScore, onDeleteGame }) {
  console.log('onDeleteGame in GameManagement:', onDeleteGame); // Keep this line for debugging

  if (typeof onDeleteGame !== 'function') {
    console.error('onDeleteGame is not a function in GameManagement');
    // Provide a fallback function to prevent errors
    onDeleteGame = (id) => console.log('Delete game fallback called with id:', id);
  }

  return (
    <div className="game-management">
      <div className="upcoming-games">
        <h2>Upcoming Games</h2>
        {upcomingGames.length > 0 ? (
          <ul>
            {upcomingGames.map((game) => (
              <li key={game.id}>
                <GameCard 
                  game={game} 
                  onUpdateScore={onUpdateScore}
                  onDeleteGame={onDeleteGame}
                  isUpcoming={true}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming games scheduled.</p>
        )}
      </div>
      
      <div className="past-games">
        <h2>Past Games</h2>
        {pastGames.length > 0 ? (
          <ul>
            {pastGames.map((game, index) => (
              <li key={index}>
                <GameCard 
                  game={game} 
                  onUpdateScore={onUpdateScore}
                  onDeleteGame={onDeleteGame} // Make sure this is here
                  isUpcoming={false}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>No past games recorded yet.</p>
        )}
      </div>
    </div>
  );
}
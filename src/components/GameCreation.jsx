import React, { useState } from 'react';

export function GameCreation({ onCreateGame }) {
  const [gameDate, setGameDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreateGame) {
      onCreateGame(gameDate); // Call the onCreateGame function with the selected date
      setGameDate(''); // Reset the date input after submission
    }
  };

  return (
    <div className="game-creation">
      <h2>Create a New Game</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Game Date:
          <input
            type="date"
            value={gameDate}
            onChange={(e) => setGameDate(e.target.value)}
            required
          />
        </label>
        <button type="submit">Create Game</button>
      </form>
    </div>
  );
}

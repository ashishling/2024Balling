import React, { useState } from 'react';
import { updateExistingPlayers } from '../utils/updateExistingPlayers';
import './AdminPage.css';

export function AdminPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  const handleResetStats = async () => {
    if (password === 'Balling2024') {
      setIsUpdating(true);
      try {
        await updateExistingPlayers();
        alert('Player stats reset successfully!');
        setShowPasswordPrompt(false);
        setPassword('');
      } catch (error) {
        console.error('Error resetting player stats:', error);
        alert('Error resetting player stats. Check console for details.');
      } finally {
        setIsUpdating(false);
      }
    } else {
      alert('Incorrect password. Please try again.');
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    handleResetStats();
  };

  return (
    <div className="admin-page">
      <h1>Admin Page</h1>
      <div className="admin-actions">
        {!showPasswordPrompt ? (
          <button onClick={() => setShowPasswordPrompt(true)} disabled={isUpdating}>
            Reset Player Stats
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Resetting...' : 'Confirm Reset'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

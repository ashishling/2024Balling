import React from 'react';

export const TeamDisplay = ({ team1, team2 }) => {
  const renderTeam = (team, teamName) => (
    <div>
      <h3>{teamName}</h3>
      <ul>
        {team.players.map(player => (
          <li key={player.id}>
            {player.name} - {player.position} (Skill: {player.skillLevel})
          </li>
        ))}
      </ul>
      <p>Total Skill: {team.getTotalSkill()}</p>
      <p>Position Count: {JSON.stringify(team.getPositionCount())}</p>
    </div>
  );

  return (
    <div>
      <h2>Balanced Teams</h2>
      {renderTeam(team1, "Team 1")}
      {renderTeam(team2, "Team 2")}
    </div>
  );
};

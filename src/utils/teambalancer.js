import { Team } from '../models/Team';

export function createBalancedTeams(players) {
  const numTeams = 2;
  const teams = Array.from({ length: numTeams }, () => new Team([]));

  // Sort players by skill level (descending)
  players.sort((a, b) => b.skillLevel - a.skillLevel);

  // Distribute players to teams
  players.forEach((player, index) => {
    const teamIndex = index % numTeams;
    teams[teamIndex].players.push(player);
  });

  // Balance teams by swapping players
  balanceTeams(teams);

  return teams;
}

function balanceTeams(teams) {
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        if (trySwapPlayers(teams[i], teams[j])) {
          improved = true;
        }
      }
    }
  }
}

function trySwapPlayers(team1, team2) {
  const initialDiff = Math.abs(team1.getTotalSkill() - team2.getTotalSkill());

  for (let i = 0; i < team1.players.length; i++) {
    for (let j = 0; j < team2.players.length; j++) {
      const player1 = team1.players[i];
      const player2 = team2.players[j];

      // Check if swapping improves position balance
      if (player1.position !== player2.position) {
        const newTeam1Positions = { ...team1.getPositionCount(), [player1.position]: (team1.getPositionCount()[player1.position] || 1) - 1, [player2.position]: (team1.getPositionCount()[player2.position] || 0) + 1 };
        const newTeam2Positions = { ...team2.getPositionCount(), [player2.position]: (team2.getPositionCount()[player2.position] || 1) - 1, [player1.position]: (team2.getPositionCount()[player1.position] || 0) + 1 };

        if (isMoreBalanced(team1.getPositionCount(), team2.getPositionCount(), newTeam1Positions, newTeam2Positions)) {
          // Swap players
          team1.players[i] = player2;
          team2.players[j] = player1;
          return true;
        }
      }

      // Check if swapping improves skill balance
      const newDiff = Math.abs((team1.getTotalSkill() - player1.skillLevel + player2.skillLevel) - (team2.getTotalSkill() - player2.skillLevel + player1.skillLevel));
      if (newDiff < initialDiff) {
        // Swap players
        team1.players[i] = player2;
        team2.players[j] = player1;
        return true;
      }
    }
  }

  return false;
}

function isMoreBalanced(oldPos1, oldPos2, newPos1, newPos2) {
  const oldDiff = Object.keys(oldPos1).reduce((sum, pos) => sum + Math.abs((oldPos1[pos] || 0) - (oldPos2[pos] || 0)), 0);
  const newDiff = Object.keys(newPos1).reduce((sum, pos) => sum + Math.abs((newPos1[pos] || 0) - (newPos2[pos] || 0)), 0);
  return newDiff < oldDiff;
}

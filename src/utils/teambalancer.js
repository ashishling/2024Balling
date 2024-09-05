import { Team } from '../models/Team';

export function createBalancedTeams(players) {
  console.log('Starting team creation with', players.length, 'players');
  const numTeams = 2;
  const teams = initialDistribution(players, numTeams);

  console.log('Initial team distribution complete');
  balanceTeams(teams);
  console.log('Team balancing complete');
  return teams;
}

function initialDistribution(players, numTeams) {
  players.sort((a, b) => getWeightedSkill(b.skillLevel) - getWeightedSkill(a.skillLevel));
  return Array.from({ length: numTeams }, (_, i) => 
    new Team(players.filter((_, index) => index % numTeams === i))
  );
}

function balanceTeams(teams) {
  let temperature = 1.0;
  const coolingRate = 0.995;
  const minTemperature = 0.01;

  while (temperature > minTemperature) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        trySwapPlayers(teams[i], teams[j], temperature);
      }
    }
    temperature *= coolingRate;
  }
}

function trySwapPlayers(team1, team2, temperature) {
  const initialScore = calculateTeamScore(team1) + calculateTeamScore(team2);

  for (let i = 0; i < team1.players.length; i++) {
    for (let j = 0; j < team2.players.length; j++) {
      const player1 = team1.players[i];
      const player2 = team2.players[j];

      // Temporarily swap players
      team1.players[i] = player2;
      team2.players[j] = player1;

      const newScore = calculateTeamScore(team1) + calculateTeamScore(team2);

      if (acceptWorseSolution(initialScore, newScore, temperature)) {
        // Keep the swap
        return true;
      } else {
        // Revert the swap
        team1.players[i] = player1;
        team2.players[j] = player2;
      }
    }
  }

  return false;
}

function calculateTeamScore(team) {
  // Implement multi-objective scoring here
}

function getWeightedSkill(skillLevel) {
  return Math.pow(skillLevel, 1.5);
}

function acceptWorseSolution(currentScore, newScore, temperature) {
  if (newScore > currentScore) return true;
  return Math.random() < Math.exp((currentScore - newScore) / temperature);
}

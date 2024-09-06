export class LiveScoringGame {
  constructor(gameId, teams) {
    this.gameId = gameId;
    this.teams = teams.map(team => ({
      teamId: team.teamId || '',
      name: team.name || '',
      score: 0,
      players: (team.players || []).map(player => ({
        id: player.id || '',
        name: player.name || '',
        points: 0
      }))
    }));
    this.scoringHistory = [];
  }

  addScore(teamId, playerId, points) {
    const team = this.teams.find(t => t.teamId === teamId);
    if (team) {
      team.score += points;
      const player = team.players.find(p => p.id === playerId);
      if (player) {
        player.points += points;
      }
      this.scoringHistory.push({
        timestamp: Date.now(),
        teamId,
        playerId,
        points
      });
    }
  }

  undoLastScore() {
    if (this.scoringHistory.length > 0) {
      const lastScore = this.scoringHistory.pop();
      const team = this.teams.find(t => t.teamId === lastScore.teamId);
      if (team) {
        team.score -= lastScore.points;
        const player = team.players.find(p => p.id === lastScore.playerId);
        if (player) {
          player.points -= lastScore.points;
        }
      }
    }
  }

  getTeamScore(teamId) {
    const team = this.teams.find(t => t.teamId === teamId);
    return team ? team.score : 0;
  }

  getPlayerScore(teamId, playerId) {
    const team = this.teams.find(t => t.teamId === teamId);
    if (team) {
      const player = team.players.find(p => p.id === playerId);
      return player ? player.points : 0;
    }
    return 0;
  }

  // Add this method to convert the object to a plain JavaScript object
  toFirestore() {
    return {
      gameId: this.gameId,
      teams: this.teams,
      scoringHistory: this.scoringHistory
    };
  }
}

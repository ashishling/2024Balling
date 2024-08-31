export class Team {
  constructor(players) {
    this.players = players;
  }

  getTotalSkill() {
    return this.players.reduce((sum, player) => sum + player.skillLevel, 0);
  }

  getPositionCount() {
    return this.players.reduce((count, player) => {
      count[player.position] = (count[player.position] || 0) + 1;
      return count;
    }, {});
  }
}

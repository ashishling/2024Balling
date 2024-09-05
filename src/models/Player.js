/**
 * Represents a player in the basketball team.
 * @typedef {Object} Player
 * @property {string} id - Unique identifier for the player
 * @property {string} name - Name of the player
 * @property {string} position - Playing position of the player
 * @property {number} skillLevel - Skill level of the player (1-10)
 */

// No actual code is needed in this file for JavaScript.
// The JSDoc comment above is just for documentation purposes.

export class Player {
  constructor(name, position, skillLevel, id = null) {
    this.name = name;
    this.setPosition(position);
    this.setSkillLevel(skillLevel);
    this.id = id;
    this.wins = 0;
    this.losses = 0;
  }

  setPosition(position) {
    const validPositions = ['Guard', 'Forward', 'Center'];
    if (validPositions.includes(position)) {
      this.position = position;
    } else {
      throw new Error('Invalid position. Must be Guard, Forward, or Center.');
    }
  }

  setSkillLevel(skillLevel) {
    const level = Number(skillLevel);
    if (level >= 1 && level <= 10) {
      this.skillLevel = level;
    } else {
      throw new Error('Skill level must be between 1 and 10.');
    }
  }

  recordWin() {
    this.wins += 1;
  }

  recordLoss() {
    this.losses += 1;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      skillLevel: this.skillLevel,
      wins: this.wins,
      losses: this.losses
    };
  }
}

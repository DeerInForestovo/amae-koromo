import { GameMode } from "./gameMode";
import { PLAYER_RANKS } from "./constants";
import i18n from "../../i18n";

const t = i18n.t.bind(i18n);

const LEVEL_MAX_POINTS = [20, 80, 200, 600, 800, 1000, 1200, 1400, 2000, 2800, 3200, 3600, 4000, 6000, 9000];
const LEVEL_PENALTY = [0, 0, 0, 20, 40, 60, 80, 100, 120, 165, 180, 195, 210, 225, 240, 255];
const LEVEL_PENALTY_3 = [0, 0, 0, 20, 40, 60, 80, 100, 120, 165, 190, 215, 240, 265, 290, 320];
const LEVEL_PENALTY_E = [0, 0, 0, 10, 20, 30, 40, 50, 60, 80, 90, 100, 110, 120, 130, 140];
const LEVEL_PENALTY_E_3 = [0, 0, 0, 10, 20, 30, 40, 50, 60, 80, 95, 110, 125, 140, 160, 175];

const LEVEL_ALLOWED_MODES: { [key: number]: GameMode[] } = {
  101: [],
  102: [],
  103: [GameMode.金, GameMode.金东],
  104: [GameMode.金, GameMode.玉, GameMode.金东, GameMode.玉东],
  105: [GameMode.玉, GameMode.王座, GameMode.玉东, GameMode.王座东],
  106: [GameMode.王座, GameMode.王座东],
  201: [],
  202: [],
  203: [GameMode.三金, GameMode.三金东],
  204: [GameMode.三金, GameMode.三玉, GameMode.三金东, GameMode.三玉东],
  205: [GameMode.三玉, GameMode.三王座, GameMode.三玉东, GameMode.三王座东],
  206: [GameMode.三王座, GameMode.三王座东],
};

const MODE_PENALTY: { [mode in GameMode]: typeof LEVEL_PENALTY } = {
  [GameMode.金]: LEVEL_PENALTY,
  [GameMode.玉]: LEVEL_PENALTY,
  [GameMode.王座]: LEVEL_PENALTY,
  [GameMode.金东]: LEVEL_PENALTY_E,
  [GameMode.玉东]: LEVEL_PENALTY_E,
  [GameMode.王座东]: LEVEL_PENALTY_E,
  [GameMode.三金]: LEVEL_PENALTY_3,
  [GameMode.三玉]: LEVEL_PENALTY_3,
  [GameMode.三王座]: LEVEL_PENALTY_3,
  [GameMode.三金东]: LEVEL_PENALTY_E_3,
  [GameMode.三玉东]: LEVEL_PENALTY_E_3,
  [GameMode.三王座东]: LEVEL_PENALTY_E_3
};

export function getTranslatedLevelTags(): string[] {
  const rawTags = t(PLAYER_RANKS) as string;
  if (rawTags.charCodeAt(0) > 127) {
    return rawTags.split("");
  }
  return Array(rawTags.length / 2)
    .fill("")
    .map((_, index) => rawTags.slice(index * 2, index * 2 + 2));
}

export class Level {
  _majorRank: number;
  _minorRank: number;
  _numPlayerId: number;
  constructor(levelId: number) {
    const realId = levelId % 10000;
    this._majorRank = Math.floor(realId / 100);
    this._minorRank = realId % 100;
    this._numPlayerId = Math.floor(levelId / 10000);
  }
  isSameMajorRank(other: Level): boolean {
    return this._majorRank === other._majorRank;
  }
  isSame(other: Level): boolean {
    return this._majorRank === other._majorRank && this._minorRank === other._minorRank;
  }
  isAllowedMode(mode: GameMode): boolean {
    return LEVEL_ALLOWED_MODES[this._numPlayerId * 100 + this._majorRank].includes(mode);
  }
  getTag(): string {
    const label = getTranslatedLevelTags()[this._majorRank - 1];
    if (this._majorRank === PLAYER_RANKS.length) {
      return label;
    }
    return label + this._minorRank;
  }
  getMaxPoint(): number {
    return LEVEL_MAX_POINTS[(this._majorRank - 1) * 3 + this._minorRank - 1];
  }
  getPenaltyPoint(mode: GameMode): number {
    return MODE_PENALTY[mode][(this._majorRank - 1) * 3 + this._minorRank - 1];
  }
  getStartingPoint(): number {
    if (this._majorRank === 1) {
      return 0;
    }
    if (this._majorRank === PLAYER_RANKS.length) {
      return 10000;
    }
    return this.getMaxPoint() / 2;
  }
  getNextLevel(): Level {
    if (this._majorRank === PLAYER_RANKS.length) {
      return this;
    }
    let majorRank = this._majorRank;
    let minorRank = this._minorRank + 1;
    if (minorRank > 3) {
      majorRank++;
      minorRank = 1;
    }
    return new Level(this._numPlayerId * 10000 + majorRank * 100 + minorRank);
  }
  getPreviousLevel(): Level {
    if (this._majorRank === 1 && this._minorRank === 1) {
      return this;
    }
    let majorRank = this._majorRank;
    let minorRank = this._minorRank - 1;
    if (minorRank < 1) {
      majorRank--;
      minorRank = 3;
    }
    return new Level(this._numPlayerId * 10000 + majorRank * 100 + minorRank);
  }
  getAdjustedLevel(score: number): Level {
    let maxPoints = this.getMaxPoint();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let level: Level = this;
    if (maxPoints && score >= maxPoints) {
      level = this.getNextLevel();
      maxPoints = level.getMaxPoint();
      score = level.getStartingPoint();
    } else if (score < 0) {
      if (!maxPoints || level._majorRank === 1 || (level._majorRank === 2 && level._minorRank === 1)) {
        score = 0;
      } else {
        level = this.getPreviousLevel();
        maxPoints = level.getMaxPoint();
        score = level.getStartingPoint();
      }
    }
    return level;
  }
  formatAdjustedScoreWithTag(score: number) {
    const level = this.getAdjustedLevel(score);
    return `${level.getTag()} ${this.formatAdjustedScore(score)}`;
  }
  formatAdjustedScore(score: number) {
    const level = this.getAdjustedLevel(score);
    return `${level === this ? Math.max(score, 0) : level.getStartingPoint()}${
      level.getMaxPoint() ? "/" + level.getMaxPoint() : ""
    }`;
  }
}
export function getLevelTag(levelId: number) {
  return new Level(levelId).getTag();
}
export type LevelWithDelta = {
  id: number;
  score: number;
  delta: number;
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const LevelWithDelta = Object.freeze({
  format(obj: LevelWithDelta): string {
    return new Level(obj.id).formatAdjustedScoreWithTag(obj.score + obj.delta);
  },
  formatAdjustedScore(obj: LevelWithDelta): string {
    return new Level(obj.id).formatAdjustedScore(obj.score + obj.delta);
  },
  getTag(obj: LevelWithDelta): string {
    return LevelWithDelta.getAdjustedLevel(obj).getTag();
  },
  getAdjustedLevel(obj: LevelWithDelta): Level {
    return new Level(obj.id).getAdjustedLevel(obj.score + obj.delta);
  },
});

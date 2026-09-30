export type EnemyKind = 'Doubt' | 'Worry' | 'SelfCritic';
export type TowerKind = 'Affirmation' | 'Gratitude' | 'Humor';
export type Phase = 'prep' | 'wave' | 'intermission' | 'won' | 'lost';

export type Vec2 = { x: number; y: number };

export type SoftGoalId =
  | 'plant_three'
  | 'clear_wave_one'
  | 'upgrade_once'
  | 'reach_wave_three'
  | 'keep_calm';

export type SoftGoals = Record<SoftGoalId, boolean>;

export type Enemy = {
  id: string;
  kind: EnemyKind;
  health: number;
  maxHealth: number;
  speed: number;
  pathT: number;
  slowUntil: number;
  flavor: string;
  /** Mark for entrance tween */
  bornAt: number;
};

export type Tower = {
  padIndex: number;
  kind: TowerKind;
  level: number;
  cooldown: number;
  /** Elapsed time of last kindness pulse (for range ring flash) */
  lastFiredAt: number;
};

export type SoftFx = {
  id: string;
  kind: 'shot' | 'clear';
  x: number;
  y: number;
  bornAt: number;
  color: string;
};

export type GameState = {
  phase: Phase;
  calm: number;
  clarity: number;
  waveIndex: number;
  towers: Tower[];
  enemies: Enemy[];
  selectedTower: TowerKind;
  selectedPad: number | null;
  toast: string | null;
  elapsed: number;
  intermissionLeft: number;
  spawnQueue: { kind: EnemyKind; at: number }[];
  waveActive: boolean;
  softGoals: SoftGoals;
  thoughtsCleared: number;
  peakWaveReached: number;
  /** Transient soft ripples — pruned in tick */
  fx: SoftFx[];
};

export type EnemyKind = 'Doubt' | 'Worry' | 'SelfCritic';
export type TowerKind = 'Affirmation' | 'Gratitude' | 'Humor';
export type Phase = 'prep' | 'wave' | 'intermission' | 'won' | 'lost';

export type Vec2 = { x: number; y: number };

export type Enemy = {
  id: string;
  kind: EnemyKind;
  health: number;
  maxHealth: number;
  speed: number;
  pathT: number;
  slowUntil: number;
  flavor: string;
};

export type Tower = {
  padIndex: number;
  kind: TowerKind;
  level: number;
  cooldown: number;
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
};

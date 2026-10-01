import type { EnemyKind, TowerKind, Vec2 } from './types';

/** Tunables — soft metaphor only. Board coords are plan-view (top-down) 0–1. */
export const GAME = {
  name: 'Thought Defense',
  tagline: 'plant kindness. clear the noise.',
  version: '1.2.4-mobile',
  startingCalm: 20,
  startingClarity: 140,
  waveCount: 8,
  secondsBetweenWaves: 8,
  leakPenalty: 1,
  maxTowerLevel: 3,
  upgradeCostFactor: 0.75,
  sellRefundFactor: 0.5,
  /**
   * Serpentine mind-path in plan view (north → south).
   * Start top-left entrance; Peace Core bottom-center.
   */
  path: [
    { x: 0.12, y: 0.1 },
    { x: 0.12, y: 0.42 },
    { x: 0.38, y: 0.42 },
    { x: 0.38, y: 0.68 },
    { x: 0.68, y: 0.68 },
    { x: 0.68, y: 0.28 },
    { x: 0.88, y: 0.28 },
    { x: 0.88, y: 0.78 },
    { x: 0.5, y: 0.88 },
  ] as Vec2[],
  /** Circular plant beds beside the path (top-down discs) */
  pads: [
    { x: 0.24, y: 0.24 },
    { x: 0.24, y: 0.54 },
    { x: 0.5, y: 0.54 },
    { x: 0.52, y: 0.78 },
    { x: 0.78, y: 0.48 },
    { x: 0.78, y: 0.18 },
    { x: 0.88, y: 0.58 },
    { x: 0.62, y: 0.88 },
  ] as Vec2[],
  enemies: {
    Doubt: {
      displayName: 'Doubt',
      health: 40,
      speed: 0.07,
      clarityReward: 8,
      flavors: [
        'what if…?',
        'not sure about this',
        'maybe later',
        'hesitant step',
        'second-guessing',
      ],
    },
    Worry: {
      displayName: 'Worry',
      health: 24,
      speed: 0.11,
      clarityReward: 10,
      flavors: [
        'spinning again',
        'keep checking',
        'tiny storm',
        'quick flutter',
        'looping check',
      ],
    },
    SelfCritic: {
      displayName: 'Self-Critic',
      health: 110,
      speed: 0.045,
      clarityReward: 18,
      flavors: [
        'too loud today',
        'harsh echo',
        'not that kind',
        'heavy tread',
        'sharp corner',
      ],
    },
  } satisfies Record<
    EnemyKind,
    {
      displayName: string;
      health: number;
      speed: number;
      clarityReward: number;
      flavors: string[];
    }
  >,
  towers: {
    Affirmation: {
      displayName: 'Affirmation',
      blurb: 'Steady kind words. Single-target.',
      cost: 50,
      range: 0.22,
      damage: 12,
      fireRate: 1.1,
      slowFactor: 1,
      splashRadius: 0,
    },
    Gratitude: {
      displayName: 'Gratitude',
      blurb: 'Soft aura that slows rumination.',
      cost: 65,
      range: 0.2,
      damage: 4,
      fireRate: 0.7,
      slowFactor: 0.55,
      splashRadius: 0,
    },
    Humor: {
      displayName: 'Humor',
      blurb: 'Light splash — pops clusters of noise.',
      cost: 85,
      range: 0.18,
      damage: 10,
      fireRate: 0.65,
      slowFactor: 1,
      splashRadius: 0.12,
    },
  } satisfies Record<
    TowerKind,
    {
      displayName: string;
      blurb: string;
      cost: number;
      range: number;
      damage: number;
      fireRate: number;
      slowFactor: number;
      splashRadius: number;
    }
  >,
  waves: [
    [{ kind: 'Doubt' as EnemyKind, count: 4, spacing: 1.2 }],
    [
      { kind: 'Doubt' as EnemyKind, count: 5, spacing: 1.0 },
      { kind: 'Worry' as EnemyKind, count: 3, spacing: 0.9 },
    ],
    [{ kind: 'Worry' as EnemyKind, count: 7, spacing: 0.85 }],
    [
      { kind: 'Doubt' as EnemyKind, count: 5, spacing: 1.0 },
      { kind: 'SelfCritic' as EnemyKind, count: 2, spacing: 1.6 },
    ],
    [
      { kind: 'Worry' as EnemyKind, count: 6, spacing: 0.75 },
      { kind: 'SelfCritic' as EnemyKind, count: 3, spacing: 1.3 },
      { kind: 'Doubt' as EnemyKind, count: 4, spacing: 0.9 },
    ],
    [
      { kind: 'Doubt' as EnemyKind, count: 6, spacing: 0.85 },
      { kind: 'Worry' as EnemyKind, count: 6, spacing: 0.7 },
      { kind: 'SelfCritic' as EnemyKind, count: 2, spacing: 1.4 },
    ],
    [
      { kind: 'Worry' as EnemyKind, count: 8, spacing: 0.65 },
      { kind: 'SelfCritic' as EnemyKind, count: 4, spacing: 1.15 },
    ],
    [
      { kind: 'Doubt' as EnemyKind, count: 7, spacing: 0.8 },
      { kind: 'Worry' as EnemyKind, count: 7, spacing: 0.6 },
      { kind: 'SelfCritic' as EnemyKind, count: 5, spacing: 1.05 },
    ],
  ],
} as const;

/** Soft FX color per tower kind (plan-view ripples). */
export const TOWER_FX_COLOR: Record<TowerKind, string> = {
  Affirmation: '#6BB89A',
  Gratitude: '#C9A85A',
  Humor: '#E08A68',
};

export function pointOnPath(t: number): Vec2 {
  const pts = GAME.path;
  const clamped = Math.max(0, Math.min(0.9999, t));
  const seg = clamped * (pts.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  const a = pts[i];
  const b = pts[Math.min(i + 1, pts.length - 1)];
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

export function upgradeCost(kind: TowerKind, level: number): number {
  const base = GAME.towers[kind].cost;
  return Math.floor(base * level * GAME.upgradeCostFactor);
}

export function towerRange(kind: TowerKind, level: number): number {
  const base = GAME.towers[kind].range;
  return base * (1 + (level - 1) * 0.08);
}

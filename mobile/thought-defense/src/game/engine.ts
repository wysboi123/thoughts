import { GAME, pointOnPath, upgradeCost } from './config';
import { emptySoftGoals } from './softGoals';
import type { Enemy, EnemyKind, GameState, SoftGoals, Tower, TowerKind } from './types';

let idSeq = 0;
const nextId = () => `e${++idSeq}`;

function pickFlavor(kind: EnemyKind): string {
  const list = GAME.enemies[kind].flavors;
  return list[Math.floor(Math.random() * list.length)];
}

function withGoals(state: GameState, patch: Partial<SoftGoals>): GameState {
  return { ...state, softGoals: { ...state.softGoals, ...patch } };
}

export function createInitialState(): GameState {
  idSeq = 0;
  return {
    phase: 'prep',
    calm: GAME.startingCalm,
    clarity: GAME.startingClarity,
    waveIndex: 0,
    towers: [],
    enemies: [],
    selectedTower: 'Affirmation',
    selectedPad: null,
    toast: 'Plant kindness on the pads, then Begin.',
    elapsed: 0,
    intermissionLeft: 0,
    spawnQueue: [],
    waveActive: false,
    softGoals: emptySoftGoals(),
    thoughtsCleared: 0,
    peakWaveReached: 0,
  };
}

function buildSpawnQueue(waveIndex: number, now: number) {
  const recipe = GAME.waves[waveIndex] ?? [];
  const queue: { kind: EnemyKind; at: number }[] = [];
  let t = now + 0.4;
  for (const group of recipe) {
    for (let i = 0; i < group.count; i++) {
      queue.push({ kind: group.kind, at: t });
      t += group.spacing;
    }
    t += 0.35;
  }
  return queue;
}

function dist(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.hypot(dx, dy);
}

function towerStats(tower: Tower) {
  const base = GAME.towers[tower.kind];
  const scale = 1 + (tower.level - 1) * 0.35;
  return {
    range: base.range * (1 + (tower.level - 1) * 0.08),
    damage: base.damage * scale,
    fireRate: base.fireRate * (1 + (tower.level - 1) * 0.12),
    slowFactor: base.slowFactor,
    splashRadius: base.splashRadius * (1 + (tower.level - 1) * 0.1),
  };
}

export function selectTowerKind(state: GameState, kind: TowerKind): GameState {
  return { ...state, selectedTower: kind, selectedPad: null, toast: null };
}

export function clearSelection(state: GameState): GameState {
  if (state.selectedPad == null) return state;
  return { ...state, selectedPad: null, toast: 'Back to planting.' };
}

export function tapPad(state: GameState, padIndex: number): GameState {
  if (state.phase === 'won' || state.phase === 'lost') return state;
  const existing = state.towers.find((t) => t.padIndex === padIndex);
  if (existing) {
    return {
      ...state,
      selectedPad: padIndex,
      toast: `Selected · ${GAME.towers[existing.kind].displayName} L${existing.level}`,
    };
  }
  // Planting while in select mode still allowed only if no selection? Draft C dims plant — block plant when selected
  if (state.selectedPad != null) {
    return { ...state, toast: 'Back to plant first — or tap Upgrade / Sell.' };
  }
  const cost = GAME.towers[state.selectedTower].cost;
  if (state.clarity < cost) {
    return { ...state, toast: 'Need more Clarity to plant.' };
  }
  const tower: Tower = {
    padIndex,
    kind: state.selectedTower,
    level: 1,
    cooldown: 0,
  };
  const towers = [...state.towers, tower];
  let next: GameState = {
    ...state,
    clarity: state.clarity - cost,
    towers,
    selectedPad: null,
    toast: `Planted ${GAME.towers[tower.kind].displayName}.`,
  };
  if (towers.length >= 3) {
    next = withGoals(next, { plant_three: true });
  }
  return next;
}

export function upgradeSelected(state: GameState): GameState {
  if (state.selectedPad == null) return state;
  const idx = state.towers.findIndex((t) => t.padIndex === state.selectedPad);
  if (idx < 0) return state;
  const tower = state.towers[idx];
  if (tower.level >= GAME.maxTowerLevel) {
    return { ...state, toast: 'Already at deepest kindness.' };
  }
  const cost = upgradeCost(tower.kind, tower.level);
  if (state.clarity < cost) {
    return { ...state, toast: `Upgrade needs ${cost} Clarity.` };
  }
  const nextTowers = [...state.towers];
  nextTowers[idx] = { ...tower, level: tower.level + 1 };
  let next: GameState = {
    ...state,
    clarity: state.clarity - cost,
    towers: nextTowers,
    toast: `Deepened to L${tower.level + 1}.`,
  };
  next = withGoals(next, { upgrade_once: true });
  return next;
}

export function sellSelected(state: GameState): GameState {
  if (state.selectedPad == null) return state;
  const tower = state.towers.find((t) => t.padIndex === state.selectedPad);
  if (!tower) return state;
  let spent = GAME.towers[tower.kind].cost;
  for (let l = 1; l < tower.level; l++) spent += upgradeCost(tower.kind, l);
  const refund = Math.floor(spent * GAME.sellRefundFactor);
  return {
    ...state,
    clarity: state.clarity + refund,
    towers: state.towers.filter((t) => t.padIndex !== state.selectedPad),
    selectedPad: null,
    toast: `Sold — +${refund} Clarity.`,
  };
}

export function beginWave(state: GameState): GameState {
  if (state.phase !== 'prep' && state.phase !== 'intermission') return state;
  if (state.waveIndex >= GAME.waveCount) return state;
  const queue = buildSpawnQueue(state.waveIndex, state.elapsed);
  return {
    ...state,
    phase: 'wave',
    waveActive: true,
    spawnQueue: queue,
    intermissionLeft: 0,
    selectedPad: null,
    toast: `Wave ${state.waveIndex + 1} — clear the noise.`,
  };
}

export function applyClarityBoost(state: GameState, amount: number): GameState {
  return {
    ...state,
    clarity: state.clarity + amount,
    toast: `+${amount} Clarity — a soft lift, not a paywall.`,
  };
}

function finalizeRun(state: GameState): GameState {
  let next = state;
  if (state.calm > 10) {
    next = withGoals(next, { keep_calm: true });
  }
  return next;
}

export function tick(state: GameState, dt: number): GameState {
  if (state.phase === 'won' || state.phase === 'lost') return state;

  let next: GameState = {
    ...state,
    elapsed: state.elapsed + dt,
    enemies: state.enemies.map((e) => ({ ...e })),
    towers: state.towers.map((t) => ({ ...t })),
    spawnQueue: [...state.spawnQueue],
    softGoals: { ...state.softGoals },
  };

  if (next.phase === 'intermission') {
    next.intermissionLeft -= dt;
    if (next.intermissionLeft <= 0) {
      return beginWave({ ...next, phase: 'intermission' });
    }
    return next;
  }

  if (next.phase !== 'wave') return next;

  const remaining: typeof next.spawnQueue = [];
  for (const job of next.spawnQueue) {
    if (job.at <= next.elapsed) {
      const cfg = GAME.enemies[job.kind];
      const enemy: Enemy = {
        id: nextId(),
        kind: job.kind,
        health: cfg.health,
        maxHealth: cfg.health,
        speed: cfg.speed,
        pathT: 0,
        slowUntil: 0,
        flavor: pickFlavor(job.kind),
        bornAt: next.elapsed,
      };
      next.enemies.push(enemy);
    } else {
      remaining.push(job);
    }
  }
  next.spawnQueue = remaining;

  const survivors: Enemy[] = [];
  for (const enemy of next.enemies) {
    const slowed = next.elapsed < enemy.slowUntil;
    const speed = enemy.speed * (slowed ? 0.55 : 1);
    enemy.pathT += speed * dt;
    if (enemy.pathT >= 1) {
      next.calm = Math.max(0, next.calm - GAME.leakPenalty);
      next.toast = 'A thought reached the Peace Core — Calm −1';
      if (next.calm <= 0) {
        next.phase = 'lost';
        next.toast = 'The core needs rest. Try again gently.';
        next.enemies = [];
        next.waveActive = false;
        return finalizeRun(next);
      }
    } else if (enemy.health > 0) {
      survivors.push(enemy);
    }
  }
  next.enemies = survivors;

  for (const tower of next.towers) {
    tower.cooldown = Math.max(0, tower.cooldown - dt);
    if (tower.cooldown > 0 || next.enemies.length === 0) continue;
    const pad = GAME.pads[tower.padIndex];
    const stats = towerStats(tower);
    let target: Enemy | null = null;
    let best = Infinity;
    for (const enemy of next.enemies) {
      const pos = pointOnPath(enemy.pathT);
      const d = dist(pad.x, pad.y, pos.x, pos.y);
      if (d <= stats.range && enemy.pathT < best) {
        best = enemy.pathT;
        target = enemy;
      }
    }
    if (!target) continue;
    tower.cooldown = 1 / stats.fireRate;
    const hit = (e: Enemy) => {
      e.health -= stats.damage;
      if (stats.slowFactor < 1) {
        e.slowUntil = next.elapsed + 1.2;
      }
      if (e.health <= 0) {
        next.clarity += GAME.enemies[e.kind].clarityReward;
        next.thoughtsCleared += 1;
      }
    };
    hit(target);
    if (stats.splashRadius > 0) {
      const center = pointOnPath(target.pathT);
      for (const other of next.enemies) {
        if (other.id === target.id) continue;
        const p = pointOnPath(other.pathT);
        if (dist(center.x, center.y, p.x, p.y) <= stats.splashRadius) hit(other);
      }
    }
  }
  next.enemies = next.enemies.filter((e) => e.health > 0);

  const waveDone =
    next.spawnQueue.length === 0 && next.enemies.length === 0 && next.waveActive;
  if (waveDone) {
    const finished = next.waveIndex + 1;
    next.peakWaveReached = Math.max(next.peakWaveReached, finished);
    if (finished >= 1) next = withGoals(next, { clear_wave_one: true });
    if (finished >= 3) next = withGoals(next, { reach_wave_three: true });

    if (finished >= GAME.waveCount) {
      next.phase = 'won';
      next.waveActive = false;
      next.toast = 'Peace held. The noise grew quiet.';
      next.waveIndex = finished;
      return finalizeRun(next);
    }
    next.waveIndex = finished;
    next.phase = 'intermission';
    next.waveActive = false;
    next.intermissionLeft = GAME.secondsBetweenWaves;
    next.toast = `Breath between waves — next in ${GAME.secondsBetweenWaves}s`;
  }

  return next;
}

export { pointOnPath };

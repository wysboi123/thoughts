import {
  GAME,
  TOWER_FX_COLOR,
  intermissionSeconds,
  pointOnPath,
  upgradeCost,
} from './config';
import { emptySoftGoals } from './softGoals';
import type {
  Enemy,
  EnemyKind,
  GameState,
  SoftFx,
  SoftGoals,
  ToastKind,
  Tower,
  TowerKind,
} from './types';

let idSeq = 0;
let fxSeq = 0;
const nextId = () => `e${++idSeq}`;
const nextFxId = () => `fx${++fxSeq}`;

function pickFlavor(kind: EnemyKind): string {
  const list = GAME.enemies[kind].flavors;
  return list[Math.floor(Math.random() * list.length)];
}

function withGoals(state: GameState, patch: Partial<SoftGoals>): GameState {
  return { ...state, softGoals: { ...state.softGoals, ...patch } };
}

function withToast(
  state: GameState,
  toast: string | null,
  toastKind: ToastKind | null = toast ? 'info' : null,
): GameState {
  return { ...state, toast, toastKind };
}

function plantFx(state: GameState, padIndex: number, kind: TowerKind): SoftFx {
  const pad = GAME.pads[padIndex];
  return {
    id: nextFxId(),
    kind: 'plant',
    x: pad.x,
    y: pad.y,
    bornAt: state.elapsed,
    color: TOWER_FX_COLOR[kind],
  };
}

export function createInitialState(): GameState {
  idSeq = 0;
  fxSeq = 0;
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
    toastKind: 'info',
    padPulse: null,
    elapsed: 0,
    intermissionLeft: 0,
    spawnQueue: [],
    waveActive: false,
    softGoals: emptySoftGoals(),
    thoughtsCleared: 0,
    peakWaveReached: 0,
    fx: [],
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
  return withToast({ ...state, selectedTower: kind, selectedPad: null }, null, null);
}

export function clearSelection(state: GameState): GameState {
  if (state.selectedPad == null) return state;
  return withToast({ ...state, selectedPad: null }, 'Back to planting.', 'info');
}

export function tapPad(state: GameState, padIndex: number): GameState {
  if (state.phase === 'won' || state.phase === 'lost') return state;
  const existing = state.towers.find((t) => t.padIndex === padIndex);
  if (existing) {
    return withToast(
      { ...state, selectedPad: padIndex },
      `Selected · ${GAME.towers[existing.kind].displayName} L${existing.level}`,
      'info',
    );
  }
  // Planting while in select mode still allowed only if no selection? Draft C dims plant — block plant when selected
  if (state.selectedPad != null) {
    return withToast(state, 'Back to plant first — or tap Upgrade / Sell.', 'warn');
  }
  const cost = GAME.towers[state.selectedTower].cost;
  if (state.clarity < cost) {
    return withToast(state, `Need ${cost} Clarity to plant · have ${state.clarity}.`, 'warn');
  }
  const tower: Tower = {
    padIndex,
    kind: state.selectedTower,
    level: 1,
    cooldown: 0,
    lastFiredAt: -99,
  };
  const towers = [...state.towers, tower];
  const left = state.clarity - cost;
  let next: GameState = withToast(
    {
      ...state,
      clarity: left,
      towers,
      selectedPad: null,
      padPulse: { padIndex, at: state.elapsed },
      fx: [...state.fx, plantFx(state, padIndex, tower.kind)],
    },
    `Planted ${GAME.towers[tower.kind].displayName} · ${left} Clarity left`,
    'plant',
  );
  if (towers.length >= 3) {
    next = withGoals(next, { plant_three: true });
  }
  const kinds = new Set(towers.map((t) => t.kind));
  if (kinds.has('Affirmation') && kinds.has('Gratitude') && kinds.has('Humor')) {
    next = withGoals(next, { plant_all_kinds: true });
  }
  return next;
}

export function upgradeSelected(state: GameState): GameState {
  if (state.selectedPad == null) return state;
  const idx = state.towers.findIndex((t) => t.padIndex === state.selectedPad);
  if (idx < 0) return state;
  const tower = state.towers[idx];
  if (tower.level >= GAME.maxTowerLevel) {
    return withToast(state, 'Already at deepest kindness.', 'info');
  }
  const cost = upgradeCost(tower.kind, tower.level);
  if (state.clarity < cost) {
    return withToast(state, `Upgrade needs ${cost} Clarity · have ${state.clarity}.`, 'warn');
  }
  const nextLevel = tower.level + 1;
  const nextTowers = [...state.towers];
  nextTowers[idx] = { ...tower, level: nextLevel };
  const left = state.clarity - cost;
  let next: GameState = withToast(
    {
      ...state,
      clarity: left,
      towers: nextTowers,
      padPulse: { padIndex: tower.padIndex, at: state.elapsed },
      fx: [...state.fx, plantFx(state, tower.padIndex, tower.kind)],
    },
    `Deepened ${GAME.towers[tower.kind].displayName} → L${nextLevel} · ${left} Clarity`,
    'upgrade',
  );
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
  return withToast(
    {
      ...state,
      clarity: state.clarity + refund,
      towers: state.towers.filter((t) => t.padIndex !== state.selectedPad),
      selectedPad: null,
    },
    `Sold ${GAME.towers[tower.kind].displayName} — +${refund} Clarity`,
    'sell',
  );
}

export function beginWave(state: GameState): GameState {
  if (state.phase !== 'prep' && state.phase !== 'intermission') return state;
  if (state.waveIndex >= GAME.waveCount) return state;
  const queue = buildSpawnQueue(state.waveIndex, state.elapsed);
  return withToast(
    {
      ...state,
      phase: 'wave',
      waveActive: true,
      spawnQueue: queue,
      intermissionLeft: 0,
      selectedPad: null,
    },
    `Wave ${state.waveIndex + 1} — clear the noise.`,
    'info',
  );
}

export function applyClarityBoost(state: GameState, amount: number): GameState {
  return withToast(
    {
      ...state,
      clarity: state.clarity + amount,
    },
    `+${amount} Clarity — a soft lift, not a paywall.`,
    'success',
  );
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
    fx: state.fx.filter((f) => state.elapsed + dt - f.bornAt < 0.6).map((f) => ({ ...f })),
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
      // Soft per-spawn speed jitter so walkers of the same kind don't march in lockstep
      const speedJitter = 0.92 + Math.random() * 0.16;
      const enemy: Enemy = {
        id: nextId(),
        kind: job.kind,
        health: cfg.health,
        maxHealth: cfg.health,
        speed: cfg.speed * speedJitter,
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
      next.toastKind = 'warn';
      if (next.calm <= 0) {
        next.phase = 'lost';
        next.toast = 'Soft pause — the core needs rest. Try again gently.';
        next.toastKind = 'warn';
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
    tower.lastFiredAt = next.elapsed;
    const padPos = pad;
    const pushFx = (kind: SoftFx['kind'], x: number, y: number) => {
      next.fx.push({
        id: nextFxId(),
        kind,
        x,
        y,
        bornAt: next.elapsed,
        color: TOWER_FX_COLOR[tower.kind],
      });
    };
    pushFx('shot', padPos.x, padPos.y);
    const hit = (e: Enemy) => {
      e.health -= stats.damage;
      if (stats.slowFactor < 1) {
        e.slowUntil = next.elapsed + 1.2;
      }
      if (e.health <= 0) {
        next.clarity += GAME.enemies[e.kind].clarityReward;
        next.thoughtsCleared += 1;
        const clearPos = pointOnPath(e.pathT);
        pushFx('clear', clearPos.x, clearPos.y);
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
    if (finished >= 6) next = withGoals(next, { reach_wave_six: true });

    if (finished >= GAME.waveCount) {
      next.phase = 'won';
      next.waveActive = false;
      next.toast = 'Peace held. The noise grew quiet.';
      next.toastKind = 'success';
      next.waveIndex = finished;
      return finalizeRun(next);
    }
    next.waveIndex = finished;
    next.phase = 'intermission';
    next.waveActive = false;
    const breath = intermissionSeconds(finished);
    next.intermissionLeft = breath;
    next.toast = `Breath between waves — next in ${breath}s`;
    next.toastKind = 'info';
  }

  return next;
}

export { pointOnPath };

import type { SoftGoalId, SoftGoals } from './types';

export const SOFT_GOAL_COPY: Record<
  SoftGoalId,
  { title: string; blurb: string }
> = {
  plant_three: {
    title: 'Plant three kindnesses',
    blurb: 'Place Affirmation, Gratitude, or Humor on three pads.',
  },
  clear_wave_one: {
    title: 'Clear the first wave',
    blurb: 'Let the first soft rush of noise settle.',
  },
  upgrade_once: {
    title: 'Deepen one thought',
    blurb: 'Upgrade a planted thought once (Tray C · Upgrade).',
  },
  reach_wave_three: {
    title: 'Reach wave three',
    blurb: 'Hold the Peace Core through early waves (run has 8 waves).',
  },
  keep_calm: {
    title: 'Keep Calm above 10',
    blurb: 'Finish a run (win or gentle lose) with Calm still above 10.',
  },
};

export function emptySoftGoals(): SoftGoals {
  return {
    plant_three: false,
    clear_wave_one: false,
    upgrade_once: false,
    reach_wave_three: false,
    keep_calm: false,
  };
}

export function softGoalsDone(goals: SoftGoals): number {
  return Object.values(goals).filter(Boolean).length;
}

import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Atmosphere } from '../components/Atmosphere';
import { DualModeTray } from '../components/DualModeTray';
import { FirstRunTipChip } from '../components/FirstRunTipChip';
import { GameBoard } from '../components/GameBoard';
import { PauseOverlay } from '../components/PauseOverlay';
import { SoftActionToast } from '../components/SoftActionToast';
import { SoftButton } from '../components/SoftButton';
import { WavePreviewChip } from '../components/WavePreviewChip';
import { WaveResultModal } from '../components/WaveResultModal';
import { GAME } from '../game/config';
import {
  applyClarityBoost,
  beginWave,
  clearSelection,
  createInitialState,
  selectTowerKind,
  sellSelected,
  tapPad,
  tick,
  upgradeSelected,
} from '../game/engine';
import { softGoalsDone, SOFT_GOAL_TOTAL } from '../game/softGoals';
import type { GameState } from '../game/types';
import { useIap } from '../iap/IapProvider';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const { width, height: winH } = useWindowDimensions();
  const { entitlements, consumePendingClarity } = useIap();
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [paused, setPaused] = useState(false);

  const boardW = Math.min(width - 28, 400);
  // Near-square plan view — reads as top-down map
  const boardH = Math.min(boardW * 1.05, winH * 0.48);
  const showResult = state.phase === 'won' || state.phase === 'lost';
  const canPause = !showResult;

  useEffect(() => {
    if (paused || showResult) return;
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setState((s) => tick(s, dt));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [paused, showResult]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active' && canPause) setPaused(true);
    });
    return () => sub.remove();
  }, [canPause]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const amount = await consumePendingClarity();
      if (alive && amount > 0) {
        setState((s) => applyClarityBoost(s, amount));
      }
    })();
    return () => {
      alive = false;
    };
  }, [consumePendingClarity]);

  const onPad = useCallback((i: number) => {
    setState((s) => tapPad(s, i));
  }, []);

  const waveLabel = `Wave ${Math.min(
    state.waveIndex + (state.phase === 'won' ? 0 : 1),
    GAME.waveCount,
  )}/${GAME.waveCount} · Calm ${state.calm} · Clarity ${state.clarity}`;

  return (
    <Atmosphere>
      <View style={[styles.wrap, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 6 }]}>
        <View style={styles.topRow}>
          <SoftButton label="← Home" variant="ghost" onPress={() => router.back()} style={styles.homeBtn} />
          <Text style={styles.title}>Mindscape</Text>
          <SoftButton
            label={paused ? 'Paused' : 'Pause'}
            variant="ghost"
            disabled={!canPause}
            onPress={() => setPaused(true)}
            style={styles.pauseBtn}
            accessibilityHint="Pauses the mindscape so the path holds still"
          />
        </View>

        <View style={styles.hud}>
          <Text style={styles.stat}>Calm {state.calm}</Text>
          <Text style={styles.stat}>Clarity {state.clarity}</Text>
          <Text style={styles.stat}>
            Wave {Math.min(state.waveIndex + (state.phase === 'won' ? 0 : 1), GAME.waveCount)}/
            {GAME.waveCount}
          </Text>
        </View>

        <SoftButton
          label={`Goals ${softGoalsDone(state.softGoals)}/${SOFT_GOAL_TOTAL}`}
          variant="ghost"
          onPress={() => router.push('/goals')}
          style={styles.goalsChip}
        />

        <SoftActionToast message={state.toast} kind={state.toastKind} />

        <FirstRunTipChip
          visible={
            !paused &&
            !showResult &&
            (state.phase === 'prep' || state.phase === 'intermission')
          }
        />

        <View style={styles.boardWrap}>
          <GameBoard
            state={state}
            width={boardW}
            height={boardH}
            onPad={onPad}
            onBackground={() => setState((s) => clearSelection(s))}
            themeDawn={entitlements.ownedCosmetics.includes('cosmetic_dawn')}
          />
        </View>

        <WavePreviewChip
          waveIndex={state.waveIndex}
          visible={
            !paused &&
            !showResult &&
            (state.phase === 'prep' || state.phase === 'intermission')
          }
        />

        {(state.phase === 'prep' || state.phase === 'intermission') && !paused && (
          <SoftButton
            label={state.phase === 'prep' ? 'Begin wave' : `Start next · ${Math.ceil(state.intermissionLeft)}s`}
            onPress={() => setState((s) => beginWave(s))}
            style={styles.begin}
          />
        )}

        <DualModeTray
          state={state}
          onSelectKind={(k) => setState((s) => selectTowerKind(s, k))}
          onUpgrade={() => setState((s) => upgradeSelected(s))}
          onSell={() => setState((s) => sellSelected(s))}
          onBack={() => setState((s) => clearSelection(s))}
        />

        {state.phase === 'wave' && !entitlements.clarityPassActive ? (
          <Text style={styles.softAd}>Soft between-run notes (Clarity Pass hides these)</Text>
        ) : null}
      </View>

      <PauseOverlay
        visible={paused && canPause}
        waveLabel={waveLabel}
        calm={state.calm}
        clarity={state.clarity}
        onResume={() => setPaused(false)}
      />

      <WaveResultModal
        visible={showResult}
        state={state}
        onRetry={() => {
          setPaused(false);
          setState(createInitialState());
        }}
        onClose={() => {
          /* keep modal until retry/nav */
        }}
      />
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 14 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeBtn: { paddingVertical: 8, paddingHorizontal: 10 },
  pauseBtn: { paddingVertical: 8, paddingHorizontal: 10 },
  goalsChip: { alignSelf: 'center', marginTop: 6, paddingVertical: 6, paddingHorizontal: 12 },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.brandDeep,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  stat: {
    fontFamily: fonts.bodyMedium,
    color: colors.ink,
    fontSize: 13,
  },
  boardWrap: { alignItems: 'center', marginTop: 6, flexGrow: 1, justifyContent: 'center' },
  begin: { marginTop: 8 },
  softAd: {
    textAlign: 'center',
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.inkSoft,
  },
});

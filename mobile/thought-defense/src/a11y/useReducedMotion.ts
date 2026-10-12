import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True when the OS asks for reduced motion (iOS Reduce Motion / Android equivalent). */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => {
        if (mounted) setReduced(Boolean(v));
      })
      .catch(() => undefined);

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
      setReduced(Boolean(v));
    });

    return () => {
      mounted = false;
      // RN typings: subscription may be EventSubscription or legacy remove()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = sub as any;
      if (typeof s?.remove === 'function') s.remove();
    };
  }, []);

  return reduced;
}

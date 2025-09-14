import { useEffect, useRef } from 'react';

interface AnimationControllerProps {
  isAnimating: boolean;
  rowCount: number;
  onPhaseChange?: (phase: 'allocating' | 'inserting' | 'settling' | 'complete') => void;
}

export function AnimationController({ isAnimating, rowCount, onPhaseChange }: AnimationControllerProps) {
  const phaseTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear any existing timeouts
    phaseTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    phaseTimeoutsRef.current = [];

    if (isAnimating && rowCount > 0) {
      // Phase 1: Space allocation (0-800ms)
      onPhaseChange?.('allocating');

      // Phase 2: Row insertion (800ms-2000ms)
      const insertTimeout = setTimeout(() => {
        onPhaseChange?.('inserting');
      }, 800);
      phaseTimeoutsRef.current.push(insertTimeout);

      // Phase 3: Settling (2000ms-3000ms)
      const settleTimeout = setTimeout(() => {
        onPhaseChange?.('settling');
      }, 2000);
      phaseTimeoutsRef.current.push(settleTimeout);

      // Phase 4: Complete (3000ms+)
      const completeTimeout = setTimeout(() => {
        onPhaseChange?.('complete');
      }, 3000);
      phaseTimeoutsRef.current.push(completeTimeout);
    }

    return () => {
      phaseTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [isAnimating, rowCount, onPhaseChange]);

  return null;
}

export default AnimationController;
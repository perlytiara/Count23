"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CountdownState } from "../types";
import { msToTimeComponents } from "../utils/time";

interface UseCountdownOptions {
  targetTime: Date | null;
  totalDuration: number;
  onComplete?: () => void;
  onMilestone?: (label: string) => void;
}

const INITIAL_STATE: CountdownState = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
  totalRemaining: 0,
  progress: 0,
  isComplete: false,
};

const ONE_SECOND = 1000;

export function useCountdown({
  targetTime,
  totalDuration,
  onComplete,
  onMilestone,
}: UseCountdownOptions): CountdownState {
  const [state, setState] = useState<CountdownState>(INITIAL_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const firedMilestones = useRef<Set<string>>(new Set());

  const tick = useCallback(() => {
    if (!targetTime) return;

    const now = Date.now();
    const remaining = targetTime.getTime() - now;

    if (remaining <= 0) {
      setState({
        ...msToTimeComponents(0),
        totalRemaining: 0,
        progress: 1,
        isComplete: true,
      });
      onComplete?.();
      return;
    }

    const fiveMin = 5 * 60 * 1000;
    const oneMin = 60 * 1000;

    if (remaining <= fiveMin && remaining > fiveMin - 1000 && !firedMilestones.current.has("5min")) {
      firedMilestones.current.add("5min");
      onMilestone?.("5min");
    }
    if (remaining <= oneMin && remaining > oneMin - 1000 && !firedMilestones.current.has("1min")) {
      firedMilestones.current.add("1min");
      onMilestone?.("1min");
    }

    const elapsed = totalDuration - remaining;
    const progress = totalDuration > 0 ? Math.min(elapsed / totalDuration, 1) : 0;

    setState({
      ...msToTimeComponents(remaining),
      totalRemaining: remaining,
      progress,
      isComplete: false,
    });
  }, [targetTime, totalDuration, onComplete, onMilestone]);

  useEffect(() => {
    if (!targetTime) {
      setState(INITIAL_STATE);
      return;
    }

    firedMilestones.current.clear();
    tick();

    intervalRef.current = setInterval(tick, ONE_SECOND);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetTime, tick]);

  return state;
}

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveals `target` gradually while `active` so large WS bursts look smooth.
 * When inactive, returns `target` immediately (no lag after stream ends).
 */
export function useSmoothReveal(target: string, active: boolean): string {
  const [shown, setShown] = useState(() => (active ? "" : target));
  const lenRef = useRef(active ? 0 : target.length);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    if (!active) {
      lenRef.current = targetRef.current.length;
      setShown(targetRef.current);
      return;
    }

    let raf = 0;
    let alive = true;

    const tick = () => {
      if (!alive) return;
      const full = targetRef.current;
      let len = lenRef.current;

      if (len > full.length) {
        len = 0;
        lenRef.current = 0;
      }

      if (len < full.length) {
        const backlog = full.length - len;
        const step =
          backlog > 120 ? 12 : backlog > 60 ? 6 : backlog > 24 ? 3 : 2;
        len = Math.min(full.length, len + step);
        lenRef.current = len;
        setShown(full.slice(0, len));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [active]);

  return active ? shown : target;
}

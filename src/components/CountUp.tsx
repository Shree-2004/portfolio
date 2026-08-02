"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CountUpProps {
  target: number;
  suffix?: string;
  trigger: boolean;
  className?: string;
}

export default function CountUp({ target, suffix = "", trigger, className }: CountUpProps) {
  const decimals = (String(target).split(".")[1] || "").length;
  const [value, setValue] = useState(0);
  const started = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!trigger || started.current) return;
    started.current = true;

    if (reduced) {
      // Reduced-motion users see the final number immediately, no count-up.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(target);
      return;
    }

    const start = performance.now();
    const dur = 1100;
    let raf: number;

    function step(now: number) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [trigger, target, reduced]);

  return (
    <span className={className}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

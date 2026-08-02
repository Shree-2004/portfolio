"use client";

import { useEffect, useState } from "react";

function readPreference() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useReducedMotion() {
  // Lazy initializer: resolved synchronously during the client's first render,
  // so consumers (e.g. BootSequence) never see a stale "false" before it flips.
  const [reduced, setReduced] = useState(readPreference);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

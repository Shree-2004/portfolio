"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const LINES = [
  "$ agentsentinel run --target=shree-londhe --suite=portfolio",
  "> loading agent profile... OK",
  "> executing 4 test cases...",
  "> aggregating scores... OK",
  "> run complete — status: PASS",
];

interface BootSequenceProps {
  onDone: () => void;
}

export default function BootSequence({ onDone }: BootSequenceProps) {
  const reduced = useReducedMotion();
  const [hidden, setHidden] = useState(false);
  const [lineText, setLineText] = useState<string[]>(Array(LINES.length).fill(""));
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    doneRef.current = true;

    if (reduced) {
      // Reduced-motion users skip the boot animation entirely.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHidden(true);
      onDone();
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function typeLine(li: number) {
      if (cancelled) return;
      if (li >= LINES.length) {
        timers.push(
          setTimeout(() => {
            setHidden(true);
            onDone();
          }, 350)
        );
        return;
      }
      const full = LINES[li];
      let ci = 0;
      function tick() {
        if (cancelled) return;
        setLineText((prev) => {
          const next = [...prev];
          next[li] = full.slice(0, ci);
          return next;
        });
        ci++;
        if (ci <= full.length) {
          timers.push(setTimeout(tick, 14));
        } else {
          timers.push(setTimeout(() => typeLine(li + 1), 220));
        }
      }
      tick();
    }

    typeLine(0);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  if (reduced) return null;

  return (
    <div id="boot" className={hidden ? "hidden" : ""}>
      <div className="lines">
        {LINES.map((full, i) => {
          const isLast = i === LINES.length - 1;
          const typed = lineText[i];
          const complete = typed === full;
          return (
            <div className="line" key={full}>
              {complete ? (
                <>
                  {full.replace("OK", "").replace("PASS", "")}
                  {full.includes("OK") && <span className="ok">OK</span>}
                  {full.includes("PASS") && <span className="ok">PASS</span>}
                  {isLast && complete && <span className="caret" />}
                </>
              ) : (
                typed
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

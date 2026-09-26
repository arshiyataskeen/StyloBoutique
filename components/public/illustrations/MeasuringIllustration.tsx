"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SPARKLES = [
  { cx: 158, cy: 78, delay: 0 },
  { cx: 178, cy: 118, delay: 0.7 },
  { cx: 140, cy: 132, delay: 1.4 },
];

/**
 * A tailor bends slightly to measure a customer's shoulder-to-hem length.
 * The forearm rocks gently as if taking the reading, the tape line pulses
 * taut, and a few sparkles mark the spots being measured.
 */
export default function MeasuringIllustration({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const loop = reduced ? 0 : Infinity;

  return (
    <svg
      viewBox="0 0 240 200"
      className={className}
      role="img"
      aria-label="Tailor taking a customer's measurements"
    >
      <line x1="18" y1="182" x2="222" y2="182" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="3 5" />

      {/* Customer — stands still, back to the viewer, arms relaxed */}
      <g>
        <circle cx="168" cy="88" r="11" fill="var(--color-accent)" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1.75" />
        <path
          d="M150,140 Q150,104 168,101 Q186,104 186,140 L183,178 L172,178 L170,148 L166,148 L164,178 L153,178 Z"
          fill="var(--color-accent)"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </g>

      {/* Tailor — bent forward slightly, one arm extended to hold the tape */}
      <g>
        <circle cx="62" cy="68" r="11" fill="var(--color-accent)" fillOpacity="0.16" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.75" />
        <path
          d="M46,120 Q45,84 62,80 Q80,84 82,118 L86,178 L75,178 L71,132 L67,132 L65,178 L54,178 Z"
          fill="var(--color-accent)"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeOpacity="0.85"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />

        <motion.g
          style={{ transformOrigin: "80px 92px" }}
          animate={{ rotate: [-4, 5, -4] }}
          transition={{ duration: 2.2, repeat: loop, ease: "easeInOut" }}
        >
          <path
            d="M80,92 Q108,100 128,112"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.85"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </motion.g>
      </g>

      {/* Tape measure stretched between the two — ticks plus a taut pulse */}
      <motion.g
        style={{ transformOrigin: "128px 112px" }}
        animate={{ scaleX: [1, 1.035, 1] }}
        transition={{ duration: 1.7, repeat: loop, ease: "easeInOut" }}
      >
        <line x1="128" y1="112" x2="160" y2="122" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
        {[0, 0.32, 0.64, 1].map((t, i) => (
          <line
            key={i}
            x1={128 + (160 - 128) * t}
            y1={112 + (122 - 112) * t - 3}
            x2={128 + (160 - 128) * t}
            y2={112 + (122 - 112) * t + 3}
            stroke="var(--color-accent)"
            strokeWidth="1.5"
          />
        ))}
        <circle cx="128" cy="112" r="3" fill="var(--color-accent)" />
        <circle cx="160" cy="122" r="3" fill="var(--color-accent)" />
      </motion.g>

      {SPARKLES.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r="2.2"
          fill="var(--color-accent)"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, delay: s.delay, repeat: loop, repeatDelay: 1.6, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

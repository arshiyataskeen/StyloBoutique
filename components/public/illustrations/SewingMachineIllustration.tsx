"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * A side-on sewing machine: the needle bobs up and down, the thread spool
 * spins, and a dashed stitch line feeds out across the fabric underneath.
 */
export default function SewingMachineIllustration({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const loop = reduced ? 0 : Infinity;

  return (
    <svg
      viewBox="0 0 240 200"
      className={className}
      role="img"
      aria-label="Sewing machine stitching fabric"
    >
      <line x1="18" y1="150" x2="222" y2="150" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="3 5" />

      {/* fabric */}
      <rect x="24" y="140" width="110" height="9" rx="2" fill="var(--color-accent)" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" />
      <motion.path
        d="M30,144.5 H120"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="7 6"
        animate={{ strokeDashoffset: [0, -26] }}
        transition={{ duration: 1.1, repeat: loop, ease: "linear" }}
      />

      {/* machine body */}
      <rect x="70" y="130" width="120" height="12" rx="3" fill="var(--color-accent)" fillOpacity="0.14" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.75" />
      <rect x="168" y="62" width="16" height="70" rx="5" fill="var(--color-accent)" fillOpacity="0.1" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.75" />
      <path
        d="M176,64 Q176,32 130,32 Q94,32 92,62"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect x="82" y="60" width="22" height="20" rx="4" fill="var(--color-accent)" fillOpacity="0.18" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.75" />

      {/* presser foot, static */}
      <path d="M86,118 L102,118 L98,130 L90,130 Z" fill="currentColor" fillOpacity="0.55" />

      {/* needle — bobs up and down */}
      <motion.line
        x1="93"
        y1="80"
        x2="93"
        y2="118"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 0.42, repeat: loop, repeatType: "loop", ease: "easeInOut" }}
      />

      {/* thread from spool to needle housing */}
      <path
        d="M130,20 Q150,50 96,60"
        fill="none"
        stroke="var(--color-accent)"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />

      {/* spool — spins slowly */}
      <motion.g
        style={{ transformOrigin: "130px 20px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: loop, ease: "linear" }}
      >
        <circle cx="130" cy="20" r="11" fill="var(--color-accent)" fillOpacity="0.16" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.75" />
        <path d="M121,15 Q130,20 121,25 M139,15 Q130,20 139,25" fill="none" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.25" />
      </motion.g>
    </svg>
  );
}

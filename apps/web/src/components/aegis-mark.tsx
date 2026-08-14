"use client";

import { useId } from "react";

export function AegisMark({ size = 32, className }: { size?: number; className?: string }) {
  const gradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0F172A" />
          <stop offset="0.55" stopColor="#0369A1" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <path
        d="M24 3.5 L41 10 V23.5 C41 34.5 33.8 42.7 24 45.5 C14.2 42.7 7 34.5 7 23.5 V10 Z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M24 3.5 L41 10 V23.5 C41 34.5 33.8 42.7 24 45.5 C14.2 42.7 7 34.5 7 23.5 V10 Z"
        stroke="white"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      <circle cx="24" cy="20" r="6.4" fill="white" fillOpacity="0.92" />
      <path d="M18.6 32.5 L24 21.5 L29.4 32.5 Z" fill="white" fillOpacity="0.92" />
      <circle cx="24" cy="20" r="6.4" fill="none" stroke="#0F172A" strokeOpacity="0.15" strokeWidth="1" />
    </svg>
  );
}

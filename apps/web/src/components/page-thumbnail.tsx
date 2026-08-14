"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";

type Props = {
  dataUrl?: string;
  label: string;
  onClick?: () => void;
  etat?: "neutre" | "selectionne" | "exclu";
  rotationDeg?: number;
  pied?: ReactNode;
};

export function PageThumbnail({ dataUrl, label, onClick, etat = "neutre", rotationDeg = 0, pied }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`group w-full overflow-hidden rounded-lg border bg-surface text-left transition-colors ${
        etat === "selectionne"
          ? "border-accent ring-1 ring-accent"
          : etat === "exclu"
            ? "border-border opacity-50"
            : "border-border hover:border-accent/40"
      }`}
    >
      <div className="relative flex h-[170px] items-center justify-center overflow-hidden bg-surface-2">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu généré localement (canvas), pas une URL distante
          <img
            src={dataUrl}
            alt={label}
            className="max-h-full max-w-full transition-transform duration-200"
            style={{ transform: `rotate(${rotationDeg}deg)` }}
            draggable={false}
          />
        ) : (
          <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
        )}

        {etat === "selectionne" && (
          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-ink">
            <Check size={12} strokeWidth={3} />
          </span>
        )}
        {etat === "exclu" && (
          <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white">
            <X size={12} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="font-mono text-xs text-muted">{label}</span>
        {pied}
      </div>
    </motion.button>
  );
}

import type { LucideIcon } from "lucide-react";
import type { EntreeAudit } from "@/lib/api";
import { libelleAction, formatHorodatage } from "./audit-labels";

export function StatCard({
  icon: Icon,
  label,
  valeur,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  valeur: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-muted">
        <Icon size={15} />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold tracking-tight">{valeur}</p>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </div>
  );
}

export function LigneAudit({ entree }: { entree: EntreeAudit }) {
  const details = formatDetailsMetadonnees(entree.metadonnees);
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{libelleAction(entree.action)}</p>
        <p className="truncate text-xs text-muted">
          {entree.acteur?.nom ?? "Système"}
          {details && ` · ${details}`}
        </p>
      </div>
      <span className="shrink-0 font-mono text-xs text-muted">{formatHorodatage(entree.horodatage)}</span>
    </li>
  );
}

function formatDetailsMetadonnees(metadonnees: EntreeAudit["metadonnees"]): string | null {
  if (!metadonnees) return null;
  const nomFichier = metadonnees["nomFichier"];
  if (typeof nomFichier === "string") return nomFichier;
  return null;
}

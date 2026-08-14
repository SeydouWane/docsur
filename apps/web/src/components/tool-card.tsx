import Link from "next/link";
import { Laptop, ServerCog } from "lucide-react";
import type { Outil } from "@/lib/outils-catalogue";

export function ToolCard({ outil }: { outil: Outil }) {
  const Icon = outil.icon;
  const TraitementIcon = outil.traitement === "local" ? Laptop : ServerCog;

  return (
    <Link
      href={`/outils/${outil.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-accent/40"
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon size={20} strokeWidth={1.75} />
        </span>
        {outil.statut === "bientot" && (
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted">
            Bientôt
          </span>
        )}
      </div>

      <div>
        <h3 className="font-display text-sm font-bold group-hover:text-accent">{outil.nom}</h3>
        <p className="mt-1 text-sm text-muted">{outil.description}</p>
      </div>

      <div className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-muted">
        <TraitementIcon size={13} strokeWidth={1.75} />
        {outil.traitement === "local" ? "Traitement local" : "Traitement serveur chiffré"}
      </div>
    </Link>
  );
}

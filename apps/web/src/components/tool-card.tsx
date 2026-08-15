"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Laptop, ServerCog } from "lucide-react";
import { trouverOutil, couleurCategorie } from "@/lib/outils-catalogue";

// Reçoit un slug plutôt que l'objet Outil : Outil.icon est un composant
// (fonction), non sérialisable à travers la frontière server/client. La
// résolution se fait ici, côté client, à partir du catalogue.
export function ToolCard({ slug }: { slug: string }) {
  const outil = trouverOutil(slug);
  if (!outil) return null;

  const Icon = outil.icon;
  const TraitementIcon = outil.traitement === "local" ? Laptop : ServerCog;
  const couleur = couleurCategorie(slug);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ y: 0, scale: 0.99 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/outils/${outil.slug}`}
        className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-accent/40 hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110"
            style={{ backgroundColor: `var(--${couleur}-soft)`, color: `var(--${couleur})` }}
          >
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
    </motion.div>
  );
}

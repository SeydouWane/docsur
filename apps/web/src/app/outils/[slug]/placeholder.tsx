"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Laptop, ServerCog } from "lucide-react";
import { trouverOutil, trouverCategorieDe } from "@/lib/outils-catalogue";

// Reçoit un slug plutôt que l'icône résolue : les composants d'icône ne sont
// pas sérialisables à travers la frontière server/client. La résolution se
// fait ici, côté client, à partir du catalogue.
export function ToolPlaceholder({ slug }: { slug: string }) {
  const outil = trouverOutil(slug);
  if (!outil) return null;

  const categorie = trouverCategorieDe(slug);
  const Icon = outil.icon;
  const TraitementIcon = outil.traitement === "local" ? Laptop : ServerCog;

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <motion.span
        initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft text-accent"
      >
        <Icon size={26} strokeWidth={1.75} />
      </motion.span>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="mt-6 font-mono text-xs uppercase tracking-wider text-accent">
          {categorie?.label ?? "Outils"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">{outil.nom}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">{outil.description}</p>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted">
          <TraitementIcon size={13} strokeWidth={1.75} />
          {outil.traitement === "local" ? "Traitement local prévu" : "Traitement serveur chiffré prévu"}
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-border bg-surface px-6 py-8">
          <p className="font-medium">Cet outil arrive bientôt.</p>
          <p className="mt-1 text-sm text-muted">
            Il suit la feuille de route du pilier 3 — voir le{" "}
            <a href="/docs/specifications.html#s9" className="text-accent">
              calendrier dans les spécifications
            </a>
            .
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/outils/fusionner"
            className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink"
          >
            Essayer la fusion PDF, déjà disponible
          </Link>
          <Link
            href="/outils"
            className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink"
          >
            Retour à la boîte à outils
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

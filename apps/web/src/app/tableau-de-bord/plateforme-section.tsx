"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Ban, PlayCircle } from "lucide-react";
import { api, ApiError, type Organisation } from "@/lib/api";

export function PlateformeSection() {
  const [organisations, setOrganisations] = useState<Organisation[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const recharger = () => {
    api
      .organisations()
      .then(setOrganisations)
      .catch((err) => setErreur(err instanceof ApiError ? err.message : "Chargement impossible"));
  };

  useEffect(recharger, []);

  const basculerStatut = async (org: Organisation) => {
    const prochain = org.statut === "DESACTIVEE" ? "ACTIVE" : "DESACTIVEE";
    try {
      await api.changerStatutOrganisation(org.id, prochain);
      recharger();
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Action impossible");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="font-display text-lg font-bold">Organisations</h2>
        <span className="rounded-full bg-good-soft px-2 py-0.5 font-mono text-[11px] text-good">
          Vue plateforme
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        Toutes les organisations d&apos;Aegis-Num, tous secteurs confondus.
      </p>

      {erreur && (
        <p className="mt-4 rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
          {erreur}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {(organisations ?? []).map((org) => (
          <li
            key={org.id}
            className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{org.nom}</p>
              <p className="truncate text-xs text-muted">
                {org.domaineEmail} · {org.type === "INDIVIDUEL" ? "Particulier" : "Entreprise"} ·{" "}
                {org._count.utilisateurs} compte{org._count.utilisateurs > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${
                  org.statut === "DESACTIVEE" ? "bg-surface-2 text-muted" : "bg-good-soft text-good"
                }`}
              >
                {org.statut === "DESACTIVEE" ? "Désactivée" : "Active"}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => basculerStatut(org)}
                aria-label={org.statut === "DESACTIVEE" ? "Réactiver" : "Désactiver"}
                className="rounded-md border border-border p-1.5 text-muted hover:text-ink"
              >
                {org.statut === "DESACTIVEE" ? <PlayCircle size={14} /> : <Ban size={14} />}
              </motion.button>
            </div>
          </li>
        ))}
        {organisations && organisations.length === 0 && (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            Aucune organisation pour l&apos;instant.
          </p>
        )}
      </ul>
    </div>
  );
}

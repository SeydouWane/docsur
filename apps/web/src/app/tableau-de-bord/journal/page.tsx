"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api, ApiError, type EntreeAudit } from "@/lib/api";
import { useDashboard } from "../dashboard-context";
import { LigneAudit } from "../dashboard-ui";

export default function JournalPage() {
  const { profil } = useDashboard();
  const [entrees, setEntrees] = useState<EntreeAudit[] | null>(null);
  const [filtre, setFiltre] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    const identifiant = setTimeout(() => {
      api
        .audit({ limite: 100, action: filtre.trim() || undefined })
        .then(setEntrees)
        .catch((err) => setErreur(err instanceof ApiError ? err.message : "Chargement impossible"));
    }, 250);
    return () => clearTimeout(identifiant);
  }, [filtre]);

  const titre = profil.estSuperAdmin
    ? "Journal plateforme"
    : profil.role === "ADMIN" && profil.organisation.type === "ENTREPRISE"
      ? "Journal d'activité"
      : "Mon activité";

  const description = profil.estSuperAdmin
    ? "Toutes les actions enregistrées sur Aegis-Num, tous secteurs confondus."
    : profil.role === "ADMIN" && profil.organisation.type === "ENTREPRISE"
      ? `Les actions de tous les collaborateurs de ${profil.organisation.nom}.`
      : "L'historique de vos propres actions sur les outils Aegis-Num.";

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight">{titre}</h1>
      <p className="mt-1 text-sm text-muted">{description}</p>

      <div className="relative mt-6 max-w-sm">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          placeholder="Filtrer par action (ex. signature, ocr…)"
          className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </div>

      {erreur && (
        <p className="mt-4 rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
          {erreur}
        </p>
      )}

      {entrees === null ? (
        <div className="mt-4 h-64 animate-pulse rounded-lg bg-surface-2" />
      ) : entrees.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          {filtre ? "Aucune action ne correspond à ce filtre." : "Aucune action enregistrée pour l'instant."}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {entrees.map((entree) => (
            <LigneAudit key={entree.id} entree={entree} />
          ))}
        </ul>
      )}
    </div>
  );
}

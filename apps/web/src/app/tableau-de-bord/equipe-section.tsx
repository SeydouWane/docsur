"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { UserX, UserCheck, Plus } from "lucide-react";
import { api, ApiError, type Membre, type Workspace } from "@/lib/api";

const ROLE_LABEL: Record<Membre["role"], string> = {
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  COLLABORATEUR: "Collaborateur",
  INVITE_EXTERNE: "Invité externe",
};

export function EquipeSection({ monId }: { monId: string }) {
  const [membres, setMembres] = useState<Membre[] | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [nomEquipe, setNomEquipe] = useState("");
  const [creation, setCreation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const recharger = () => {
    Promise.all([api.membres(), api.workspaces()])
      .then(([m, w]) => {
        setMembres(m);
        setWorkspaces(w);
      })
      .catch((err) => setErreur(err instanceof ApiError ? err.message : "Chargement impossible"));
  };

  useEffect(recharger, []);

  const basculerStatut = async (membre: Membre) => {
    const prochain = membre.statut === "SUSPENDU" ? "ACTIF" : "SUSPENDU";
    try {
      await api.changerStatutMembre(membre.id, prochain);
      recharger();
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Action impossible");
    }
  };

  const creerEquipe = async (e: FormEvent) => {
    e.preventDefault();
    if (!nomEquipe.trim()) return;
    setCreation(true);
    try {
      await api.creerWorkspace(nomEquipe.trim());
      setNomEquipe("");
      recharger();
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "Création impossible");
    } finally {
      setCreation(false);
    }
  };

  return (
    <div className="mt-10 space-y-10">
      {erreur && (
        <p className="rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
          {erreur}
        </p>
      )}

      <div>
        <h2 className="font-display text-lg font-bold">Équipe</h2>
        <p className="mt-1 text-sm text-muted">
          Activez ou désactivez l&apos;accès d&apos;un collaborateur de votre organisation.
        </p>
        <ul className="mt-4 space-y-2">
          {(membres ?? []).map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{m.nom}</p>
                <p className="truncate text-xs text-muted">
                  {m.email} · {ROLE_LABEL[m.role]}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${
                    m.statut === "SUSPENDU" ? "bg-surface-2 text-muted" : "bg-good-soft text-good"
                  }`}
                >
                  {m.statut === "SUSPENDU" ? "Désactivé" : "Actif"}
                </span>
                {m.id !== monId && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => basculerStatut(m)}
                    aria-label={m.statut === "SUSPENDU" ? "Réactiver" : "Désactiver"}
                    className="rounded-md border border-border p-1.5 text-muted hover:text-ink"
                  >
                    {m.statut === "SUSPENDU" ? <UserCheck size={14} /> : <UserX size={14} />}
                  </motion.button>
                )}
              </div>
            </li>
          ))}
          {membres && membres.length === 0 && (
            <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
              Aucun collaborateur pour l&apos;instant.
            </p>
          )}
        </ul>
      </div>

      <div>
        <h2 className="font-display text-lg font-bold">Espaces de travail</h2>
        <p className="mt-1 text-sm text-muted">
          Les démembrements de votre organisation — équipe RH, finance, juridique…
        </p>
        <ul className="mt-4 space-y-2">
          {(workspaces ?? []).map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-sm"
            >
              <span className="font-medium">{w.nom}</span>
              <span className="text-xs text-muted">
                {w._count.membres} membre{w._count.membres > 1 ? "s" : ""} · {w._count.documents} document
                {w._count.documents > 1 ? "s" : ""}
              </span>
            </li>
          ))}
        </ul>
        <form onSubmit={creerEquipe} className="mt-3 flex gap-2">
          <input
            value={nomEquipe}
            onChange={(e) => setNomEquipe(e.target.value)}
            placeholder="Ex. Équipe Finance"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={creation || !nomEquipe.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            <Plus size={14} />
            Créer
          </motion.button>
        </form>
      </div>
    </div>
  );
}
